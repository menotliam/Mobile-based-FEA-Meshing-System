# Master Context — Mobile-based FEA Meshing System

## 1. Project Identity

**Project name:** Mobile-based FEA Meshing System  
**Project type:** Multidisciplinary academic software project  
**Domain direction:** Information Systems and Software Engineering  
**Technical domain:** Mobile-based 2D Finite Element Analysis, meshing, simulation visualization, and project/result management.

This document is the primary source of truth for the project. It defines the product vision, implemented scope, assumptions, constraints, roadmap, limitations, and demo expectations.

---

## 2. Project Vision

The project aims to build a **mobile-based FEA meshing and simulation application** that allows users to define 2D geometry, configure material and meshing parameters, run a backend FEA computation pipeline, and visualize simulation results through an engineering dashboard.

The system is designed not only as a numerical computation prototype but also as an **information system** that manages simulation projects, input data, computed outputs, quality metrics, metadata, and exportable result packages.

The final academic demo focuses on a complete and repeatable end-to-end workflow with Q4, T3, and Delaunay polygon meshing support.

---

## 3. Product Positioning

The system is positioned as an:

> Educational and engineering prototype tool for mobile-based 2D FEA meshing, simulation, visualization, and project/result management.

It helps users understand the FEA pipeline from geometry definition to mesh generation, stiffness assembly, solving, post-processing, result visualization, local storage, and export.

### Primary Users

1. **Students or junior engineers learning FEA fundamentals**
   - Need to understand meshing, element stiffness, global assembly, boundary conditions, and deformation results.
   - Benefit from visual feedback and simplified input workflows.

2. **Lecturers, reviewers, or project evaluators**
   - Need to inspect software architecture, simulation workflow, and educational value.
   - Need a clear and reproducible demo.

3. **Engineering users in a lightweight prototype context**
   - Need to test simple 2D simulation scenarios.
   - Need quick mesh/result visualization rather than industrial-grade FEA accuracy.

---

## 4. Implemented Scope

### Mobile Application

- React Native mobile app with project-based flow.
- My Projects screen.
- Project search, rename, and delete.
- Project detail modal with latest mesh preview.
- Geometry Editor with:
  - Rectangle geometry mode.
  - Custom polygon geometry mode using editable `x,y` points.
- Meshing/physics parameter modal with:
  - Young's modulus.
  - Poisson's ratio.
  - Thickness.
  - Point load magnitude.
  - Q4/T3 element selection for rectangle.
  - Automatic Delaunay + T3 mode for custom polygon.
- Processing Status screen with backend progress and error handling.
- Mesh & Quality View dashboard with:
  - Original mesh.
  - Deformed mesh.
  - Displacement contour lite.
  - Fixed support markers.
  - Load vector markers.
  - Bad element highlight layer.
  - Node and element counts.
  - Maximum displacement.
  - Simulation metadata.
  - Boundary summary.
  - Displacement result summary.
  - Mesh quality metrics.
- Local simulation history using AsyncStorage.
- JSON export package v1.1.

### Backend

- FastAPI backend.
- `GET /` health check.
- `POST /api/process-mesh` simulation endpoint.
- Modular backend structure under `backend/`.
- Root `api.py` compatibility entrypoint.
- `SimulationService` and `SimulationPipeline` orchestration.
- `backend/fea_core` compatibility/FEA layer.
- Q4 rectangular element support.
- T3 triangular element support.
- Q4/T3 global assembly dispatcher.
- Structured rectangle meshing.
- Delaunay custom polygon T3 meshing.
- Linear elastic isotropic material model.
- Fixed left edge boundary condition.
- Point load simulation.
- Displacement post-processing.
- Mesh quality metrics.
- Structured API response with mesh, results, boundary visualization, quality, metadata, and warnings.

### Supported Simulation Modes

| Geometry | Algorithm | Element Type | Status |
|---|---|---|---|
| Rectangle | Structured | Q4 | Implemented |
| Rectangle | Structured | T3 | Implemented |
| Custom Polygon | Delaunay | T3 | Implemented |
| Custom Polygon | Delaunay | Q4 | Not supported |

---

## 5. Information System Goals

To reflect the Information Systems direction, the app supports:

- Project records.
- Local project history.
- Project search.
- Project rename.
- Project deletion.
- Simulation input persistence.
- Simulation output persistence.
- Simulation metadata.
- Mesh/result dashboard.
- Mesh quality summary.
- Exportable simulation packages.
- Clear data models for projects, inputs, outputs, quality metrics, and metadata.

