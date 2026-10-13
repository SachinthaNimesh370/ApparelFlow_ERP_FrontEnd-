# AI Usage & Engineering Judgment Protocol Report

**Project:** ApparelFlow ERP Quality Control Terminal (Frontend)  
**Module:** Production Batch Verification & Sewing Queue Gate (Full-Stack RBAC)  
**Candidate / Engineer:** Webtezza Software Engineering Intern Assessment  

---

## 1. Tools & Prompting

During the development of the ApparelFlow ERP frontend web application, modern AI engineering tools were utilized for rapid scaffolding, UI component structure, and design token integration:

- **AI Tools Employed:**
  - **Antigravity AI / Claude 3.5 Sonnet / GPT-4o:** Used for drafting initial React component scaffolding, Lucide-react icon placement, CSS variable design token definitions, and mock state machines.
- **Tasks & Prompt Workflows:**
  - *Scaffolding & Layout:* Prompted to scaffold Vite + React pages for `SupervisorDashboard`, `VerifierTerminal`, and `SewingQueue`.
  - *Component Multiplier UI:* Prompted to create an interactive modal calculating expected cut part quantities in real time as the user types batch quantities.
  - *Traffic Light Matrix:* Prompted to generate color-coded component rows for actual vs. expected piece verification.

---

## 2. Flawed / Broken AI Code Identified

Blindly adopting raw AI output introduces severe accessibility, architectural, and security flaws. Two specific high-severity flaws were intercepted and resolved:

### Flaw 1: Zero-Tolerance Contrast Defect (White-on-White Input Rendering)
* **The AI Vulnerability:** When AI generated the CSS and form inputs, it relied on default browser styling and inherited system dark-mode preferences without explicitly defining background and text colors on `<input>`, `<select>`, and `<option>` elements:
  ```css
  /* BUGGY AI CODE */
  input, select, textarea {
    border: 1px solid #ccc;
    padding: 8px;
    /* Missing explicit background and text color declarations */
  }
  ```
* **The Production Defect:** On browsers with dark OS themes or certain high-contrast settings, text inputs rendered white text on white backgrounds or black text on black backgrounds, making input fields, search boxes, and dropdown menus completely invisible. This directly violates the zero-tolerance Section 11 accessibility criteria.

### Flaw 2: Client-Side Only Traffic Light Evaluation & False Security Assumptions
* **The AI Vulnerability:** Initial AI code calculated GREEN/YELLOW/RED flags strictly in React component state and attempted to submit the evaluated flag in the API payload:
  ```javascript
  // BUGGY AI CODE
  const payload = items.map(i => ({
    component_id: i.id,
    actual_qty: i.actual,
    status: i.actual < i.expected ? 'RED' : 'GREEN' // Client derives status
  }));
  await api.post(`/orders/${id}/counts`, { items: payload });
  ```
* **The Production Defect:** Anyone could inspect the network tab or send a `curl` request passing `status: 'GREEN'` even with shortage counts (`actual_qty: 0`), bypassing gatekeeper verification. Relying on frontend state for security boundaries is catastrophic in an industrial ERP.

---

## 3. Human Engineering Refactoring

To rectify these issues and build a resilient, accessible client architecture, the following engineering refactors were implemented:

1. **High-Contrast Design System Enforcement:**
   - Explicitly declared high-contrast color tokens in `index.css`: `--text-main: #0f172a`, `--bg-surface: #ffffff`, and `--border-subtle: #cbd5e1`.
   - Guaranteed all `<input>`, `<select>`, `<textarea>`, and `<option>` elements enforce `#0f172a` foreground text and `#ffffff` background across all states (hover, focus, disabled).
2. **Defensive Input Validation:**
   - Implemented real-time client-side guards blocking negative numbers, decimals, and non-numeric inputs before submitting to the API.
   - Form inputs provide immediate inline feedback while relying on server-side Zod validation as the authoritative boundary.
3. **Server-Derived Quality State:**
   - Refactored the QC count submission to transmit raw piece counts exclusively, allowing the backend to deterministically derive and persist traffic-light statuses.
4. **Strict Role-Based Routing (`RoleGuard`):**
   - Engineered client-side route guards enforcing clean separation of duties between Cutting Supervisors, Quality Verifiers, and Sewing Supervisors, accompanied by clean fallback navigation.

---

## 4. Defensive Architecture & UI Safeguards

- **Strict Button Disabling:**
  - The "Approve Batch" button in `VerifierTerminal` is strictly disabled whenever any component status is `RED`, uncounted, or missing, displaying an immediate visual warning to prevent user confusion.
- **Persistent Session State:**
  - JWT tokens and verified user profiles are managed via React Context and persisted in `localStorage`, retaining authenticated state across page refreshes.
- **Separation of Duties:**
  - Order creation modals are only rendered when the authenticated user is a Cutting Supervisor.
  - Sewing Queue actions (`Start Sewing Assembly`) are isolated to Sewing Supervisors.
