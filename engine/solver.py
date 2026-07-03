from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ortools.sat.python import cp_model
import numpy as np

app = FastAPI(title="GradeFlow Autonomous Academic Economist", version="1.0.0")

class ClassSession(BaseModel):
    id: str
    courseCode: str
    title: str
    type: str
    dayOfWeek: str
    startTime: str
    endTime: str
    isMandatory: bool
    penaltyWeight: float

class SolverConstraint(BaseModel):
    type: str
    targetDays: Optional[List[str]] = []
    targetClass: Optional[str] = None
    minContiguousHours: Optional[int] = None
    maxRuinRiskAllowed: Optional[float] = None

class SolverRequest(BaseModel):
    schedule: List[ClassSession]
    availableSafeBunks: int
    currentRuinRisk: float
    constraints: List[SolverConstraint]
    sleepDebt: float = 0.0
    baselineFatigue: float = 0.0
    totalClasses: int = 40
    classesConducted: int = 20
    classesAttended: int = 17
    targetAttendance: float = 0.75

class SolverResponse(BaseModel):
    classesToSkip: List[str]
    classesToAttend: List[str]
    freedHours: int
    newRuinRisk: float
    reasoning: str

def simulate_ruin_probability(
    sleep_debt: float,
    baseline_fatigue: float,
    total_classes: int,
    classes_conducted: int,
    classes_attended: int,
    target_attendance: float,
    new_skips: int
) -> float:
    lam_0 = 0.05
    alpha = 0.1
    beta = 1.0
    lam = lam_0 * np.exp(alpha * sleep_debt + beta * baseline_fatigue)
    lam = min(lam, 0.95)
    
    premium_rate = 1.0 - target_attendance
    T = max(0, total_classes - (classes_conducted + new_skips))
    initial_surplus = classes_attended - target_attendance * (classes_conducted + new_skips)
    
    if T == 0:
        return 100.0 if initial_surplus < 0 else 0.0
        
    iterations = 10000
    ruin_count = 0
    n_skips_all = np.random.poisson(lam * T, size=iterations)
    for n_skips in n_skips_all:
        final_surplus = initial_surplus + premium_rate * T - n_skips
        if final_surplus < 0:
            ruin_count += 1
            
    ruin_probability = (ruin_count / iterations) * 100.0
    return round(ruin_probability, 1)

@app.post("/solve", response_model=SolverResponse)
def solve_schedule(request: SolverRequest):
    model = cp_model.CpModel()
    
    # 1. Variables: x[i] = 1 if class is ATTENDED, 0 if SKIPPED
    x = {}
    for i, cls in enumerate(request.schedule):
        x[i] = model.NewBoolVar(f'class_{i}_{cls.id}')
        
        # Hard constraint: Mandatory classes MUST be attended
        if cls.isMandatory or cls.type.lower() in ['lab', 'practical']:
            model.Add(x[i] == 1)

    # 2. Constraint: Total penalty of skipped classes must be <= availableSafeBunks
    # Sum of (1 - x[i]) * penaltyWeight <= availableSafeBunks
    # To handle floats in CP-SAT, we multiply by 10 and cast to int
    scaled_bunks = int(request.availableSafeBunks * 10)
    penalty_expr = []
    for i, cls in enumerate(request.schedule):
        scaled_weight = int(cls.penaltyWeight * 10)
        # (1 - x[i]) * scaled_weight
        penalty_expr.append((1 - x[i]) * scaled_weight)
    
    model.Add(sum(penalty_expr) <= scaled_bunks)

    # 3. Objective Function Formulation
    objective_terms = []
    constraint = request.constraints[0] if request.constraints else None
    
    for i, cls in enumerate(request.schedule):
        utility = 0
        
        if constraint:
            if constraint.type == 'max_time_off':
                utility = 10
            elif constraint.type == 'block_time':
                if cls.dayOfWeek.lower() in [d.lower() for d in (constraint.targetDays or [])]:
                    utility = 1000 # High priority to skip targeted days
                else:
                    utility = -1 # Penalty for skipping non-targeted days
            elif constraint.type == 'skip_specific' and constraint.targetClass:
                if constraint.targetClass.lower() in cls.title.lower() or constraint.targetClass.lower() in cls.courseCode.lower():
                    utility = 5000
                else:
                    utility = -1 # Penalty for skipping non-targeted classes
            elif constraint.type == 'grade_impact':
                utility = max(1, 100 - int(cls.penaltyWeight * 20))
            elif constraint.type == 'max_consecutive':
                is_back_to_back = False
                for other in request.schedule:
                    if other.id == cls.id:
                        continue
                    if other.dayOfWeek.lower() != cls.dayOfWeek.lower():
                        continue
                    if other.startTime == cls.endTime or other.endTime == cls.startTime:
                        is_back_to_back = True
                        break
                utility = 50 if is_back_to_back else 10
                
        # We want to MAXIMIZE utility of SKIPPED classes: maximize sum of (1 - x[i]) * utility
        objective_terms.append((1 - x[i]) * utility)

    model.Maximize(sum(objective_terms))

    # 4. Solve
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 2.0 # Cap solving time for UI responsiveness
    status = solver.Solve(model)

    if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        classes_to_skip = []
        classes_to_attend = []
        total_penalty = 0.0
        
        for i, cls in enumerate(request.schedule):
            if solver.Value(x[i]) == 0:
                classes_to_skip.append(cls.id)
                total_penalty += cls.penaltyWeight
            else:
                classes_to_attend.append(cls.id)
                
        if len(classes_to_skip) == 0:
            reasoning = "I checked your schedule. I couldn't find any classes that can be safely skipped (mostly mandatory labs or critical sessions)."
        else:
            reasoning = f"I analyzed your schedule and found {len(classes_to_skip)} classes you can safely skip. I've highlighted them on your timetable."
        
        new_ruin_risk = simulate_ruin_probability(
            sleep_debt=request.sleepDebt,
            baseline_fatigue=request.baselineFatigue,
            total_classes=request.totalClasses,
            classes_conducted=request.classesConducted,
            classes_attended=request.classesAttended,
            target_attendance=request.targetAttendance,
            new_skips=len(classes_to_skip)
        )
        
        return SolverResponse(
            classesToSkip=classes_to_skip,
            classesToAttend=classes_to_attend,
            freedHours=len(classes_to_skip),
            newRuinRisk=new_ruin_risk,
            reasoning=reasoning
        )
    else:
        # Fallback if no solution found
        new_ruin_risk = simulate_ruin_probability(
            sleep_debt=request.sleepDebt,
            baseline_fatigue=request.baselineFatigue,
            total_classes=request.totalClasses,
            classes_conducted=request.classesConducted,
            classes_attended=request.classesAttended,
            target_attendance=request.targetAttendance,
            new_skips=0
        )
        return SolverResponse(
            classesToSkip=[],
            classesToAttend=[c.id for c in request.schedule],
            freedHours=0,
            newRuinRisk=new_ruin_risk,
            reasoning="I checked your schedule. I couldn't find any classes that can be safely skipped (mostly mandatory labs or critical sessions)."
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