This means the project is not only a numerical solver. It is an application that manages engineering simulation information.

---

## 6. User Flow

### Final Demo Flow

```text
My Projects
  → Geometry Editor
  → Choose Rectangle Q4 / Rectangle T3 / Custom Polygon
  → Meshing & Physics Parameters
  → Processing Status
  → Mesh & Quality View
  → Export JSON
  → Return to My Projects
  → Search / Rename / Delete / Inspect Project Detail
```

### Recommended Demo Order

1. Rectangle Q4 structured mesh.
2. Rectangle T3 structured mesh.
3. Custom Polygon Delaunay T3 mesh.
4. Result dashboard layer toggles and contour.
5. Project history and detail mesh preview.
6. Export JSON package.

---

## 7. Key Use Cases

### UC-01 — Create and Run Rectangle Q4 Simulation

**Status:** Implemented  
**Priority:** P0

User defines a rectangle, chooses Q4, enters material/load parameters, runs the backend, and views the structured Q4 result dashboard.

### UC-02 — Create and Run Rectangle T3 Simulation

**Status:** Implemented  
**Priority:** P0

User defines a rectangle, chooses T3, runs the backend, and views a triangular structured mesh result dashboard.

### UC-03 — Create and Run Custom Polygon Delaunay T3 Simulation

**Status:** Implemented  
**Priority:** P0

User defines polygon points in `x,y` format. The app automatically uses Delaunay + T3. The backend returns a triangular polygon mesh and displacement result.

### UC-04 — View Result Dashboard

**Status:** Implemented  
**Priority:** P0

User inspects mesh, deformation, displacement contour, boundary markers, quality metrics, metadata, and displacement summary.

### UC-05 — Manage Local Projects

**Status:** Implemented  
**Priority:** P1

User can search, rename, delete, and inspect saved local simulation projects.

### UC-06 — Export Simulation Package

**Status:** Implemented  
**Priority:** P1

User can export a JSON package containing input, output, mesh, results, quality metrics, and metadata.

---

## 8. Data Model Summary

