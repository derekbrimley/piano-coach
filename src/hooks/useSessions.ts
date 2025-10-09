import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { Session } from '../types';

interface UseSessionsReturn {
  sessions: Session[];
  loading: boolean;
  addSession: (sessionData: Omit<Session, 'id' | 'userId' | 'date'>) => Promise<string>;
}

export const useSessions = (userId: string | undefined): UseSessionsReturn => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Session[];
      setSessions(sessionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const addSession = async (sessionData: Omit<Session, 'id' | 'userId' | 'date'>): Promise<string> => {
    if (!userId) {
      throw new Error('User must be authenticated to add sessions');
    }

    try {
      const docRef = await addDoc(collection(db, 'sessions'), {
        ...sessionData,
        userId,
        date: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  };

  return { sessions, loading, addSession };
};
