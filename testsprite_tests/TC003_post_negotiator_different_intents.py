import requests

BASE_URL = "http://localhost:3000"
ENDPOINT = "/api/negotiator"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json"
}

def test_post_negotiator_different_intents_unauthenticated_redirect():
    url = BASE_URL + ENDPOINT
    test_payloads = [
        {"intent": "conversational", "prompt": "Explain SGPA calculation."},
        {"intent": "grade_impact", "prompt": "What happens if I get grade B?"},
        {"intent": "max_consecutive", "prompt": "Max consecutive fails possible?"},
    ]

    for payload in test_payloads:
        try:
            response = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT, allow_redirects=False)
        except requests.RequestException as e:
            assert False, f"Request failed: {e}"

        assert response.status_code == 307, f"Expected 307 redirect, got {response.status_code} for intent {payload['intent']}"
        location = response.headers.get("Location", "")
        assert "/auth" in location, f"Redirect location does not contain /auth for intent {payload['intent']}"

test_post_negotiator_different_intents_unauthenticated_redirect()