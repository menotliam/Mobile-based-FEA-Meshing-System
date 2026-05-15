# Master Context — Mobile-based FEA Meshing System

## 1. Project Identity

**Project name:** Mobile-based FEA Meshing System  
**Project type:** Multidisciplinary academic software project  
**Domain direction:** Information Systems and Software Engineering  
**Technical domain:** Mobile-based 2D Finite Element Analysis (FEA), meshing, simulation visualization, and project/result management.

This document is the primary source of truth for the project. It defines the product vision, functional scope, assumptions, constraints, roadmap, and demo expectations. All future development, refactoring, UI decisions, and documentation should align with this context.

---

## 2. Project Vision

The project aims to build a **mobile-based FEA meshing and simulation application** that allows users to define 2D geometry, configure material and meshing parameters, run a backend FEA computation pipeline, and visualize simulation results through an engineering dashboard.

The system is designed not only as a numerical computation prototype but also as an **information system** that manages simulation projects, input data, computed outputs, quality metrics, metadata, and exportable result packages.

The current academic demo focuses on a feasible end-to-end workflow, while the target product vision includes richer geometry input, multiple mesh types, boundary condition editing, local project history, quality metrics, and result export.

---

## 3. Product Positioning

The system is positioned as an:

> Educational and engineering prototype tool for mobile-based 2D FEA meshing, simulation, and visualization.

It helps users understand the FEA pipeline from geometry definition to mesh generation, stiffness assembly, solving, post-processing, and result visualization.

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

## 4. Project Goals

### Core Goals

- Provide a mobile-first workflow for defining 2D FEA simulation inputs.
- Connect a React Native mobile app with a Python FastAPI backend.
- Reuse a Python FEA core pipeline for meshing, assembling, solving, and post-processing.
- Visualize original mesh, deformed mesh, displacement values, and dashboard metrics.
- Store project input and simulation output locally when implemented.
- Export simulation packages in JSON format.
- Provide clean technical documentation for development, reporting, and presentation.

### Educational Goals

- Make the FEA workflow explainable through separated computational stages.
- Allow step-by-step interpretation of geometry, mesh, stiffness matrix, boundary conditions, and displacement.
- Support a repeatable demo such as a rectangle cantilever beam with fixed support and downward load.

### Information System Goals

To reflect the Information Systems direction, the app should support:

- Project records.
- Simulation metadata.
- Local project history.
- Input/output persistence.
- Result dashboard.
- Exportable simulation packages.
- Clear data models for projects, inputs, outputs, quality metrics, and metadata.

---

## 5. Functional Scope

The project scope is divided into **Implemented**, **Target**, and **Future Work** to avoid overclaiming while preserving the full product direction.

### Implemented Baseline

- React Native mobile app with basic screen flow.
- FastAPI backend with:
  - `GET /`
  - `POST /api/process-mesh`
- Python FEA core using NumPy, SciPy, and Matplotlib.
- 2D rectangular geometry input through width and height.
- Structured quadrilateral Q4 mesh generation.
- Linear elastic isotropic material model.
- Fixed left edge boundary condition.
- Point load applied near the top-right corner.
- Global stiffness matrix assembly for Q4 elements.
- Linear system solving for nodal displacement.
- Original mesh and deformed mesh visualization on mobile.
- Basic node count, element count, and displacement output.

### Target Functional Scope

- Project-based workflow.
- Rectangle and custom polygon geometry input.
- Structured Q4 mesh.
- Triangle T3 mesh.
- Delaunay meshing for polygon-like input.
- Boundary condition editing:
  - Fixed edge selection.
  - Load point selection.
  - Force vector input.
- Linear elastic isotropic material configuration:
  - Young's modulus.
  - Poisson's ratio.
  - Thickness.
  - SI unit system.
- Simulation output:
  - Original mesh.
  - Deformed mesh.
  - Displacement values.
  - Displacement magnitude.
  - Basic stress approximation.
  - Displacement contour visualization.
  - Fixed support markers.
  - Load vector markers.
- Mesh quality dashboard:
  - Element area.
  - Aspect ratio.
  - Bad element count.
  - Min/max area.
- Local project history with AsyncStorage.
- JSON export of full simulation package.

### Future Work

- Engineering-grade validation against standard FEA benchmark problems.
- Sparse matrix assembly and solving for medium-size meshes.
- Advanced adaptive meshing.
- More rigorous stress/strain computation.
- Image/PDF report export.
- Backend database and cloud deployment.
- Authentication and user accounts.
- Full CAD-like sketch input.
- Material library and more material models.
- Multi-loadcase simulation management.

