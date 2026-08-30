import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { PitchProject } from '../types/pitch';

// Clean all undefined values and strip nulls where appropriate for Firestore compatibility
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined || obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore).filter((item) => item !== undefined);
  }
  if (typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined && val !== null) {
        res[key] = sanitizeForFirestore(val);
      }
    }
    return res;
  }
  return obj;
}

/**
 * Subscribe to all pitch projects owned by the authenticated user in real-time.
 */
export function subscribeUserProjects(
  userId: string,
  onProjectsChange: (projects: PitchProject[]) => void,
  onError?: (error: any) => void
): () => void {
  const path = 'projects';
  if (!userId || !auth.currentUser) {
    onProjectsChange([]);
    return () => {};
  }

  try {
    const q = query(collection(db, path), where('ownerId', '==', userId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projects: PitchProject[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          projects.push({
            id: data.id || docSnap.id,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            intake: data.intake || {
              startupName: data.startupName || 'Untitled Startup',
              rawIdea: '',
              problem: '',
              targetCustomer: '',
              solution: '',
              businessModel: '',
              stage: 'Idea',
              geography: 'United States / Global',
              existingTraction: '',
              competitors: '',
              competitiveAdvantage: '',
              revenueModel: '',
              teamInfo: '',
              additionalContext: '',
            },
            analysis: data.analysis || undefined,
            slides: Array.isArray(data.slides) ? data.slides : [],
            currentVersion: typeof data.currentVersion === 'number' ? data.currentVersion : 1,
            versions: Array.isArray(data.versions) ? data.versions : [],
            score: data.score || undefined,
            critique: data.critique || undefined,
            decision: data.decision || undefined,
            lastAgentResult: data.lastAgentResult || undefined,
            lastChallenge: data.lastChallenge || undefined,
            status: data.status || 'draft',
          });
        });

        // Sort newest first by updatedAt
        projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        onProjectsChange(projects);
      },
      (error) => {
        console.warn('Firestore user projects subscription notice:', error?.message || error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error('Failed to initialize Firestore query:', error);
    if (onError) onError(error);
    return () => {};
  }
}

/**
 * Persist a pitch project to Firestore with all nested fields, slides, analysis, scores, and version history.
 */
export async function saveProjectToFirestore(
  project: PitchProject,
  userId: string,
  userEmail?: string | null
): Promise<void> {
  const path = `projects/${project.id}`;
  try {
    const rawPayload: Record<string, any> = {
      id: project.id,
      ownerId: userId,
      ownerEmail: userEmail || '',
      startupName: project.intake?.startupName || 'Untitled Startup',
      status: project.status || 'draft',
      currentVersion: project.currentVersion || 1,
      intake: project.intake || {},
      slides: project.slides || [],
      versions: project.versions || [],
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: project.updatedAt || new Date().toISOString(),
    };

    if (project.analysis) {
      rawPayload.analysis = project.analysis;
    }
    if (project.score) {
      rawPayload.score = project.score;
    }
    if (project.critique) {
      rawPayload.critique = project.critique;
    }
    if (project.decision) {
      rawPayload.decision = project.decision;
    }
    if (project.lastAgentResult) {
      rawPayload.lastAgentResult = project.lastAgentResult;
    }
    if (project.lastChallenge) {
      rawPayload.lastChallenge = project.lastChallenge;
    }

    const cleanPayload = sanitizeForFirestore(rawPayload);
    await setDoc(doc(db, 'projects', project.id), cleanPayload, { merge: true });
  } catch (error) {
    console.error('Error saving pitch to Firestore:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a pitch project from Firestore.
 */
export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    console.error('Error deleting pitch from Firestore:', error);
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Fetch all pitch projects belonging to a specific user (one-time fetch).
 */
export async function fetchUserProjects(userId: string): Promise<PitchProject[]> {
  const path = 'projects';
  try {
    const q = query(collection(db, path), where('ownerId', '==', userId));
    const querySnapshot = await getDocs(q);
    const projects: PitchProject[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      projects.push({
        id: data.id || docSnap.id,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        intake: data.intake || { startupName: data.startupName || 'Untitled Startup' },
        analysis: data.analysis || undefined,
        slides: Array.isArray(data.slides) ? data.slides : [],
        currentVersion: typeof data.currentVersion === 'number' ? data.currentVersion : 1,
        versions: Array.isArray(data.versions) ? data.versions : [],
        score: data.score || undefined,
        critique: data.critique || undefined,
        decision: data.decision || undefined,
        lastAgentResult: data.lastAgentResult || undefined,
        lastChallenge: data.lastChallenge || undefined,
        status: data.status || 'draft',
      });
    });

    projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return projects;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
