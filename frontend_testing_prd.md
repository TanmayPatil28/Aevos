# Aevos: Combined Frontend Testing PRD

## 1. Project Overview
**Aevos** is a premium, data-driven academic analytics platform designed for B.Tech engineering students. The application emphasizes high-fidelity UI/UX ("Levitating Liquid Glass" and "Energy Aura"), precise CGPA/SGPA calculations, and sophisticated semester planning.

### 1.1 Goal
Ensure 100% calculation accuracy, zero visual regressions in core design tokens, and a seamless "WOW" experience across all devices.

## 2. Testing Strategy

### 2.1 Testing Layers
- **Visual Regression Testing**: Automate capture and comparison of "Glass" components and animations to ensure design consistency.
- **Functional (Calculation) Testing**: Verify SGPA and CGPA logic with various credit/grade inputs.
- **E2E Integration Testing**: Track user flows from landing page to calculator and planner.
- **Responsive & Accessibility Testing**: Ensure accessibility standards (WCAG 2.1) and fluid layout across mobile, tablet, and desktop.

### 2.2 Tools
- **TestSprite**: Primary automation for E2E and visual validation.
- **Manual QA**: Validating organic micro-animations and "Energy Aura" effects.
- **Lighthouse**: Performance and Accessibility benchmarking.

---

## 3. Feature-Specific Requirements & Test Cases

### 3.1 Landing Page (Home)
**Objective**: Guarantee the "Premium SaaS" first impression through flawless animations and interactivity.

| Test Case ID | Feature | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| LP-01 | Hero Animation | Page Load | Words "Calculate", "Plan", "Score Higher" stagger in correctly. |
| LP-02 | Magnetic Hover | Move mouse over "Initialize Engine" button | Button exhibits organic attraction/magnetic effect. |
| LP-03 | Stats Counter | Scroll to Stats section | `AnimatedCounter` increments smoothly to target values. |
| LP-04 | Holographic Beam | Hover over Calculator Card | Horizontal scanner beam triggers and pulses. |

### 3.2 Dynamic CGPA Calculator
**Objective**: Real-time feedback with 100% mathematical precision.

| Test Case ID | Feature | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| CALC-01 | Basic Calculation | Enter 4 subjects with 'O' grade and 4 credits each | SGPA displays 10.00 accurately. |
| CALC-02 | Form Validation | Submit with missing grade fields | Inline validation errors appear with "Premium" styling. |
| CALC-03 | Local Storage | Refresh page after entering grades | Grades and credits are persisted and reloaded. |
| CALC-04 | Dynamic HUD | Change a grade in the list | The SGPA HUD updates instantly with a soft glow effect. |

### 3.3 Semester Planner
**Objective**: Intelligent grade mapping based on target CGPA.

| Test Case ID | Feature | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| PLAN-01 | Target Goal | Set target CGPA to 9.5 | Planner calculates required SGPA for remaining semesters. |
| PLAN-02 | Multi-Sem Logic | Input past CGPA of 8.0 for 3 semesters | The "Backlog Scanner" logic identifies required improvements. |
| PLAN-03 | Visual Analytics | View Trajectory Chart | Spline graph renders with glowing shadow path and nodes. |

---

## 4. Visual & Aesthetic Standards ("The High Bar")

### 4.1 "Levitating Liquid" Tokens
- **Glassmorphism**: Ensure `backdrop-blur` and `border-outline-variant` are consistent across all `glass-card` instances.
- **Energy Aura**: Pulse rings on data nodes must maintain a subtle, non-intrusive frequency.
- **AMOLED Backgrounds**: Backgrounds must be `#000000` or a very deep navy to ensure "liquid" contrast.

### 4.2 Motion & Springs
- **Spring Physics**: Use `SOFT_SPRING` for layout transitions and `SNAPPY_SPRING` for hover states.
- **Entrance**: Avoid abrupt jumps; use Framer Motion `staggerChildren` for all list items.

---

## 5. Performance Success Metrics
- **First Contentful Paint (FCP)**: < 1.2s
- **Time to Interactive (TTI)**: < 2.5s
- **Animation Frame Rate**: Maintain 60fps even with multiple `FloatingParticles`.

## 6. Implementation Checklist
- [ ] Initialize TestSprite configuration.
- [ ] Implement `testsprite_generate_frontend_test_plan`.
- [ ] Conduct baseline visual audit of the Landing Page.
- [ ] Verify arithmetic logic in `/lib/calculations.ts` (if applicable).
