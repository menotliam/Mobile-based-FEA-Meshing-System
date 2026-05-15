# Mobile-based FEA Meshing System

A multidisciplinary academic project focused on **Information Systems**, **Software Engineering**, and **2D Finite Element Analysis (FEA)**.

The system provides a mobile workflow for defining 2D geometry, configuring material and mesh parameters, running a Python/FastAPI FEA backend, visualizing mesh and displacement results, managing local simulation projects, and exporting simulation data as JSON.

---

## Implemented Features

### Mobile App

- React Native mobile application.
- Project home screen with local project history.
- Project search, rename, and delete.
- Project detail modal with latest mesh preview.
- Geometry editor with:
  - Rectangle mode.
  - Custom polygon mode using editable `x,y` points.
- Mesh setup with:
  - Q4 structured rectangle mesh.
  - T3 structured rectangle mesh.
  - Delaunay T3 custom polygon mesh.
- Processing screen with pipeline progress and error handling.
- Result dashboard with:
  - Original mesh layer.
  - Deformed mesh layer.
  - Displacement contour lite.
  - Fixed support markers.
  - Load vector markers.
  - Bad element highlight layer.
  - Simulation metadata.
  - Boundary summary.
  - Displacement result summary.
  - Mesh quality metrics.
- JSON export package.

### Backend

- FastAPI backend.
- Modular backend structure under `backend/`.
- Compatibility root entrypoint through `api.py`.
- Simulation service and pipeline wrapper.
- FEA core compatibility layer.
- Q4 element support.
- T3/CST element support.
- Q4/T3 global assembly dispatcher.
- Structured rectangle meshing.
- Delaunay custom polygon T3 meshing.
- Linear static solve for educational demo scenarios.
- Structured API response with mesh, result, boundary visualization, quality, and metadata.

---

## Current Supported Simulation Modes

| Geometry | Algorithm | Element Type | Status |
|---|---|---|---|
| Rectangle | Structured | Q4 | Implemented |
| Rectangle | Structured | T3 | Implemented |
| Custom Polygon | Delaunay | T3 | Implemented |
| Custom Polygon | Delaunay | Q4 | Not supported |

Current custom polygon input works best with simple or convex point sets. Robust concave polygon clipping/filtering is future work.

---

## Repository Structure

```text
Mobile-based-FEA-Meshing-System/
├── api.py
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── services/
│   │   └── simulation_service.py
│   └── fea_core/
│       ├── meshing.py
│       ├── material.py
│       ├── element_q4.py
│       ├── element_t3.py
│       ├── assembly.py
│       ├── solver.py
│       └── quality.py
├── base/
│   └── src/
│       ├── screen/
│       ├── services/
│       ├── storage/
│       └── utils/
├── ThuatToan_Final/
├── Master_Context.md
├── Architecture.md
├── Design_System.md
├── Coding_Rules.md
├── Demo_Checklist.md
└── Presentation_Script.md
```

---

## Backend Setup

From the repository root:

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the modular backend:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Compatibility command:

```bash
uvicorn api:app --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://localhost:8000/
```

Expected response:

```json
{
  "status": "success",
  "message": "FEM API is running"
}
```

---

## Mobile App Setup

The React Native app is located in:

```text
base/
```

Install dependencies:

```bash
cd base
npm install
```

Run on Android emulator:

```bash
npx react-native run-android
```

The Android emulator should call the backend through:

```text
http://10.0.2.2:8000
```

For a physical Android device, use the laptop LAN IP:

```text
http://<laptop-lan-ip>:8000
```

---

## Demo Flow

```text
My Projects
→ Geometry Editor
→ Choose Rectangle Q4 / Rectangle T3 / Custom Polygon
→ Enter material and load parameters
→ Start Generation
→ Processing Status
→ Mesh & Quality View
→ Toggle result layers
→ Export JSON
→ Return to My Projects
→ Search / Rename / Delete / Inspect project detail
```

Recommended demo order:

1. Rectangle Q4 structured mesh.
2. Rectangle T3 structured mesh.
3. Custom polygon Delaunay T3 mesh.
4. Project history and mesh preview.
5. Export JSON package.

---

## Educational FEA Scope

The current system is an educational academic prototype. It demonstrates the main computational structure of 2D FEA:

```text
Input validation
→ Mesh generation
→ Material matrix D
→ Element stiffness
→ Global assembly
→ Boundary condition application
→ Linear solve
→ Post-processing
→ Visualization and storage
```

The current implementation prioritizes correctness of workflow, explainability, and system integration. Engineering-grade validation, sparse solving, robust CAD-style geometry editing, and stress/strain validation are future work.

---

## Documentation

Main project documentation:

- `Master_Context.md` — product context, scope, assumptions, roadmap.
- `Architecture.md` — system architecture, API contract, backend/frontend structure.
- `Design_System.md` — visual design direction and UI guidelines.
- `Coding_Rules.md` — implementation rules and collaboration constraints.
- `Demo_Checklist.md` — repeatable final demo checklist.
- `Presentation_Script.md` — technical presentation script.

---

## Final Feature Status

| Feature | Status |
|---|---|
| React Native app | Implemented |
| FastAPI backend | Implemented |
| Q4 rectangle simulation | Implemented |
| T3 rectangle simulation | Implemented |
| Delaunay custom polygon T3 simulation | Implemented |
| Project search/rename/delete | Implemented |
| Local simulation history | Implemented |
| Mesh/result dashboard | Implemented |
| Layer toggles | Implemented |
| Displacement contour lite | Implemented |
| Mesh quality metrics | Implemented |
| JSON export v1.1 | Implemented |
| Stress/strain engineering validation | Future Work |
| Robust concave polygon filtering | Future Work |
| Cloud deployment/authentication | Future Work |
