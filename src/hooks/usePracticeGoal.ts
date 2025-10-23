import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { PracticeGoal, PracticeGoalStatus } from '../types';

interface UsePracticeGoalReturn {
  practiceGoals: PracticeGoal[]; // Changed from single to array
  allGoals: PracticeGoal[];
  loading: boolean;
  createGoal: (goal: Omit<PracticeGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<PracticeGoal>) => Promise<void>;
  completeGoal: (goalId: string) => Promise<void>;
  abandonGoal: (goalId: string) => Promise<void>;
  extendGoal: (goalId: string, newEndDate: string) => Promise<void>;
}

const MAX_ACTIVE_GOALS = 3;

// Helper function to recursively remove undefined values from objects
const removeUndefined = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = removeUndefined(obj[key]);
      }
    }
    return cleaned;
  }

  return obj;
};

export const usePracticeGoal = (userId: string | undefined): UsePracticeGoalReturn => {
  const [practiceGoals, setPracticeGoals] = useState<PracticeGoal[]>([]); // Changed from single to array
  const [allGoals, setAllGoals] = useState<PracticeGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Query for all goals by user (simpler query to avoid index requirement)
    const q = query(
      collection(db, 'practiceGoals'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const goals: PracticeGoal[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Ensure title is always set, fallback to GOAL_TYPE_LABELS
            title: data.title || (() => {
              const GOAL_TYPE_LABELS: Record<string, string> = {
                performance: 'Performance/Recital',
                specificPiece: 'Learning a Specific Piece',
                exam: 'Exam/Audition',
                sightReading: 'Improve Sight-Reading',
                improvisation: 'Build Improvisation Skills',
                earTrainingGoal: 'Ear Training',
                technique: 'Master Technique',
                other: 'Other'
              };
              return GOAL_TYPE_LABELS[data.goalType] || 'Untitled Goal';
            })()
          } as PracticeGoal;
        });

        // Sort in memory instead of using Firestore orderBy (avoids index requirement)
        const sortedGoals = goals.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setAllGoals(sortedGoals);

        // Find all active goals (up to MAX_ACTIVE_GOALS)
        const activeGoals = sortedGoals.filter(g => g.status === 'active');
        setPracticeGoals(activeGoals);

        setLoading(false);
      },
      (error) => {
        console.error('Error fetching practice goals:', error);
        // If permission error, just set empty state
        setPracticeGoals([]);
        setAllGoals([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const createGoal = async (goalData: Omit<PracticeGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>): Promise<void> => {
    if (!userId) {
      throw new Error('User must be authenticated to create a goal');
    }

    // Check if user already has MAX_ACTIVE_GOALS active goals
    if (practiceGoals.length >= MAX_ACTIVE_GOALS) {
      throw new Error(`You can only have up to ${MAX_ACTIVE_GOALS} active goals at a time. Please complete or abandon an existing goal first.`);
    }

    try {
      const now = new Date().toISOString();

      // Filter out undefined values (Firestore doesn't allow them)
      const cleanData: any = {
        goalType: goalData.goalType,
        title: goalData.title || 'Untitled Goal',
        startDate: goalData.startDate,
        endDate: goalData.endDate,
        userId,
        status: 'active',
        createdAt: now,
        updatedAt: now
      };

      // Only add optional fields if they have values
      if (goalData.specificDetails) {
        cleanData.specificDetails = goalData.specificDetails;
      }

      // Add goalData if present (goal-specific tracking data)
      if (goalData.goalData) {
        cleanData.goalData = removeUndefined(goalData.goalData);
      }

      // Create the new goal
      await addDoc(collection(db, 'practiceGoals'), cleanData);
    } catch (error) {
      console.error('Error creating practice goal:', error);
      throw error;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<PracticeGoal>): Promise<void> => {
    if (!userId) {
      throw new Error('User must be authenticated to update a goal');
    }

    try {
      const goalRef = doc(db, 'practiceGoals', goalId);

      // Filter out undefined values
      const cleanUpdates: any = {
        updatedAt: new Date().toISOString()
      };

      // Only add fields that have values
      if (updates.goalType !== undefined) cleanUpdates.goalType = updates.goalType;
      if (updates.title !== undefined) cleanUpdates.title = updates.title;
      if (updates.startDate !== undefined) cleanUpdates.startDate = updates.startDate;
      if (updates.endDate !== undefined) cleanUpdates.endDate = updates.endDate;
      if (updates.status !== undefined) cleanUpdates.status = updates.status;
      if (updates.specificDetails !== undefined && updates.specificDetails !== '') {
        cleanUpdates.specificDetails = updates.specificDetails;
      }
      if (updates.goalData !== undefined) {
        cleanUpdates.goalData = removeUndefined(updates.goalData);
      }

      await updateDoc(goalRef, cleanUpdates);
    } catch (error) {
      console.error('Error updating practice goal:', error);
      throw error;
    }
  };

  const completeGoal = async (goalId: string): Promise<void> => {
    await updateGoal(goalId, { status: 'completed' });
  };

  const abandonGoal = async (goalId: string): Promise<void> => {
    await updateGoal(goalId, { status: 'abandoned' });
  };

  const extendGoal = async (goalId: string, newEndDate: string): Promise<void> => {
    await updateGoal(goalId, { endDate: newEndDate });
  };

  return {
    practiceGoals, // Changed from single to array
    allGoals,
    loading,
    createGoal,
    updateGoal,
    completeGoal,
    abandonGoal,
    extendGoal
  };
};
