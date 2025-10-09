import { useState, useEffect } from 'react';
import { collection, doc, setDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { EarTrainingSkills } from '../types';

interface UseEarTrainingReturn {
  earTraining: EarTrainingSkills | null;
  loading: boolean;
  toggleInterval: (interval: string) => Promise<void>;
  toggleChord: (chord: string) => Promise<void>;
}

export const useEarTraining = (userId: string | undefined): UseEarTrainingReturn => {
  const [earTraining, setEarTraining] = useState<EarTrainingSkills | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'earTraining'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const data = snapshot.docs[0].data();
        setEarTraining({
          id: snapshot.docs[0].id,
          ...data
        } as EarTrainingSkills);
      } else {
        // Initialize with empty arrays
        setEarTraining({
          userId,
          intervals: [],
          chords: [],
          updatedAt: new Date().toISOString()
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const toggleInterval = async (interval: string): Promise<void> => {
    if (!userId) {
      throw new Error('User must be authenticated to update ear training');
    }

    try {
      const docId = `${userId}_eartraining`;
      const earTrainingRef = doc(db, 'earTraining', docId);

      const currentIntervals = earTraining?.intervals || [];
      const newIntervals = currentIntervals.includes(interval)
        ? currentIntervals.filter(i => i !== interval)
        : [...currentIntervals, interval];

      await setDoc(earTrainingRef, {
        userId,
        intervals: newIntervals,
        chords: earTraining?.chords || [],
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error toggling interval:', error);
      throw error;
    }
  };

  const toggleChord = async (chord: string): Promise<void> => {
    if (!userId) {
      throw new Error('User must be authenticated to update ear training');
    }

    try {
      const docId = `${userId}_eartraining`;
      const earTrainingRef = doc(db, 'earTraining', docId);

      const currentChords = earTraining?.chords || [];
      const newChords = currentChords.includes(chord)
        ? currentChords.filter(c => c !== chord)
        : [...currentChords, chord];

      await setDoc(earTrainingRef, {
        userId,
        intervals: earTraining?.intervals || [],
        chords: newChords,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error toggling chord:', error);
      throw error;
    }
  };

  return { earTraining, loading, toggleInterval, toggleChord };
};
