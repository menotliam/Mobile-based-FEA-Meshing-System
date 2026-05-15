export function buildSimulationExportPackage(meshingData) {
  const result = meshingData?.result || {};
  const metadata = result?.metadata || {};
  const dimensions = meshingData?.dimensions || {};
  const physics = meshingData?.physics || {};
  const meshingConfig = meshingData?.meshingConfig || {};

  return {
    exportVersion: '1.0',
    createdAt: new Date().toISOString(),
    project: {
      name: buildExportProjectName(dimensions),
      description: buildExportProjectDescription(metadata, meshingConfig),
      lastSimulationStatus: result.status || 'unknown',
    },
    input: {
      shape: meshingData?.shape || 'Rectangle',
      dimensions,
      coordinates: meshingData?.coordinates || [],
      material: {
        name: 'Custom Material',
        model: 'linear_elastic_isotropic',
        youngModulus: physics.youngModulus,
        poissonRatio: physics.poissonRatio,
        thickness: physics.thickness,
        unitSystem: 'SI',
      },
      boundaryConditions: {
        constraints: [
          {
            type: 'fixed',
            target: 'edge',
            selector: { edge: 'left' },
            dof: ['u', 'v'],
          },
        ],
        loads: [
          {
            type: 'point_load',
            target: 'coordinate',
            coordinate: [dimensions.width, dimensions.height],
            force: [0, -Math.abs(Number(physics.pressure || 0))],
          },
        ],
      },
      meshConfig: {
        algorithm: 'structured',
        elementType: 'quad',
        nx: meshingConfig.nx,
        ny: meshingConfig.ny,
        minAngleDeg: meshingConfig.minAngle,
        maxArea: meshingConfig.maxArea,
      },
      solverSettings: {
        analysisType: 'linear_static',
        scaleFactor: metadata.scaleFactor || 200,
      },
    },
    output: result?.data || {},
    metadata: {
      ...metadata,
      source: 'Mobile-based FEA Meshing System',
      accuracyLevel: 'educational_demo',
    },
  };
}

export function stringifySimulationExport(meshingData) {
  return JSON.stringify(buildSimulationExportPackage(meshingData), null, 2);
}

function buildExportProjectName(dimensions) {
  const width = dimensions?.width ?? '-';
  const height = dimensions?.height ?? '-';
  return `Rectangle ${width}m × ${height}m`;
}

function buildExportProjectDescription(metadata, meshingConfig) {
  const elementType = metadata?.elementType || 'quad';
  const nx = metadata?.meshInfo?.nx ?? meshingConfig?.nx ?? '-';
  const ny = metadata?.meshInfo?.ny ?? meshingConfig?.ny ?? '-';
  return `Structured ${String(elementType).toUpperCase()} mesh, NX=${nx}, NY=${ny}`;
}
