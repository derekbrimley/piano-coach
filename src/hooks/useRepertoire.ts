import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import type { RepertoirePiece, RepertoirePieceData } from '../types';

interface UseRepertoireReturn {
  pieces: RepertoirePiece[];
  loading: boolean;
  addPiece: (pieceData: RepertoirePieceData) => Promise<string>;
  updatePiece: (pieceId: string, updates: Partial<RepertoirePieceData>) => Promise<void>;
  deletePiece: (pieceId: string) => Promise<void>;
  markAsReviewed: (pieceId: string) => Promise<void>;
}

export const useRepertoire = (userId: string | undefined): UseRepertoireReturn => {
  const [pieces, setPieces] = useState<RepertoirePiece[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'repertoire'),
      where('userId', '==', userId),
      orderBy('addedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const piecesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RepertoirePiece[];
      setPieces(piecesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const addPiece = async (pieceData: RepertoirePieceData): Promise<string> => {
    if (!userId) {
      throw new Error('User must be authenticated to add repertoire pieces');
    }

    try {
      const docRef = await addDoc(collection(db, 'repertoire'), {
        ...pieceData,
        userId,
        addedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding piece:', error);
      throw error;
    }
  };

  const updatePiece = async (pieceId: string, updates: Partial<RepertoirePieceData>): Promise<void> => {
    try {
      const pieceRef = doc(db, 'repertoire', pieceId);
      await updateDoc(pieceRef, updates);
    } catch (error) {
      console.error('Error updating piece:', error);
      throw error;
    }
  };

  const deletePiece = async (pieceId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'repertoire', pieceId));
    } catch (error) {
      console.error('Error deleting piece:', error);
      throw error;
    }
  };

  const markAsReviewed = async (pieceId: string): Promise<void> => {
    try {
      const pieceRef = doc(db, 'repertoire', pieceId);
      const reviewDate = new Date().toISOString();
      await updateDoc(pieceRef, {
        lastReviewed: reviewDate,
        practiceHistory: arrayUnion({ date: reviewDate })
      });
    } catch (error) {
      console.error('Error marking piece as reviewed:', error);
      throw error;
    }
  };

  return { pieces, loading, addPiece, updatePiece, deletePiece, markAsReviewed };
};
