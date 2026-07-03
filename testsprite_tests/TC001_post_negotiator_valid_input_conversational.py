import requests

def test_post_negotiator_valid_input_conversational():
    base_url = "http://localhost:3000"
    url = f"{base_url}/api/negotiator"
    payload = {
        "intent": "conversational",
        "prompt": "What are my academic strengths this semester?"
    }
    headers = {
        "Content-Type": "application/json"
    }
    timeout = 30

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=timeout, allow_redirects=False)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Since unauthenticated requests are redirected with 307 to /auth
    assert response.status_code == 307, f"Expected status code 307, got {response.status_code}"
    location = response.headers.get("Location", "")
    assert location.endswith("/auth"), f"Expected redirect Location header to end with /auth, got: {location}"

test_post_negotiator_valid_input_conversational()