---

## 6. User Flow

### Target Project-Based Flow

```text
Project Home
  → Create/Open Project
  → Geometry Editor
  → Material & Load Setup
  → Mesh Settings
  → Processing
  → Results / Post-processing
  → Save / Export
```

### Demo Flow

```text
My Projects
  → Geometry Editor
  → Meshing & Physics Parameters
  → Processing Status
  → Mesh & Quality View
```

---

## 7. Key Use Cases

### UC-01 — Create a New Simulation Project

**Actor:** Student or engineering user  
**Goal:** Create a project record for a new 2D FEA simulation.

Steps:
1. User opens the app.
2. User selects Create Project.
3. User enters project name and optional description.
4. App creates a local project record.
5. User proceeds to geometry definition.

**Status:** Target  
**Priority:** P1

### UC-02 — Define Geometry

**Actor:** User  
**Goal:** Define a 2D geometry for meshing.

Steps:
1. User opens Geometry Editor.
2. User chooses geometry type: rectangle or polygon.
3. User enters dimensions or polygon points.
4. App validates geometry.
5. Geometry preview is shown on canvas.

**Current baseline:** Rectangle dimensions  
**Target:** Rectangle + polygon coordinate input  
**Priority:** P0 for rectangle, P1 for polygon

### UC-03 — Configure Material and Load

**Actor:** User  
**Goal:** Configure physical properties and boundary conditions.

Steps:
1. User enters material parameters.
2. User chooses support condition.
3. User chooses load point and force vector.
4. App validates all inputs.

**Current baseline:** Fixed left edge and point load at top-right corner  
**Target:** User-selected fixed edge and load point  
**Priority:** P0 baseline, P1 target editor

### UC-04 — Configure Mesh Settings

**Actor:** User  
**Goal:** Configure mesh generation settings.

Inputs:
- Algorithm: structured or Delaunay.
- Element type: quad or triangle.
- Mesh density: nx, ny.
- Quality constraints: minAngleDeg, maxArea.

**Current baseline:** Structured Q4 with nx/ny  
**Target:** Q4, T3, Delaunay  
**Priority:** P0 Q4, P2 T3/Delaunay

### UC-05 — Run Simulation

**Actor:** User  
**Goal:** Send simulation input to backend and compute result.

Steps:
1. App builds simulation request.
2. App sends request to FastAPI backend.
3. Backend validates input.
4. Backend runs simulation pipeline.
5. Backend returns result schema.
6. App transitions to results dashboard.

**Status:** Implemented baseline  
**Priority:** P0

### UC-06 — View Result Dashboard

**Actor:** User  
**Goal:** Inspect mesh and simulation results visually.

Target dashboard includes:
- Original mesh.
- Deformed mesh.
- Displacement values.
- Node/element counts.
- Mesh quality metrics.
- Layer toggles.

**Current baseline:** Original/deformed mesh and basic stats  
**Target:** Full visualization dashboard  
**Priority:** P0 baseline, P1 dashboard enhancements

### UC-07 — Save Project and Simulation Result

**Actor:** User  
**Goal:** Persist project input and output locally.

**Status:** Target  
**Priority:** P1

### UC-08 — Export Simulation Package

**Actor:** User  
**Goal:** Export complete simulation data as JSON.

**Status:** Target  
**Priority:** P1

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
    "points": [[0, 0], [2, 0], [2, 1], [0, 1]]
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
  "elementType": "quad | triangle",
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

The demo targets **educational accuracy**. The FEA pipeline should follow correct conceptual and mathematical structure for small 2D linear elastic problems. Engineering-grade validation is future work.

### Performance

For small meshes of approximately 10–200 elements, the API should ideally return results within 3–5 seconds on a local development machine.

### Supported Problem Size

Current academic demo:
- Small mesh.
- Dense matrix assembly.
- Local backend computation.

Future work:
- Sparse matrix assembly.
- Medium-size mesh support.
- Performance profiling.

### Offline/Online Mode

- Mobile UI and project history should be available offline.
- Simulation solving requires the local FastAPI backend.
- Android emulator uses `10.0.2.2:8000`.
- Physical device demo may use the laptop's LAN IP.

### Testing

Minimum testing expectations:
- Unit tests for D matrix generation.
- Unit tests for structured mesh generation.
- Unit tests for Q4 element stiffness matrix shape.
- Solver sanity check.
- Manual UI testing.
- API smoke test if time allows.

### Security

