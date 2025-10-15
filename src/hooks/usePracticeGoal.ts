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
        const goals: PracticeGoal[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PracticeGoal));

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
        startDate: goalData.startDate,
        endDate: goalData.endDate,
        userId,
        status: 'active',
        createdAt: now,
        updatedAt: now
      };

      // Only add specificDetails if it has a value
      if (goalData.specificDetails) {
        cleanData.specificDetails = goalData.specificDetails;
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
      if (updates.startDate !== undefined) cleanUpdates.startDate = updates.startDate;
      if (updates.endDate !== undefined) cleanUpdates.endDate = updates.endDate;
      if (updates.status !== undefined) cleanUpdates.status = updates.status;
      if (updates.specificDetails !== undefined && updates.specificDetails !== '') {
        cleanUpdates.specificDetails = updates.specificDetails;
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
