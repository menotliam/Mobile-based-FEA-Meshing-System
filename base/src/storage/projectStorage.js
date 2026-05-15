import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECTS_KEY = 'fea.projects';
const SIMULATIONS_KEY_PREFIX = 'fea.simulations.';

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readJson(key, fallback) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Invalid local storage payload for ${key}:`, error);
    return fallback;
  }
}

async function writeJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getProjects() {
  const projects = await readJson(PROJECTS_KEY, []);
  return Array.isArray(projects) ? projects : [];
}

export async function saveProjects(projects) {
  await writeJson(PROJECTS_KEY, projects);
}

export async function getSimulations(projectId) {
  if (!projectId) return [];
  const simulations = await readJson(`${SIMULATIONS_KEY_PREFIX}${projectId}`, []);
  return Array.isArray(simulations) ? simulations : [];
}

export async function saveSimulationPackage({ project, input, output }) {
  const createdAt = nowIso();
  const projectId = project?.id || createId('project');
  const metadata = output?.metadata || {};
  const existingProjects = await getProjects();

  const projectRecord = {
    id: projectId,
    name: project?.name || buildProjectName(input, metadata),
    description: project?.description || buildProjectDescription(input, metadata),
    createdAt: project?.createdAt || createdAt,
    updatedAt: createdAt,
    lastSimulationStatus: output?.status === 'success' ? 'success' : 'failed',
    thumbnail: null,
  };

  const projectIndex = existingProjects.findIndex((item) => item.id === projectId);
  const nextProjects = [...existingProjects];
  if (projectIndex >= 0) {
    nextProjects[projectIndex] = {
      ...nextProjects[projectIndex],
      ...projectRecord,
      createdAt: nextProjects[projectIndex].createdAt || projectRecord.createdAt,
    };
  } else {
    nextProjects.unshift(projectRecord);
  }
  await saveProjects(nextProjects);

  const simulationRecord = {
    id: createId('simulation'),
    projectId,
    name: buildSimulationName(input, metadata),
    input,
    output,
    metadata,
    createdAt,
  };

  const simulations = await getSimulations(projectId);
  await writeJson(`${SIMULATIONS_KEY_PREFIX}${projectId}`, [simulationRecord, ...simulations]);

  return {
    project: projectRecord,
    simulation: simulationRecord,
  };
}

export async function clearAllProjects() {
  const projects = await getProjects();
  const keys = projects.map((project) => `${SIMULATIONS_KEY_PREFIX}${project.id}`);
  await AsyncStorage.multiRemove([PROJECTS_KEY, ...keys]);
}

function buildProjectName(input, metadata) {
  const width = input?.dimensions?.width ?? input?.geometry?.rectangle?.width ?? 2;
  const height = input?.dimensions?.height ?? input?.geometry?.rectangle?.height ?? 1;
  return `Rectangle ${width}m × ${height}m`;
}

function buildProjectDescription(input, metadata) {
  const elementType = metadata?.elementType || input?.meshingConfig?.elementType || 'quad';
  const nx = metadata?.meshInfo?.nx ?? input?.meshingConfig?.nx ?? '-';
  const ny = metadata?.meshInfo?.ny ?? input?.meshingConfig?.ny ?? '-';
  return `Structured ${elementType.toUpperCase()} mesh, NX=${nx}, NY=${ny}`;
}

function buildSimulationName(input, metadata) {
  const elementCount = metadata?.elementCount ?? '-';
  const nodeCount = metadata?.nodeCount ?? '-';
  return `Run: ${elementCount} elements, ${nodeCount} nodes`;
}
