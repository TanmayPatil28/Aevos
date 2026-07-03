import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30  # seconds

def test_post_negotiator_missing_prompt():
    url = f"{BASE_URL}/api/negotiator"
    headers = {
        "Content-Type": "application/json"
        # No Authorization header to simulate unauthenticated request
    }
    payload = {
        # Intentionally omit 'prompt' field
        "intent": "conversational"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT, allow_redirects=False)
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"

    # The API is protected: expect either 400 Bad Request or 307 redirect to /auth
    assert response.status_code in (400, 307), f"Unexpected status code {response.status_code}"

    if response.status_code == 307:
        # Check location header for redirect to /auth
        location = response.headers.get("location", "")
        assert location.endswith("/auth") or "/auth" in location, f"Redirect location unexpected: {location}"
    elif response.status_code == 400:
        # Optional: response content may include error details, but not required
        content_type = response.headers.get("Content-Type", "")
        assert "application/json" in content_type or "text" in content_type.lower()
        # Further checks can be done if error format is known

test_post_negotiator_missing_prompt()