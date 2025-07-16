from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
from datetime import datetime

app = FastAPI(title="FinTech Analysis Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to FinTech Analysis Platform API"}

@app.get("/api/v1/dashboard/metrics")
def metrics():
    return {
        "npl_ratio": round(random.uniform(2.0, 3.5), 2),
        "cet1_ratio": round(random.uniform(14.0, 16.5), 2),
        "lcr": round(random.uniform(135, 150), 0),
        "roe": round(random.uniform(10.0, 14.0), 2)
    }

@app.get("/api/v1/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}