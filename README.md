# ApparelFlow ERP — Quality Control Terminal (Frontend)

Enterprise Manufacturing Resource Planning (ERP) front-end web application engineered specifically for commercial garment production facilities. Implements the **Cutting Operations & Gatekeeper Verification Terminal** with dynamic Bill of Materials (BOM) component multiplication, real-time traffic-light piece count verification, hard-stop shortage prevention, and sewing queue isolation.

---

## 1. Overview & Architecture

- **Framework:** React (Vite)
- **Styling:** Vanilla CSS design tokens adhering to strict accessibility contrast standards
- **Routing & Guards:** React Router with client `RoleGuard` wrapper
- **API Communication:** Relative URL fetch (`/api/*`) proxied to the Express backend in development, and served via Nginx reverse proxy on EC2 in production
- **CI/CD:** Automated GitHub Actions pipeline (`deploy.yml`) building and deploying to `/var/www/apparelflow/` on AWS EC2

---

## 2. Factory Roles & Evaluator 1-Click Persona Switcher

The application includes an instant **Role Switcher / Demo Credential Panel** accessible both from the login page and permanently pinned in the top navigation bar, allowing evaluators to audit the system across all 3 personas:

| Operational Persona | Role Key | Demo Email & Password | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Cutting Supervisor** | `cutting_supervisor` | `supervisor@apparelflow.com`<br>`Password123!` | Create production batches, preview dynamic component multipliers in real time, track cutting orders. Cannot verify batches or access sewing queue. |
| **Cutting Verifier** | `cutting_verifier` | `verifier@apparelflow.com`<br>`Password123!` | Physical quality checkpoint. Counts cut parts, triggers real-time traffic light flags (GREEN/YELLOW/RED), approves batches or rejects with mandatory reason note. Hard stop blocks approval on shortages. |
| **Sewing Supervisor** | `sewing_supervisor` | `sewing@apparelflow.com`<br>`Password123!` | Assembly line terminal. Inspects verified piece counts, verifier attribution, and fabric wastage %, initiates sewing assembly (`SEWING_STARTED`). Strictly blocked from unverified orders. |

---

## 3. Core Features & Compliance Standards

### 3.1 Zero-Tolerance UI Input Contrast & Accessibility
- Conforms strictly to **Section 11 (UI Usability & Contrast Standards)**.
- Form inputs, selects, and textareas enforce dark text (`#111827`) against bright white backgrounds (`#ffffff`) across all default, focus, and disabled states.
- Dropdown option elements explicitly declare dark text on white backgrounds to eliminate white-on-white rendering bugs.

### 3.2 Dynamic Component Multiplier Engine
- When a Cutting Supervisor selects a recipe (e.g. *Casual Blouse* or *Crop Top*) and enters a batch quantity (e.g. 50 units), the UI dynamically calculates expected cut part quantities in real time:
  $$\text{Expected Pieces} = \text{Batch Quantity} \times \text{Pieces Per Garment}$$
  *(e.g., 50 garments $\times$ 2 sleeve cuffs = 100 expected cuffs).*

### 3.3 Traffic-Light QC Status Matrix
- **GREEN (Match):** Actual Count == Expected Count. Exact match.
- **YELLOW (Excess):** Actual Count > Expected Count. Surplus pieces recorded; batch permitted to proceed.
- **RED (Shortage):** Actual Count < Expected Count. Defect shortage detected.

### 3.4 Strict Pass-Fail Gatekeeper Hard Stop
- If ANY single component is flagged **RED** or left uncounted, the **"Approve Batch"** button is strictly disabled on the UI with an explanatory alert banner, and will be rejected with `422 Unprocessable Entity` on the API.
- The Verifier may only reject the batch with a mandatory reason note documenting defects.

### 3.5 Sewing Queue Isolation & Wastage Analytics
- Shows only verified orders released by QC verifiers.
- Displays computed Fabric Wastage percentage:
  $$\text{Fabric Wastage \%} = \frac{\text{Actual Fabric Used} - \text{Expected Fabric}}{\text{Expected Fabric}} \times 100$$
- Allows initiating sewing assembly line operations (`POST /api/sewing/:id/start`).

---

## 4. Getting Started Locally

### Install Dependencies
```bash
npm install
```

### Start Local Development Server
```bash
npm run dev
```
*(Runs at `http://localhost:5173`, with `/api` proxying to `http://localhost:3000`)*.

### Build Production Bundle
```bash
npm run build
```
*(Outputs optimized bundle to `dist/`)*.