For the academic demo:
- No authentication is required.
- Input validation is required.
- CORS may be open during local demo.
- CORS should be restricted for deployment.

### Error Handling

The system should show meaningful errors for:
- Server unreachable.
- Invalid geometry.
- Invalid material input.
- Mesh generation failure.
- Solver failure.
- Unsupported element type.

---

## 10. Assumptions

The system assumes:

- 2D analysis only.
- SI unit system.
- Linear elastic isotropic material.
- Small deformation context.
- Backend solver required for simulation.
- Educational accuracy for demo stage.
- Small mesh size for current implementation.
- One main load case per simulation in the academic demo.
- The mobile app acts as the UI and visualization dashboard.
- The backend owns numerical computation and post-processing scalar generation.

---

## 11. Current Academic Demo Limitations

The following limitations should be acknowledged carefully during reporting:

- Current solver baseline focuses on rectangular Q4 meshes.
- Triangle and Delaunay meshing require additional stiffness and assembly support.
- Current load model is closer to a point load than true distributed pressure.
- Dense matrix solving does not scale to large meshes.
- Mesh quality metrics are target features and may need implementation.
- Stress/strain contour is not engineering-grade unless validated.
- Current project list may use mock data until AsyncStorage persistence is implemented.

These limitations are acceptable for an academic prototype as long as they are clearly separated from target and future features.

---

## 12. Implementation Roadmap

### Phase 1 — Stabilize End-to-End Academic Demo

Priority: P0

- Stabilize Q4 rectangle simulation.
- Ensure API works reliably.
- Ensure mobile app can send input and receive output.
- Display original mesh, deformed mesh, displacement values.
- Improve error handling.
- Prepare demo script.

### Phase 2 — Add Information-System Features

Priority: P1

- Add mesh quality metrics:
  - Area.
  - Aspect ratio.
  - Bad element count.
  - Min/max area.
- Add AsyncStorage:
  - Project records.
  - Simulation input.
  - Simulation output.
- Add JSON export.
- Improve result dashboard.

### Phase 3 — Expand Meshing and Visualization Capabilities

Priority: P2

- Add T3 element stiffness support.
- Add Delaunay polygon meshing support.
- Add custom polygon input.
- Add displacement contour.
- Add fixed/load layer toggles.
- Add stress approximation.

---

## 13. Definition of Done

The project is considered complete for the academic demo when:

- The app runs end-to-end from project creation/input to result visualization.
- FastAPI backend runs locally and processes simulation requests.
- Q4 rectangle demo works reliably.
- Result dashboard shows original and deformed mesh.
- Displacement values are returned and displayed.
- Basic mesh quality metrics are available.
- Local storage saves project input and output.
- JSON export works.
- Core FEA functions have basic unit tests.
- Documentation files are complete:
  - `Master_Context.md`
  - `Architecture.md`
  - `Design_System.md`
- A repeatable demo script is prepared.

---

## 14. Demo Script

### Demo Scenario: Rectangle Cantilever Beam

**Goal:** Demonstrate the complete FEA pipeline using a simple 2D cantilever beam.

### Input

- Geometry:
  - Rectangle.
  - Width: 2.0 m.
  - Height: 1.0 m.
- Material:
  - Young's modulus: 20e9 Pa.
  - Poisson's ratio: 0.3.
  - Thickness: 0.1 m.
- Boundary condition:
  - Fixed left edge.
- Load:
  - Downward point load at top-right or right edge.
  - Force: `[0, -10000]` N.
- Mesh:
  - Structured Q4.
  - Coarse run: `nx = 2`, `ny = 1`.
  - Fine run: `nx = 5`, `ny = 2` or higher if stable.

### Demo Steps

1. Open the mobile app.
2. Show Project Home and explain project-based workflow.
3. Create or open a simulation project.
4. Enter rectangle dimensions.
5. Enter material parameters.
6. Configure fixed left edge and downward load.
7. Configure mesh density.
8. Start simulation.
9. Explain backend processing pipeline:
   - Validate input.
   - Generate mesh.
   - Assemble stiffness matrix.
   - Apply boundary conditions.
   - Solve displacement.
   - Post-process output.
10. Show result dashboard:
   - Original mesh.
   - Deformed mesh.
   - Node count.
   - Element count.
   - Displacement values.
   - Quality metrics.
11. Compare coarse vs fine mesh.
12. Export JSON result.
13. Reopen saved project from local history.

### Talking Points

- The app demonstrates a mobile-based engineering workflow.
- The backend performs numerical computation.
- The frontend acts as a visualization and information dashboard.
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
