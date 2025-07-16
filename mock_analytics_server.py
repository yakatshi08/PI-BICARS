"""
Serveur Mock pour tester le Module Analytics ML
Démarrage : python mock_analytics_server.py
"""

from flask import Flask, jsonify, request
from datetime import datetime
import numpy as np
import random

app = Flask(__name__)

# Configuration
app.config['JSON_SORT_KEYS'] = False

@app.route('/api/v1/health', methods=['GET'])
def health():
    """Endpoint de santé"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Analytics ML Module"
    })

@app.route('/api/v1/analytics/predict/auto', methods=['POST'])
def predict_auto():
    """Prédiction automatique avec sélection du modèle"""
    data = request.json
    
    # Validation basique
    if not data or 'data' not in data:
        return jsonify({"error": "No data provided"}), 400
    
    # Simuler une prédiction
    forecast_horizon = data.get('forecast_horizon', 30)
    predictions = [100 + np.random.normal(0, 5) for _ in range(forecast_horizon)]
    
    return jsonify({
        "selected_model": "xgboost",
        "predictions": predictions,
        "confidence_intervals": {
            "lower": [p - 10 for p in predictions],
            "upper": [p + 10 for p in predictions]
        },
        "model_scores": {
            "xgboost": 0.9234,
            "prophet": 0.8912,
            "lstm": 0.8756,
            "arima": 0.8423
        }
    })

@app.route('/api/v1/analytics/anomalies/detect', methods=['POST'])
def detect_anomalies():
    """Détection d'anomalies"""
    data = request.json
    
    # Simuler la détection d'anomalies
    n_points = len(data.get('data', []))
    n_anomalies = max(1, int(n_points * 0.05))  # 5% d'anomalies
    anomaly_indices = random.sample(range(n_points), n_anomalies) if n_points > 0 else []
    
    severity_map = {}
    explanations = {}
    
    for idx in anomaly_indices:
        severity = random.choice(['low', 'medium', 'high'])
        severity_map[str(idx)] = severity
        explanations[str(idx)] = f"Deviation of {random.randint(2, 5)} standard deviations detected"
    
    return jsonify({
        "anomalies": anomaly_indices,
        "severity_classification": severity_map,
        "explanations": explanations
    })

@app.route('/api/v1/analytics/automl/run', methods=['POST'])
def automl_run():
    """Pipeline AutoML"""
    data = request.json
    models = data.get('models_to_test', ['xgboost', 'prophet', 'lstm', 'arima'])
    
    # Simuler les résultats
    model_comparison = {}
    for model in models:
        model_comparison[model] = {
            "rmse": round(np.random.uniform(3, 8), 4),
            "mae": round(np.random.uniform(2, 6), 4),
            "mape": round(np.random.uniform(0.02, 0.08), 4)
        }
    
    best_model = min(model_comparison.keys(), key=lambda x: model_comparison[x]['rmse'])
    
    return jsonify({
        "best_model": best_model,
        "model_comparison": model_comparison,
        "recommendations": [
            f"{best_model} shows the best performance for your data",
            "Consider ensemble methods for improved accuracy",
            "Regular retraining recommended for optimal results"
        ],
        "backtesting_results": {
            "average_accuracy": 0.9234,
            "directional_accuracy": 0.8756
        }
    })

@app.route('/api/v1/analytics/scenarios/analyze', methods=['POST'])
def analyze_scenarios():
    """Analyse de scénarios"""
    data = request.json
    scenarios = data.get('scenarios', [])
    
    scenario_results = {}
    risk_metrics = {}
    
    for scenario in scenarios:
        name = scenario.get('name', 'Unknown')
        growth_rate = scenario.get('growth_rate', 0)
        volatility = scenario.get('volatility', 0.2)
        
        # Simuler les résultats
        scenario_results[name] = {
            "expected_return": growth_rate,
            "volatility": volatility,
            "sharpe_ratio": growth_rate / volatility if volatility > 0 else 0
        }
        
        risk_metrics[name] = {
            "var_95": round(-1.645 * volatility * 100, 2),
            "var_99": round(-2.326 * volatility * 100, 2),
            "volatility": volatility
        }
    
    return jsonify({
        "scenario_results": scenario_results,
        "risk_metrics": risk_metrics,
        "comparison_chart_data": {
            "scenarios": list(scenario_results.keys()),
            "expected_returns": [s["expected_return"] for s in scenario_results.values()],
            "volatilities": [s["volatility"] for s in scenario_results.values()]
        }
    })

# Gestion d'erreur 404
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

if __name__ == '__main__':
    print("="*60)
    print("🚀 Mock Server Analytics ML")
    print("="*60)
    print("📍 URL: http://localhost:8000")
    print("📍 Health check: http://localhost:8000/api/v1/health")
    print("\n✅ Le serveur est prêt pour les tests!")
    print("🛑 Appuyez sur Ctrl+C pour arrêter")
    print("="*60)
    
    # Démarrer le serveur
    app.run(host='0.0.0.0', port=8000, debug=True)
