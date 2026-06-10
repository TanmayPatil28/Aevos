import urllib.request
import json
import urllib.error

endpoints = [
    "/api/terminal/ai",
    "/api/parse",
    "/api/parse/resume",
    "/api/narrative",
    "/api/jarvis",
    "/api/chat",
    "/api/career/skill-gap",
    "/api/career/progress",
    "/api/career/prep-rounds",
    "/api/career/insights",
    "/api/career/goals"
]

base_url = "http://localhost:3000"

results = []

for endpoint in endpoints:
    url = f"{base_url}{endpoint}"
    req = urllib.request.Request(url, method="POST")
    req.add_header('Content-Type', 'application/json')
    data = json.dumps({"prompt": "hello", "context": {}}).encode('utf-8')
    try:
        urllib.request.urlopen(req, data=data)
        results.append((endpoint, "Failed - did not return 401 (got 200)"))
    except urllib.error.HTTPError as e:
        if e.code == 401:
            results.append((endpoint, "Pass - 401 Unauthorized"))
        else:
            results.append((endpoint, f"Failed - returned {e.code}"))
    except Exception as e:
        results.append((endpoint, f"Error - {str(e)}"))

print("Security Test Results:")
for endpoint, status in results:
    print(f"{endpoint}: {status}")
