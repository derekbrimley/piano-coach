import React, { useState, useEffect, useRef } from 'react';
import { generateSession, createActivityFromExercise } from '../utils/sessionGenerator';
import { generateSessionWithLLM } from '../services/claudeApi';
import { generateUserSkillSummary, formatSkillSummaryForLLM } from '../utils/userSkillSummary';
import { useAuth } from '../contexts/AuthContext';
import { useRepertoire } from '../hooks/useRepertoire';
import { useScaleSkills } from '../hooks/useScaleSkills';
import { useEarTraining } from '../hooks/useEarTraining';
import { useUserPreferences } from '../hooks/useUserPreferences';
import ExerciseSelector from './ExerciseSelector';
import type { Activity, Exercise, Goal, Session, NewPieceGoal } from '../types';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { attachClosestEdge, type Edge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { analyticsEvents } from '../utils/analytics';


interface SessionGeneratorProps {
  goals: Goal[];
  onSessionCreated: (session: Session) => void;
  onBack: () => void;
}

const CACHE_KEY = 'piano_coach_cached_session';

interface CachedSession {
  activities: Activity[];
  sessionLength: number;
  timestamp: number;
  userId: string;
}

const SessionGenerator: React.FC<SessionGeneratorProps> = ({ goals, onSessionCreated }) => {
  const { user } = useAuth();
  const { pieces: repertoire } = useRepertoire(user?.uid);
  const { scaleSkills } = useScaleSkills(user?.uid);
  const { earTraining } = useEarTraining(user?.uid);
  const { preferences } = useUserPreferences(user?.uid);

  // Try to load cached session on mount
  const loadCachedSession = (): CachedSession | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached && user?.uid) {
        const parsed: CachedSession = JSON.parse(cached);
        // Only use cache if it's for the same user
        if (parsed.userId === user.uid) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading cached session:', error);
    }
    return null;
  };

  const cachedSession = loadCachedSession();
  const [sessionLength, setSessionLength] = useState(
    cachedSession?.sessionLength || preferences?.defaultSessionLength || 60
  );
  const [activities, setActivities] = useState<Activity[]>(cachedSession?.activities || []);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [closestEdge, setClosestEdge] = useState<{ index: number; edge: Edge } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set up auto-scroll for dragging
  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) return;

    return autoScrollForElements({
      element,
    });
  }, []);

  // Save session to cache whenever activities or session length changes
  useEffect(() => {
    if (activities.length > 0 && user?.uid) {
      const cacheData: CachedSession = {
        activities,
        sessionLength,
        timestamp: Date.now(),
        userId: user.uid
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    }
  }, [activities, sessionLength, user?.uid]);

  // Track previous session length to detect changes
  const prevSessionLengthRef = useRef(sessionLength);

  useEffect(() => {
    // If session length changed, clear activities to trigger regeneration
    if (prevSessionLengthRef.current !== sessionLength) {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setActivities([]);
      isGeneratingRef.current = false;
      prevSessionLengthRef.current = sessionLength;
    }
  }, [sessionLength]);

  useEffect(() => {
    // Skip if we already have cached activities for this session length
    if (activities.length > 0) {
      return;
    }

    // Prevent duplicate calls in React Strict Mode
    if (isGeneratingRef.current) {
      return;
    }

    const generateWithLLM = async () => {
      // Create a new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      isGeneratingRef.current = true;
      setIsGenerating(true);
      try {
        // Filter only newPiece goals
        const newPieceGoals = goals.filter(g => g.type === 'newPiece') as NewPieceGoal[];

        // Generate skill summary
        const summary = generateUserSkillSummary(
          preferences?.practiceFocus || 'newPieces',
          newPieceGoals,
          repertoire,
          scaleSkills,
          earTraining
        );

        const skillSummary = formatSkillSummaryForLLM(summary);

        // Call LLM API (Claude or OpenAI) with abort signal
        const generated = await generateSessionWithLLM({
          skillSummary,
          sessionLength,
          signal: abortController.signal
        });

        // Only update activities if this request wasn't aborted
        if (!abortController.signal.aborted) {
          setActivities(generated);
          analyticsEvents.sessionGenerated(sessionLength, generated.length);
        }
      } catch (error) {
        // Don't handle errors if the request was aborted
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('Session generation cancelled');
          return;
        }

        console.error('LLM generation failed, using fallback:', error);
        // Only use fallback if not aborted
        if (!abortController.signal.aborted) {
          const generated = generateSession(goals, repertoire, sessionLength);
          setActivities(generated);
          analyticsEvents.sessionGenerated(sessionLength, generated.length);
        }
      } finally {
        // Only reset state if this request wasn't aborted
        if (!abortController.signal.aborted) {
          setIsGenerating(false);
          isGeneratingRef.current = false;
          abortControllerRef.current = null;
        }
      }
    };

    generateWithLLM();
  }, [sessionLength, activities.length]); // Re-run when session length or activities length changes

  const handleStartSession = () => {
    const sessionActivities = activities.map(activity => ({
      ...activity,
    }));
    onSessionCreated({
      activities: sessionActivities,
      totalDuration: sessionLength,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    // Clear cache when starting a session so next time generates fresh
    localStorage.removeItem(CACHE_KEY);
    // Track session start
    analyticsEvents.sessionStarted(sessionLength);
  };

  const handleAddExercise = () => {
    setReplacingIndex(null);
    setShowExerciseSelector(true);
  };

  const handleReplaceExercise = (index: number) => {
    setReplacingIndex(index);
    setShowExerciseSelector(true);
  };

  const handleRemoveExercise = (index: number) => {
    setActivities(prev => prev.filter((_, i) => i !== index));
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    const newActivity = createActivityFromExercise(exercise, activities.length);

    if (replacingIndex !== null) {
      // Replace existing activity
      setActivities(prev => prev.map((act, i) => i === replacingIndex ? newActivity : act));
    } else {
      // Add new activity
      setActivities(prev => [...prev, newActivity]);
    }
  };

  const handleDurationChange = (index: number, newDuration: number) => {
    if (newDuration > 0 && newDuration <= 120) {
      setActivities(prev => prev.map((act, i) =>
        i === index ? { ...act, duration: newDuration } : act
      ));
    }
  };

  const reorderActivities = (sourceIndex: number, destinationIndex: number, edge: Edge) => {
    if (sourceIndex === destinationIndex) return;

    const newActivities = [...activities];
    const [movedItem] = newActivities.splice(sourceIndex, 1);

    // Adjust destination index based on edge
    let targetIndex = destinationIndex;
    if (edge === 'bottom') {
      targetIndex = destinationIndex + 1;
    }
    if (sourceIndex < destinationIndex && edge === 'bottom') {
      targetIndex = destinationIndex;
    }
    if (sourceIndex < destinationIndex && edge === 'top') {
      targetIndex = destinationIndex - 1;
    }

    newActivities.splice(targetIndex, 0, movedItem);
    setActivities(newActivities);
  };

  const totalTime = activities.reduce((sum, a) => sum + a.duration, 0);

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-6">
      <div className="mb-3 flex-shrink-0">
        <h1 className="text-3xl font-bold mb-2">Your Practice Session</h1>
        <p className="text-gray-600">Review and customize your session</p>
      </div>



      

      {/* Activities List */}
      <div
        ref={scrollContainerRef}
        className="space-y-3 mb-6 flex-1 overflow-y-auto px-1"
      >
        {/* Session Length Selector */}
        <div className="mb-6 bg-gray-50 rounded-lg flex-shrink-0">
          <label className="block text-sm font-medium mb-3">Session Length</label>
          <div className="flex gap-2">
            {[30, 45, 60, 90].map(length => (
              <button
                key={length}
                onClick={() => setSessionLength(length)}
                className={`px-4 py-2 rounded-lg ${
                  sessionLength === length
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-300 hover:border-blue-500'
                }`}
              >
                {length} min
              </button>
            ))}
          </div>
        </div>
        {activities.map((activity, index) => (
          <DraggableActivity
            key={activity.id}
            activity={activity}
            index={index}
            isDragging={draggingIndex === index}
            closestEdge={closestEdge?.index === index ? closestEdge.edge : null}
            onDurationChange={handleDurationChange}
            onReplace={handleReplaceExercise}
            onRemove={handleRemoveExercise}
            onReorder={reorderActivities}
            setDraggingIndex={setDraggingIndex}
            setClosestEdge={setClosestEdge}
          />
        ))}
        {/* Add Exercise Button */}
        <button
          onClick={handleAddExercise}
          disabled={isGenerating}
          className={`w-full mb-6 px-6 py-3 border-2 border-dashed rounded-lg transition flex items-center justify-center gap-2 flex-shrink-0 ${
            isGenerating
              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600'
          }`}
        >
          <span className="text-xl">+</span>
          Add Exercise
        </button>
      </div>

      {/* Loading Indicator */}
      {isGenerating && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center flex-shrink-0">
          <p className="text-blue-700">Generating your personalized practice session...</p>
        </div>
      )}

      

      {/* Summary and Actions */}
      <div className="bg-white border-t border-gray-200 pt-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600">Total Session Time</p>
            <p className="text-2xl font-bold">{totalTime} minutes</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleStartSession}
              disabled={isGenerating}
              className={`px-6 py-2 rounded-lg transition ${
                isGenerating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Start Session
            </button>
          </div>
        </div>
      </div>

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <ExerciseSelector
          onSelect={handleExerciseSelect}
          onClose={() => {
            setShowExerciseSelector(false);
            setReplacingIndex(null);
          }}
        />
      )}
    </div>
  );
};

interface DraggableActivityProps {
  activity: Activity;
  index: number;
  isDragging: boolean;
  closestEdge: Edge | null;
  onDurationChange: (index: number, newDuration: number) => void;
  onReplace: (index: number) => void;
  onRemove: (index: number) => void;
  onReorder: (sourceIndex: number, destinationIndex: number, edge: Edge) => void;
  setDraggingIndex: (index: number | null) => void;
  setClosestEdge: (edge: { index: number; edge: Edge } | null) => void;
}

const DraggableActivity: React.FC<DraggableActivityProps> = ({
  activity,
  index,
  isDragging,
  closestEdge,
  onDurationChange,
  onReplace,
  onRemove,
  onReorder,
  setDraggingIndex,
  setClosestEdge,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    const dragHandle = dragHandleRef.current;
    if (!element || !dragHandle) return;

    // Set up draggable
    const cleanupDraggable = draggable({
      element: dragHandle,
      getInitialData: () => ({ index }),
      onDragStart: () => setDraggingIndex(index),
      onDrop: () => {
        setDraggingIndex(null);
        setClosestEdge(null);
      },
    });

    // Set up drop target
    const cleanupDropTarget = dropTargetForElements({
      element: element,
      getData: ({ input }) => {
        const data = { index };
        return attachClosestEdge(data, {
          element,
          input,
          allowedEdges: ['top', 'bottom'],
        });
      },
      onDrag: ({ self, source }) => {
        const isSource = source.element === element;
        if (isSource) {
          setClosestEdge(null);
          return;
        }

        const edge = extractClosestEdge(self.data);
        if (edge) {
          setClosestEdge({ index, edge });
        }
      },
      onDragLeave: () => {
        setClosestEdge(null);
      },
      onDrop: ({ source, self }) => {
        const sourceIndex = source.data.index as number;
        const edge = extractClosestEdge(self.data);
        if (sourceIndex !== index && edge) {
          onReorder(sourceIndex, index, edge);
        }
        setClosestEdge(null);
      },
    });

    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [index, onReorder, setDraggingIndex, setClosestEdge]);

  return (
    <div
      ref={elementRef}
      className="relative"
    >
      {closestEdge === 'top' && <DropIndicator edge="top" />}
      <div
        className={`p-4 bg-white border-2 rounded-lg transition-all duration-200 ${
          isDragging
            ? 'opacity-40 scale-95 border-blue-500'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Drag Handle */}
            <div
              ref={dragHandleRef}
              className="mt-1 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition"
            >
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="7" cy="6" r="1.5" />
                <circle cx="12" cy="6" r="1.5" />
                <circle cx="17" cy="6" r="1.5" />
                <circle cx="7" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="17" cy="12" r="1.5" />
                <circle cx="7" cy="18" r="1.5" />
                <circle cx="12" cy="18" r="1.5" />
                <circle cx="17" cy="18" r="1.5" />
              </svg>
            </div>

            <div className="flex-1">
              <span className="text-sm text-gray-500">Activity {index + 1}</span>
              <h3 className="text-lg font-semibold">{activity.title}</h3>
              <p className="text-sm text-gray-600">{activity.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Editable Duration */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="120"
                value={activity.duration}
                onChange={(e) => onDurationChange(index, parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-2xl font-bold text-blue-500 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm text-gray-600">min</span>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => onReplace(index)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                title="Replace exercise"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => onRemove(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Remove exercise"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {activity.suggestions && activity.suggestions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Ideas to try:</p>
            <div className="space-y-2">
              <ul className="list-disc list-inside">
                {activity.suggestions.map((suggestion, i) => (
                  <li key={`${activity.id}-suggestion-${i}`}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      {closestEdge === 'bottom' && <DropIndicator edge="bottom" />}
    </div>
  );
};

export default SessionGenerator;
