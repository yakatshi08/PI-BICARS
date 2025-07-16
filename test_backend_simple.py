import requests

# Test de santé
response = requests.get("http://localhost:8000/health")
print("Health check:", response.json())

# Test du copilot
data = {
    "query": "test",
    "context": {"sector": "banking"}
}
response = requests.post("http://localhost:8000/api/copilot/chat", json=data)
print("Status:", response.status_code)
print("Response:", response.text)