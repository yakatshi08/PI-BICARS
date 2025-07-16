"""
Authentication endpoints with JWT and 2FA
Conformément aux prompts 32-33 du cahier des charges
"""

from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict
import pyotp
from datetime import datetime, timedelta

from app.core import security
from app.core.config import settings
from app.core.database import get_db
from app.models.schemas import (
    UserCreate, UserLogin, Token, TokenData, 
    UserResponse, TwoFactorSetup, TwoFactorVerify
)
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Enregistrement avec validation RGPD (Prompt 34)"""
    auth_service = AuthService(db)
    
    # Vérifier si l'email existe déjà
    if await auth_service.get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email déjà enregistré"
        )
    
    # Créer l'utilisateur avec hash du mot de passe
    user = await auth_service.create_user(user_data)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at
    )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login avec support 2FA (Prompt 32)"""
    auth_service = AuthService(db)
    
    # Authentifier l'utilisateur
    user = await auth_service.authenticate_user(
        form_data.username, 
        form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Si 2FA activé, retourner un token temporaire
    if user.two_factor_enabled:
        temp_token = security.create_temp_token(user.id)
        return Token(
            access_token=temp_token,
            token_type="2fa_required",
            requires_2fa=True
        )
    
    # Créer le token JWT
    access_token = security.create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )
    
    # Log de connexion pour audit (Prompt 35)
    await auth_service.log_login(user.id, form_data.username)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        requires_2fa=False
    )

@router.post("/2fa/setup", response_model=TwoFactorSetup)
async def setup_2fa(
    current_user=Depends(security.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Configuration 2FA avec TOTP (Prompt 32)"""
    auth_service = AuthService(db)
    
    # Générer secret TOTP
    secret = pyotp.random_base32()
    
    # Sauvegarder le secret (chiffré)
    await auth_service.save_2fa_secret(current_user.id, secret)
    
    # Générer QR code
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_user.email,
        issuer_name=settings.APP_NAME
    )
    
    return TwoFactorSetup(
        secret=secret,
        qr_code=totp_uri,
        backup_codes=await auth_service.generate_backup_codes(current_user.id)
    )

@router.post("/2fa/verify", response_model=Token)
async def verify_2fa(
    data: TwoFactorVerify,
    db: AsyncSession = Depends(get_db)
):
    """Vérification 2FA et émission du token final"""
    auth_service = AuthService(db)
    
    # Vérifier le code TOTP
    is_valid = await auth_service.verify_2fa_code(
        data.temp_token,
        data.code
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Code 2FA invalide"
        )
    
    # Récupérer l'utilisateur depuis le token temporaire
    user_id = security.decode_temp_token(data.temp_token)
    user = await auth_service.get_user(user_id)
    
    # Créer le token JWT final
    access_token = security.create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        requires_2fa=False
    )

@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user=Depends(security.get_current_user)
):
    """Rafraîchissement du token JWT"""
    access_token = security.create_access_token(
        data={"sub": str(current_user.id), "role": current_user.role}
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        requires_2fa=False
    )

@router.post("/logout")
async def logout(
    current_user=Depends(security.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Déconnexion avec révocation du token"""
    auth_service = AuthService(db)
    
    # Révoquer le token dans Redis
    await auth_service.revoke_token(current_user.id)
    
    # Log de déconnexion pour audit
    await auth_service.log_logout(current_user.id)
    
    return {"message": "Déconnexion réussie"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user=Depends(security.get_current_user)
):
    """Récupérer les informations de l'utilisateur connecté"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        two_factor_enabled=current_user.two_factor_enabled
    )

@router.post("/audit-log")
async def get_audit_log(
    current_user=Depends(security.get_current_user),
    db: AsyncSession = Depends(get_db),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Récupérer les logs d'audit (Prompt 35)"""
    if current_user.role not in ["admin", "compliance"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    auth_service = AuthService(db)
    logs = await auth_service.get_audit_logs(
        user_id=current_user.id if current_user.role != "admin" else None,
        start_date=start_date,
        end_date=end_date
    )
    
    return {"audit_logs": logs}