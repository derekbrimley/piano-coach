import { useState, useEffect } from 'react';
import { collection, doc, setDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserPreferences, PracticeFocus } from '../types';

interface UseUserPreferencesReturn {
  preferences: UserPreferences | null;
  loading: boolean;
  updatePracticeFocus: (focus: PracticeFocus) => Promise<void>;
  updateDefaultSessionLength: (length: number) => Promise<void>;
}

export const useUserPreferences = (userId: string | undefined): UseUserPreferencesReturn => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'userPreferences'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const data = snapshot.docs[0].data();
        setPreferences({
          id: snapshot.docs[0].id,
          ...data
        } as UserPreferences);
      } else {
        // Initialize with default
        setPreferences({
          userId,
          practiceFocus: 'newPieces',
          updatedAt: new Date().toISOString()
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const updatePracticeFocus = async (focus: PracticeFocus): Promise<void> => {
    if (!userId) {
      throw new Error('User must be authenticated to update preferences');
    }

    try {
      const docId = `${userId}_preferences`;
      const preferencesRef = doc(db, 'userPreferences', docId);

      await setDoc(preferencesRef, {
        userId,
        practiceFocus: focus,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating practice focus:', error);
      throw error;
    }
  };

  const updateDefaultSessionLength = async (length: number): Promise<void> => {
    if (!userId) {
      throw new Error('User must be authenticated to update preferences');
    }

    try {
      const docId = `${userId}_preferences`;
      const preferencesRef = doc(db, 'userPreferences', docId);

      await setDoc(preferencesRef, {
        userId,
        defaultSessionLength: length,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating default session length:', error);
      throw error;
    }
  };

  return { preferences, loading, updatePracticeFocus, updateDefaultSessionLength };
};
