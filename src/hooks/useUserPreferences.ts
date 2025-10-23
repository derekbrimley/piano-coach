import { useState, useEffect } from 'react';
import { collection, doc, setDoc, onSnapshot, query, where, type DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserPreferences } from '../types';

interface UseUserPreferencesReturn {
  preferences: UserPreferences | null;
  loading: boolean;
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
        const doc = snapshot.docs[0] as DocumentData;
        const data = doc.data();
        setPreferences({
          id: doc.id,
          ...data
        } as UserPreferences);
      } else {
        // Initialize with default
        setPreferences({
          userId,
          updatedAt: new Date().toISOString()
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

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

  return { preferences, loading, updateDefaultSessionLength };
};
