import subprocess
import time
import json
import urllib.request
import urllib.error
import socket
import os
import sys

SOLVER_URL = "http://127.0.0.1:8001/solve"
HEALTH_URL = "http://127.0.0.1:8001/openapi.json"

def check_port_open(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        try:
            s.connect((host, port))
            return True
        except (socket.timeout, ConnectionRefusedError):
            return False

def run_post_request(url, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url, 
        data=data, 
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            res_body = response.read().decode('utf-8')
            return response.status, json.loads(res_body)
    except urllib.error.HTTPError as e:
        res_body = e.read().decode('utf-8')
        try:
            parsed = json.loads(res_body)
        except Exception:
            parsed = res_body
        return e.code, parsed
    except Exception as e:
        return 500, str(e)

def test_solver():
    print("=== Solver Microservice Stress Testing ===")
    
    # Check if solver is already running. If so, fail or reuse. We prefer spawning it fresh.
    if check_port_open("127.0.0.1", 8001):
        print("WARNING: Port 8001 is already open. Attempting to run tests directly.")
        spawned = False
    else:
        print("Spawning engine/solver.py...")
        # Spawning solver
        python_cmds = ['py', 'python3', 'python']
        proc = None
        for cmd in python_cmds:
            try:
                proc = subprocess.Popen([cmd, "engine/solver.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                # Wait a bit
                time.sleep(0.5)
                if proc.poll() is None:
                    print(f"Successfully spawned solver with {cmd}")
                    break
            except Exception as e:
                print(f"Failed spawning with {cmd}: {e}")
        
        if not proc or proc.poll() is not None:
            print("ERROR: Could not spawn solver process.")
            sys.exit(1)
        spawned = True

    # Poll health
    healthy = False
    for _ in range(20):
        try:
            with urllib.request.urlopen(HEALTH_URL, timeout=1) as response:
                if response.status == 200:
                    healthy = True
                    break
        except Exception:
            pass
        time.sleep(0.5)

    if not healthy:
        print("ERROR: Solver did not become healthy.")
        if spawned:
            proc.kill()
        sys.exit(1)
    
    print("Solver is healthy. Running test cases...")

    results = []

    # Test Case 1: Standard Payload
    print("\n[Test Case 1] Standard Payload")
    payload1 = {
        "schedule": [
            {"id": "s1", "courseCode": "CS101", "title": "Intro CS", "type": "lecture", "dayOfWeek": "Monday", "startTime": "09:00", "endTime": "10:00", "isMandatory": False, "penaltyWeight": 0.5},
            {"id": "s2", "courseCode": "CS102", "title": "CS Lab", "type": "lab", "dayOfWeek": "Tuesday", "startTime": "10:00", "endTime": "12:00", "isMandatory": True, "penaltyWeight": 1.0}
        ],
        "availableSafeBunks": 1,
        "currentRuinRisk": 0.1,
        "constraints": []
    }
    status, body = run_post_request(SOLVER_URL, payload1)
    print(f"Status: {status}")
    print(f"Response: {json.dumps(body, indent=2)}")
    tc1_passed = (status == 200 and "s1" in body.get("classesToSkip", []) and "s2" in body.get("classesToAttend", []))
    results.append(("Standard Payload", tc1_passed, body))

    # Test Case 2: Block Time Constraint (Monday priority)
    # With availableSafeBunks = 1, and each class having penaltyWeight = 0.8:
    # If we skip both, penalty is 1.6 (scaled: 16), which exceeds available bunks (1.0, scaled: 10).
    # Thus, we can only skip one class.
    # The solver must choose s1 (Monday) over s2 (Tuesday) because Monday is the targetDay.
    print("\n[Test Case 2] Block Time Constraint")
    payload2 = {
        "schedule": [
            {"id": "s1", "courseCode": "CS101", "title": "Intro CS", "type": "lecture", "dayOfWeek": "Monday", "startTime": "09:00", "endTime": "10:00", "isMandatory": False, "penaltyWeight": 0.8},
            {"id": "s2", "courseCode": "CS102", "title": "CS Lecture 2", "type": "lecture", "dayOfWeek": "Tuesday", "startTime": "10:00", "endTime": "11:00", "isMandatory": False, "penaltyWeight": 0.8}
        ],
        "availableSafeBunks": 1,
        "currentRuinRisk": 0.1,
        "constraints": [
            {"type": "block_time", "targetDays": ["Monday"]}
        ]
    }
    status, body = run_post_request(SOLVER_URL, payload2)
    print(f"Status: {status}")
    print(f"Response: {json.dumps(body, indent=2)}")
    tc2_passed = (status == 200 and "s1" in body.get("classesToSkip", []) and "s2" in body.get("classesToAttend", []))
    results.append(("Block Time Constraint", tc2_passed, body))

    # Test Case 3: Skip Specific Constraint
    # With availableSafeBunks = 1, and each class having penaltyWeight = 0.8:
    # If we skip both, penalty is 1.6 (exceeds 1.0 limit).
    # The solver must choose s2 (Special Seminar) because it matches "Seminar".
    print("\n[Test Case 3] Skip Specific Constraint")
    payload3 = {
        "schedule": [
            {"id": "s1", "courseCode": "CS101", "title": "Intro CS", "type": "lecture", "dayOfWeek": "Monday", "startTime": "09:00", "endTime": "10:00", "isMandatory": False, "penaltyWeight": 0.8},
            {"id": "s2", "courseCode": "CS102", "title": "Special Seminar", "type": "lecture", "dayOfWeek": "Tuesday", "startTime": "10:00", "endTime": "11:00", "isMandatory": False, "penaltyWeight": 0.8}
        ],
        "availableSafeBunks": 1,
        "currentRuinRisk": 0.1,
        "constraints": [
            {"type": "skip_specific", "targetClass": "Seminar"}
        ]
    }
    status, body = run_post_request(SOLVER_URL, payload3)
    print(f"Status: {status}")
    print(f"Response: {json.dumps(body, indent=2)}")
    tc3_passed = (status == 200 and "s2" in body.get("classesToSkip", []) and "s1" in body.get("classesToAttend", []))
    results.append(("Skip Specific Constraint", tc3_passed, body))

    # Test Case 4: Grade Impact Constraint (Negative utility for high penalty weight)
    print("\n[Test Case 4] Grade Impact Constraint")
    payload4 = {
        "schedule": [
            {"id": "s1", "courseCode": "CS101", "title": "Intro CS", "type": "lecture", "dayOfWeek": "Monday", "startTime": "09:00", "endTime": "10:00", "isMandatory": False, "penaltyWeight": 0.2},
            {"id": "s2", "courseCode": "CS102", "title": "CS Advanced", "type": "lecture", "dayOfWeek": "Tuesday", "startTime": "10:00", "endTime": "11:00", "isMandatory": False, "penaltyWeight": 0.8}
        ],
        "availableSafeBunks": 1,
        "currentRuinRisk": 0.1,
        "constraints": [
            {"type": "grade_impact"}
        ]
    }
    status, body = run_post_request(SOLVER_URL, payload4)
    print(f"Status: {status}")
    print(f"Response: {json.dumps(body, indent=2)}")
    tc4_passed = (status == 200 and len(body.get("classesToSkip", [])) == 0 and "s1" in body.get("classesToAttend", []) and "s2" in body.get("classesToAttend", []))
    results.append(("Grade Impact Constraint", tc4_passed, body))

    # Test Case 5: Infeasible Constraint (Negative safe bunks)
    print("\n[Test Case 5] Infeasible Constraint")
    payload5 = {
        "schedule": [
            {"id": "s1", "courseCode": "CS101", "title": "Intro CS", "type": "lecture", "dayOfWeek": "Monday", "startTime": "09:00", "endTime": "10:00", "isMandatory": False, "penaltyWeight": 0.5}
        ],
        "availableSafeBunks": -1,
        "currentRuinRisk": 0.1,
        "constraints": []
    }
    status, body = run_post_request(SOLVER_URL, payload5)
    print(f"Status: {status}")
    print(f"Response: {json.dumps(body, indent=2)}")
    tc5_passed = (status == 200 and len(body.get("classesToSkip", [])) == 0 and "s1" in body.get("classesToAttend", []) and body.get("freedHours") == 0)
    results.append(("Infeasible Constraint", tc5_passed, body))

    # Test Case 6: Large Scale Input (100 sessions)
    print("\n[Test Case 6] Large Scale Input")
    large_schedule = []
    for i in range(100):
        is_mandatory = (i % 2 == 0)
        large_schedule.append({
            "id": f"sess_{i}",
            "courseCode": f"CS{100+i}",
            "title": f"Course {i}",
            "type": "lecture" if not is_mandatory else "lab",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i % 5],
            "startTime": "09:00",
            "endTime": "10:00",
            "isMandatory": is_mandatory,
            "penaltyWeight": 0.2
        })
    payload6 = {
        "schedule": large_schedule,
        "availableSafeBunks": 5, # We can skip up to 25 optional sessions (since penalty is 0.2 * 25 = 5.0)
        "currentRuinRisk": 0.1,
        "constraints": []
    }
    start_time = time.time()
    status, body = run_post_request(SOLVER_URL, payload6)
    elapsed = time.time() - start_time
    print(f"Status: {status}")
    print(f"Time taken: {elapsed:.4f}s")
    print(f"Freed hours (skipped classes): {body.get('freedHours')}")
    tc6_passed = (status == 200 and body.get("freedHours") == 25 and elapsed < 2.0)
    results.append(("Large Scale Input", tc6_passed, {"freedHours": body.get("freedHours"), "elapsed": elapsed}))

    # Test Case 7: Invalid Input Validation (Missing schedule)
    print("\n[Test Case 7] Invalid Input Validation")
    payload7 = {
        "availableSafeBunks": 1,
        "currentRuinRisk": 0.1,
        "constraints": []
    }
    status, body = run_post_request(SOLVER_URL, payload7)
    print(f"Status: {status}")
    print(f"Response: {json.dumps(body, indent=2)}")
    tc7_passed = (status == 422)
    results.append(("Invalid Input Validation", tc7_passed, body))

    # Stop solver
    if spawned:
        print("\nStopping FastAPI solver process...")
        proc.terminate()
        proc.wait()
        
        # Verify port 8001 is closed (clean shutdown, no port leaks)
        print("Verifying port 8001 is closed...")
        time.sleep(1.0)
        port_open = check_port_open("127.0.0.1", 8001)
        if not port_open:
            print("Port 8001 is successfully closed.")
            port_closed = True
        else:
            print("Port 8001 is still open!")
            port_closed = False
    else:
        port_closed = True

    print("\n=== Stress Test Summary ===")
    all_passed = True
    for name, passed, _ in results:
        status_str = "PASS" if passed else "FAIL"
        print(f"{name}: {status_str}")
        if not passed:
            all_passed = False
    
    if not port_closed:
        all_passed = False

    return all_passed, results, port_closed

if __name__ == "__main__":
    success, res, closed = test_solver()
    sys.exit(0 if success else 1)
