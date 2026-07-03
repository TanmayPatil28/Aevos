import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
ENDPOINT = "/api/negotiator"
URL = BASE_URL + ENDPOINT

def test_post_negotiator_empty_state():
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "prompt": "Check schedule data",
        "intent": "empty_check"
    }

    try:
        # Unauthenticated request: expect redirect to /auth (307 or 302)
        response = requests.post(URL, json=payload, headers=headers, timeout=TIMEOUT, allow_redirects=False)
        if response.status_code in (302, 307):
            location = response.headers.get("Location", "")
            assert "/auth" in location, f"Expected redirect location to contain '/auth', got {location}"
            return  # Test passed for unauthenticated case

        # Authenticated requests (simulate by sending a placeholder token)
        # Since no auth token is provided, the above should handle unauth redirect.
        # Below code is provided in case of having an auth token in real scenario.
        # As instructions don't provide auth token, skip authenticated case.

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

    # If not redirected, check response JSON for emptyState:true
    try:
        json_data = response.json()
        assert isinstance(json_data, dict), "Response JSON is not an object"
        assert "emptyState" in json_data, "'emptyState' not found in response JSON"
        assert json_data["emptyState"] is True, "Expected emptyState to be True"
    except ValueError:
        assert False, "Response is not valid JSON"

test_post_negotiator_empty_state()