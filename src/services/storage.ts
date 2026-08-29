import { PitchProject } from '../types/pitch';

const getStorageKey = (userId?: string | null) =>
  userId ? `pitchforge_projects_${userId}` : 'pitchforge_guest_projects';

export function getStoredProjects(userId?: string | null): PitchProject[] {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load stored projects:', e);
    return [];
  }
}

export function saveProject(project: PitchProject, userId?: string | null): void {
  try {
    const key = getStorageKey(userId);
    const projects = getStoredProjects(userId);
    const existingIndex = projects.findIndex((p) => p.id === project.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = {
        ...project,
        updatedAt: new Date().toISOString(),
      };
    } else {
      projects.unshift(project);
    }
    localStorage.setItem(key, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save project:', e);
  }
}

export function deleteProject(id: string, userId?: string | null): void {
  try {
    const key = getStorageKey(userId);
    const projects = getStoredProjects(userId).filter((p) => p.id !== id);
    localStorage.setItem(key, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to delete project:', e);
  }
}
