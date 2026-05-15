# Presentation Script — Mobile-based FEA Meshing System

## 1. Opening

Today I will present our multidisciplinary project: **Mobile-based FEA Meshing System**.

This project combines **Information Systems**, **Software Engineering**, and **2D Finite Element Analysis**. The goal is to build a mobile app that allows users to define 2D geometry, configure material and mesh parameters, run a Python backend simulation, visualize the result, manage project history, and export simulation data.

The system is not intended to replace industrial FEA software. It is an educational and engineering prototype that demonstrates the complete workflow from geometry to mesh, solving, visualization, storage, and export.

---

## 2. System Overview

The system has two main parts:

1. **React Native mobile app**
   - Geometry input.
   - Mesh and physics setup.
   - Processing status.
   - Result dashboard.
   - Project history.
   - JSON export.

2. **Python FastAPI backend**
   - Request validation.
   - Simulation pipeline orchestration.
   - FEA core computation.
   - Mesh/result/quality response formatting.

The high-level flow is:

```text
Mobile App
→ FastAPI Backend
→ Simulation Pipeline
→ FEA Core
→ Structured Response
→ Mobile Dashboard and Local Storage
```

---

## 3. Implemented Simulation Modes

The current system supports three simulation modes:

| Geometry | Algorithm | Element Type |
|---|---|---|
| Rectangle | Structured | Q4 |
| Rectangle | Structured | T3 |
| Custom Polygon | Delaunay | T3 |

For polygon mode, the user enters points in `x,y` format. The system automatically uses Delaunay triangulation and T3 triangular elements.

---

## 4. Backend Pipeline

The backend pipeline is organized through `SimulationPipeline`.

Main stages:

```text
Validate input
→ Build internal FEM config
→ Generate mesh
→ Build material matrix
→ Assemble global stiffness matrix
→ Apply boundary conditions
→ Solve linear system
→ Post-process displacement
→ Compute quality metrics
→ Format API response
```

The backend returns structured data containing:

- Mesh nodes and elements.
- Deformed nodes.
- Displacements.
- Displacement magnitude.
- Boundary visualization markers.
- Mesh quality metrics.
- Simulation metadata.

---

## 5. FEA Explanation

The current simulation is a 2D linear static educational demo.

The material is linear elastic and isotropic. The solver computes nodal displacement using the standard finite element equation:

```text
K * U = F
```

Where:

- `K` is the global stiffness matrix.
- `U` is the displacement vector.
- `F` is the force vector.

The backend supports:

- Q4 quadrilateral element computation from the original academic core.
- T3 triangular element computation using constant strain triangle formulation.
- Q4/T3 assembly dispatching.

---

## 6. Mobile Workflow

The user starts from **My Projects**.

Demo flow:

```text
My Projects
→ Geometry Editor
→ Choose Rectangle or Custom Polygon
→ Choose Q4 or T3 when applicable
→ Enter material and load parameters
→ Start Generation
→ Processing Status
→ Mesh & Quality View
→ Export JSON
→ Return to My Projects
```

The Geometry Editor supports:

- Rectangle width and height input.
- Custom polygon point input.
- Q4/T3 element selection for rectangle.
- Automatic Delaunay + T3 for polygon.

---

## 7. Result Dashboard

The result dashboard shows:

- Original mesh.
- Deformed mesh.
- Displacement contour lite.
- Fixed support markers.
- Load vector markers.
- Bad element highlight layer.
- Node count and element count.
- Maximum displacement.
- Simulation metadata.
- Boundary summary.
- Mesh quality metrics.

The dashboard labels are dynamic:

```text
RECTANGLE Q4 • STRUCTURED
RECTANGLE T3 • STRUCTURED
POLYGON T3 • DELAUNAY
```

This helps the reviewer understand exactly which mode is being inspected.

---

## 8. Information System Features

The system includes project management features to fit the Information Systems direction:

- Local project history using AsyncStorage.
- Project search.
- Project rename.
- Project delete.
- Project detail modal.
- Latest mesh preview.
- Latest simulation summary.
- JSON export package.

This means the app manages simulation data, not only one-time computation.

---

## 9. Demo Order

Recommended final demo order:

1. Rectangle Q4 structured mesh.
2. Rectangle T3 structured mesh.
3. Custom Polygon Delaunay T3 mesh.
4. Layer toggles and displacement contour.
5. Project history and project detail.
6. JSON export.

---

## 10. Limitations

Current limitations:

- Educational accuracy rather than engineering-grade validation.
- Dense matrix solving, suitable for small meshes only.
- Polygon mode works best with simple or convex point sets.
- Robust concave polygon clipping is future work.
- Stress/strain validation is future work.
- Current load model is simplified as a point load.

These limitations are acceptable for the academic prototype and are clearly documented.

---

## 11. Closing

This project demonstrates a complete mobile-based FEA meshing and simulation workflow.

It combines a React Native app, a Python FastAPI backend, FEA computation modules, project history, result dashboard, and exportable simulation data.

The final implementation supports Q4, T3, and Delaunay custom polygon demo flows, making it suitable for academic presentation and technical evaluation.
