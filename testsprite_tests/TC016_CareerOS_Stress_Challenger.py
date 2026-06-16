import urllib.request
import json
import urllib.error
import asyncio
import time
import sys

BASE_URL = "http://localhost:3000/api/career/skills"

def send_post(data, content_type="application/json"):
    req = urllib.request.Request(
        BASE_URL,
        data=data if isinstance(data, bytes) else json.dumps(data).encode("utf-8"),
        headers={"Content-Type": content_type},
        method="POST"
    )
    with urllib.request.urlopen(req) as response:
        return response.status, json.loads(response.read().decode("utf-8"))

def send_get():
    req = urllib.request.Request(BASE_URL, method="GET")
    with urllib.request.urlopen(req) as response:
        return response.status, json.loads(response.read().decode("utf-8"))

async def send_post_async(data):
    # Asynchronous fetch for concurrency testing
    loop = asyncio.get_event_loop()
    def sync_post():
        try:
            req = urllib.request.Request(
                BASE_URL,
                data=json.dumps(data).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req) as response:
                return response.status, json.loads(response.read().decode("utf-8"))
        except Exception as e:
            if isinstance(e, urllib.error.HTTPError):
                return e.code, str(e)
            return 500, str(e)
    return await loop.run_in_executor(None, sync_post)

async def main():
    print("=== STARTING CAREER OS INTEGRATION STRESS TEST ===")
    
    # 1. Reset skills first
    print("\n--- Test 1: Resetting skills to empty list ---")
    try:
        status, res = send_post({"skills": []})
        print(f"Status: {status}, Response: {res}")
        assert status == 200, "Reset failed"
        assert res.get("skills") == [], "Skills should be empty"
        print("Test 1 Passed.")
    except Exception as e:
        print(f"Test 1 Failed: {e}")
        sys.exit(1)

    # 2. Invalid inputs (Malformed JSON)
    print("\n--- Test 2: Sending Malformed JSON ---")
    try:
        req = urllib.request.Request(
            BASE_URL,
            data=b"{invalid-json",
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            urllib.request.urlopen(req)
            print("Failed: Allowed malformed JSON!")
            sys.exit(1)
        except urllib.error.HTTPError as e:
            body = json.loads(e.read().decode("utf-8"))
            print(f"Expected HTTP Error: {e.code}, body: {body}")
            assert e.code == 400, "Expected status 400"
            assert "Malformed JSON" in body.get("error", ""), "Expected 'Malformed JSON' error"
            print("Test 2 Passed.")
    except Exception as e:
        print(f"Test 2 Failed: {e}")
        sys.exit(1)

    # 3. Invalid inputs (Invalid data type for skills)
    print("\n--- Test 3: Sending non-array skills ---")
    invalid_inputs = [
        {"skills": "not-an-array"},
        {"skills": 123},
        {"skills": {"a": 1}},
        {"skills": None},
        {}
    ]
    for inp in invalid_inputs:
        try:
            req = urllib.request.Request(
                BASE_URL,
                data=json.dumps(inp).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            try:
                urllib.request.urlopen(req)
                print(f"Failed: Allowed invalid input: {inp}")
                sys.exit(1)
            except urllib.error.HTTPError as e:
                body = json.loads(e.read().decode("utf-8"))
                print(f"Expected HTTP Error: {e.code} for input {inp}, body: {body}")
                assert e.code == 400, "Expected status 400"
                assert "Missing or invalid skills array" in body.get("error", ""), "Expected 'Missing or invalid skills array' error"
        except Exception as e:
            print(f"Test 3 Failed during validation of {inp}: {e}")
            sys.exit(1)
    print("Test 3 Passed.")

    # 4. Long skill names and huge arrays
    print("\n--- Test 4: Sending large skills array and long skill names ---")
    long_skill = "A" * 1000 # 1000 chars skill name
    large_skills = [f"Skill_{i}" for i in range(500)] + [long_skill]
    try:
        status, res = send_post({"skills": large_skills})
        print(f"Status: {status}, returned list length: {len(res.get('skills', []))}")
        assert status == 200, "Large skills POST failed"
        assert len(res.get("skills")) == 501, "Returned list size mismatch"
        
        # Verify GET works too
        get_status, get_res = send_get()
        assert get_status == 200
        assert len(get_res.get("skills", [])) == 501
        assert long_skill in get_res.get("skills")
        print("Test 4 Passed.")
    except Exception as e:
        print(f"Test 4 Failed: {e}")
        sys.exit(1)

    # 5. Concurrency Testing
    print("\n--- Test 5: Concurrent Updates (Flood) ---")
    tasks = []
    # Prepare 50 concurrent requests updating to different subsets of skills
    for i in range(50):
        skills_subset = [f"Skill_Concurrent_{i}", "BaseSkill"]
        tasks.append(send_post_async({"skills": skills_subset}))
    
    start_time = time.time()
    results = await asyncio.gather(*tasks)
    end_time = time.time()
    print(f"Executed 50 concurrent requests in {end_time - start_time:.4f} seconds.")
    
    success_count = sum(1 for status, _ in results if status == 200)
    print(f"Successful concurrent requests: {success_count}/50")
    if success_count != 50:
        print(f"Some concurrent updates failed: {results}")
        sys.exit(1)
    else:
        print("Test 5 Passed.")
    
    # Final check of the state
    get_status, get_res = send_get()
    print(f"Final GET status: {get_status}, skills count: {len(get_res.get('skills', []))}")
    assert get_status == 200, "Final GET failed"
    
    # Reset back to something clean
    send_post({"skills": ["React", "Node.js", "TypeScript", "Next.js", "PostgreSQL", "AWS"]})
    print("\n=== ALL STRESS TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    asyncio.run(main())
