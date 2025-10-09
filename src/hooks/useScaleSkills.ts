import { useState, useEffect } from 'react';
import { collection, doc, setDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { ScaleSkill, ScaleSkillData } from '../types';

interface UseScaleSkillsReturn {
  scaleSkills: ScaleSkill[];
  loading: boolean;
  updateScaleSkill: (scaleKey: string, updates: Partial<ScaleSkillData>) => Promise<void>;
}

export const useScaleSkills = (userId: string | undefined): UseScaleSkillsReturn => {
  const [scaleSkills, setScaleSkills] = useState<ScaleSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'scaleSkills'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const skillsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ScaleSkill[];
      setScaleSkills(skillsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const updateScaleSkill = async (scaleKey: string, updates: Partial<ScaleSkillData>): Promise<void> => {
    if (!userId) {
      throw new Error('User must be authenticated to update scale skills');
    }

    try {
      // Use scale key as document ID for easy retrieval
      const docId = `${userId}_${scaleKey.replace(/\s/g, '_')}`;
      const skillRef = doc(db, 'scaleSkills', docId);

      await setDoc(skillRef, {
        userId,
        key: scaleKey,
        ...updates,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating scale skill:', error);
      throw error;
    }
  };

  return { scaleSkills, loading, updateScaleSkill };
};
