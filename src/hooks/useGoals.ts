import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { Goal, GoalFormData } from '../types';

interface UseGoalsReturn {
  goals: Goal[];
  loading: boolean;
  addGoal: (goalData: GoalFormData) => Promise<string>;
  updateGoal: (goalId: string, updates: Partial<GoalFormData>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
}

export const useGoals = (userId: string | undefined): UseGoalsReturn => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'goals'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Goal[];
      setGoals(goalsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const addGoal = async (goalData: GoalFormData): Promise<string> => {
    if (!userId) {
      throw new Error('User must be authenticated to add goals');
    }

    try {
      const docRef = await addDoc(collection(db, 'goals'), {
        ...goalData,
        userId,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<GoalFormData>): Promise<void> => {
    try {
      const goalRef = doc(db, 'goals', goalId);
      await updateDoc(goalRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const deleteGoal = async (goalId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'goals', goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  return { goals, loading, addGoal, updateGoal, deleteGoal };
};
