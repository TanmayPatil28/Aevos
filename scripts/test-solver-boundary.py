import sys
import os
import traceback
from typing import List

# Add the project root to sys.path to allow importing from engine
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from engine.solver import solve_schedule, SolverRequest, ClassSession, SolverConstraint

def create_session(id: str, is_mandatory: bool = False, penalty: float = 1.0, session_type: str = "lecture", title: str = "Test Course", course_code: str = "TEST101") -> ClassSession:
    return ClassSession(
        id=id,
        courseCode=course_code,
        title=title,
        type=session_type,
        dayOfWeek="Monday",
        startTime="09:00",
        endTime="10:00",
        isMandatory=is_mandatory,
        penaltyWeight=penalty
    )

def run_test_case(name: str, request: SolverRequest):
    print(f"--- Running Test: {name} ---")
    try:
        response = solve_schedule(request)
        print(f"Status: SUCCESS")
        print(f"Classes to Skip: {response.classesToSkip}")
        print(f"Classes to Attend: {response.classesToAttend}")
        print(f"Freed Hours: {response.freedHours}")
        print(f"New Ruin Risk: {response.newRuinRisk}")
        print(f"Reasoning: {response.reasoning}")
        return True, response
    except Exception as e:
        print(f"Status: FAILED with exception: {e}")
        traceback.print_exc()
        return False, None

def main():
    print("=== Solver Boundary and Stress Tests ===")
    
    all_passed = True
    
    # 1. Invalid Constraint Type
    # Verify that an invalid constraint type does not crash the solver, but falls back gracefully
    req_invalid_constraint = SolverRequest(
        schedule=[
            create_session("s1", penalty=0.5),
            create_session("s2", penalty=1.0)
        ],
        availableSafeBunks=1,
        currentRuinRisk=0.1,
        constraints=[SolverConstraint(type="invalid_constraint_type")]
    )
    ok, res = run_test_case("Invalid Constraint Type", req_invalid_constraint)
    if not ok or len(res.classesToSkip) == 0:
        print("FAIL: Invalid constraint type should still allow basic solving")
        all_passed = False
    
    # 2. Empty Schedule
    # Verify that an empty schedule is handled gracefully
    req_empty_schedule = SolverRequest(
        schedule=[],
        availableSafeBunks=5,
        currentRuinRisk=0.2,
        constraints=[]
    )
    ok, res = run_test_case("Empty Schedule", req_empty_schedule)
    if not ok or len(res.classesToSkip) != 0 or len(res.classesToAttend) != 0:
        print("FAIL: Empty schedule should return empty lists")
        all_passed = False
        
    # 3. Negative Available Safe Bunks
    # Verify that negative bunks are handled gracefully and don't allow skipping classes (or fallback/graceful solver return)
    req_negative_bunks = SolverRequest(
        schedule=[
            create_session("s1", penalty=0.5),
            create_session("s2", penalty=1.0)
        ],
        availableSafeBunks=-1,
        currentRuinRisk=0.1,
        constraints=[]
    )
    ok, res = run_test_case("Negative Safe Bunks", req_negative_bunks)
    if not ok or len(res.classesToSkip) != 0:
        print("FAIL: Negative safe bunks should not allow skipping classes")
        all_passed = False

    # 4. Large Penalty Weights / Float scale boundary
    # Test penalty weight of 0.0, negative penalty, and very large penalty
    req_strange_penalties = SolverRequest(
        schedule=[
            create_session("s1", penalty=0.0),
            create_session("s2", penalty=-0.5),
            create_session("s3", penalty=100.0)
        ],
        availableSafeBunks=10,
        currentRuinRisk=0.1,
        constraints=[]
    )
    ok, res = run_test_case("Strange Penalties", req_strange_penalties)
    if not ok:
        print("FAIL: Solver crashed on strange penalties")
        all_passed = False
        
    # 5. Multiple Constraints
    # Verify that multiple constraints are handled (only first is processed, others ignored, but no crash)
    req_multiple_constraints = SolverRequest(
        schedule=[
            create_session("s1", title="Special Math"),
            create_session("s2", title="General Science")
        ],
        availableSafeBunks=5,
        currentRuinRisk=0.0,
        constraints=[
            SolverConstraint(type="skip_specific", targetClass="Math"),
            SolverConstraint(type="block_time", targetDays=["Monday"])
        ]
    )
    ok, res = run_test_case("Multiple Constraints", req_multiple_constraints)
    if not ok or "s1" not in res.classesToSkip:
        print("FAIL: Multiple constraints did not solve or process the first constraint")
        all_passed = False

    # 6. Stress Test: Large Schedule (100 sessions)
    # Verify performance and correctness with a larger set of sessions
    large_schedule = []
    for i in range(100):
        # alternate mandatory and non-mandatory
        is_mand = (i % 2 == 0)
        large_schedule.append(create_session(f"session_{i}", is_mandatory=is_mand, penalty=0.2))
        
    req_stress = SolverRequest(
        schedule=large_schedule,
        availableSafeBunks=5,
        currentRuinRisk=0.1,
        constraints=[]
    )
    ok, res = run_test_case("Stress Test (100 sessions)", req_stress)
    if not ok:
        print("FAIL: Stress test with 100 sessions failed")
        all_passed = False
        
    if all_passed:
        print("\nALL SOLVER BOUNDARY AND STRESS TESTS PASSED SUCCESSFULLY.")
        sys.exit(0)
    else:
        print("\nSOME SOLVER BOUNDARY AND STRESS TESTS FAILED.")
        sys.exit(1)


if __name__ == "__main__":
    main()