### Project Entity

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime",
  "lastSimulationStatus": "success | failed | draft",
  "thumbnail": "optional"
}
```

### Geometry Model

```json
{
  "type": "rectangle | polygon",
  "rectangle": {
    "width": 2.0,
    "height": 1.0
  },
  "polygon": {
    "points": [[0, 0], [2, 0], [2, 1], [1, 1.4], [0, 1]]
  }
}
```

### Material Model

```json
{
  "name": "Custom Material",
  "model": "linear_elastic_isotropic",
  "youngModulus": 20000000000,
  "poissonRatio": 0.3,
  "thickness": 0.1,
  "unitSystem": "SI"
}
```

### Mesh Config

```json
{
  "algorithm": "structured | delaunay",
  "elementType": "quad | t3",
  "nx": 5,
  "ny": 2,
  "minAngleDeg": 28.5,
  "maxArea": 0.05
}
```

### Boundary Conditions

```json
{
  "constraints": [
    {
      "type": "fixed",
      "target": "edge",
      "selector": { "edge": "left" },
      "dof": ["u", "v"]
    }
  ],
  "loads": [
    {
      "type": "point_load",
      "target": "coordinate",
      "coordinate": [2, 1],
      "force": [0, -10000]
    }
  ]
}
```

---

## 9. Non-functional Requirements

### Accuracy

The demo targets **educational accuracy**. The FEA pipeline follows the conceptual and mathematical structure of small 2D linear elastic problems. Engineering-grade validation is future work.

### Performance

For small meshes, the API should ideally return results within a few seconds on a local development machine.

### Supported Problem Size

Current academic demo:

- Small meshes.
- Dense matrix assembly.
- Local backend computation.
- Educational dashboard visualization.

Future work:

- Sparse matrix assembly.
- Larger mesh support.
- Performance profiling.

### Offline/Online Mode

- Mobile UI and project history are local.
- Simulation solving requires the local FastAPI backend.
- Android emulator uses `10.0.2.2:8000`.
- Physical device demo may use the laptop LAN IP.

### Security

For the academic demo:

- No authentication is required.
- Input validation is required.
- CORS may be open during local demo.
- CORS should be restricted for production deployment.

---

## 10. Assumptions

The system assumes:

- 2D analysis only.
- SI unit system.
- Linear elastic isotropic material.
- Small deformation educational context.
- Backend solver is required for simulation.
- Small mesh size for current implementation.
- One main load case per simulation in the academic demo.
- Fixed left edge support is the default support condition.
- Point load is the default load model.
- The mobile app acts as the UI, project management layer, and visualization dashboard.
- The backend owns numerical computation and post-processing scalar generation.

---

## 11. Current Academic Demo Limitations

The following limitations should be acknowledged during reporting:

- The system targets educational/demo accuracy, not engineering-certified analysis.
- The solver uses dense matrix operations and is suitable for small meshes.
- The load model is simplified as a point load.
- Boundary editing is limited; fixed-left-edge support is the current default.
- Custom polygon mode works best with simple or convex point sets.
- Robust concave polygon clipping/filtering is future work.
- Stress/strain computation and validation are future work.
- No cloud backend, authentication, or multi-user database is implemented.

These limitations are acceptable for an academic prototype as long as they are clearly separated from implemented scope and future work.

---

## 12. Implementation Roadmap Status

### Phase 1 — Stabilize End-to-End Academic Demo

Status: Implemented

- Stabilized Q4 rectangle simulation.
- Connected React Native app to FastAPI backend.
- Added processing flow and result visualization.
- Added structured error handling.

### Phase 2 — Add Information-System Features

Status: Implemented

- Added mesh quality metrics.
- Added AsyncStorage project history.
- Added project search, rename, and delete.
- Added project detail with latest mesh preview.
- Added JSON export.

### Phase 3 — Improve Dashboard and Visualization

Status: Implemented

- Added layer toggles.
- Added displacement contour lite.
- Added displacement result panel.
- Added simulation metadata panel.
- Added boundary summary panel.
- Added dynamic labels for Q4/T3/polygon results.

### Phase 4 — Architecture Refactor and Meshing Expansion

Status: Implemented

- Added modular backend structure.
- Added `SimulationPipeline` wrapper.
- Added `backend/fea_core` compatibility layer.
- Added T3 element stiffness.
- Added Q4/T3 assembly dispatcher.
- Added Delaunay custom polygon T3 flow.
- Synced Architecture documentation.

### Phase 5 — Final Demo Readiness and Report Support

Status: In Progress

- Updated README.
- Added demo checklist.
- Added presentation script.
- Added final status documentation.

---

## 13. Definition of Done

The project is considered complete for the academic demo when:

- The app runs end-to-end from geometry input to result visualization.
- FastAPI backend runs locally and processes simulation requests.
- Rectangle Q4 demo works reliably.
- Rectangle T3 demo works reliably.
- Custom Polygon Delaunay T3 demo works reliably.
- Result dashboard shows mesh, deformation, contour, metadata, boundary summary, displacement, and quality metrics.
- Local project history saves simulation input and output.
- Project search, rename, delete, and detail preview work.
- JSON export works.
- Documentation files are complete:
  - `Master_Context.md`
  - `Architecture.md`
  - `Design_System.md`
  - `Coding_Rules.md`
  - `Demo_Checklist.md`
  - `Presentation_Script.md`
  - `Final_Status_Report.md`
- A repeatable demo script is prepared.

---

## 14. Final Demo Script Summary

### Demo Scenario 1 — Rectangle Q4

- Geometry: Rectangle 2.0m × 1.0m.
- Element type: Q4.
- Algorithm: Structured.
- Material: E = 20e9 Pa, ν = 0.3, thickness = 0.1m.
- Boundary: fixed left edge.
- Load: downward point load.

### Demo Scenario 2 — Rectangle T3

- Same rectangle and material settings.
- Element type: T3.
- Algorithm: Structured.

### Demo Scenario 3 — Custom Polygon Delaunay T3

- Geometry: custom polygon points.
- Algorithm: Delaunay.
- Element type: T3.

### Demo Talking Points

- The mobile app demonstrates an engineering workflow.
- The backend performs numerical computation.
- The frontend acts as visualization and information dashboard.
- The project combines software engineering, information systems, and computational mechanics.
- Current demo prioritizes educational accuracy and system integration.

---

## 15. Documentation Policy

All project documentation files should be written in English for professional readability and repository presentation. Vietnamese explanations can be used in oral presentation and report discussion when needed.

Feature status should be marked using:

- Implemented.
- In Progress.
- Target.
- Future Work.

Known limitations should be included but framed as current academic demo constraints rather than weaknesses.
