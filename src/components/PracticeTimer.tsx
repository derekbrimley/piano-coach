import { useState, useEffect, useRef } from 'react';
import { Session } from '../types';
import { analyticsEvents } from '../utils/analytics';

interface PracticeTimerProps {
  session: Session;
  onComplete: () => void;
  onExit?: () => void;
}

const PracticeTimer = ({ session, onComplete, onExit }: PracticeTimerProps) => {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(session.activities[0]?.duration * 60 || 0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activityCompleted, setActivityCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentActivity = session.activities[currentActivityIndex];
  const totalActivities = session.activities.length;

  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setActivityCompleted(true);
            playNotificationSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeRemaining]);

  const handleNextActivity = () => {
    // Track activity completion
    if (currentActivity) {
      analyticsEvents.activityCompleted(currentActivity.type, currentActivity.duration);
    }

    if (currentActivityIndex < totalActivities - 1) {
      const nextIndex = currentActivityIndex + 1;
      setCurrentActivityIndex(nextIndex);
      setTimeRemaining(session.activities[nextIndex].duration * 60);
      setActivityCompleted(false);
      setIsRunning(false);
      setIsPaused(false);
      handleStart();
    } else {
      // Track session completion
      const completedActivities = session.activities.length;
      analyticsEvents.sessionCompleted(session.totalDuration, completedActivities);
      onComplete();
    }
  };

  const playNotificationSound = () => {
    // Simple beep using Web Audio API
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleSkip = () => {
    setIsRunning(false);
    setActivityCompleted(true);
    playNotificationSound();
    handleNextActivity();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = currentActivity
    ? ((currentActivity.duration * 60 - timeRemaining) / (currentActivity.duration * 60)) * 100
    : 0;

  const sessionProgressPercentage = ((currentActivityIndex) / totalActivities) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Exit Button */}
        {onExit && (
          <button
            onClick={onExit}
            className="mb-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
            title="Exit practice session"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Session Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Session Progress</span>
            <span>{currentActivityIndex + 1} / {totalActivities}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${sessionProgressPercentage}%` }}
            />
          </div>
        </div>

        {/* Current Activity */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 mb-2">Current Activity</p>
            <h1 className="text-3xl font-bold mb-2">{currentActivity?.title}</h1>
            <p className="text-gray-600">{currentActivity?.description}</p>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-8">
            <div className="text-8xl font-bold text-blue-500 mb-4">
              {formatTime(timeRemaining)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {activityCompleted ? (
              <button
                onClick={handleNextActivity}
                className="px-8 py-4 bg-green-500 text-white rounded-full text-xl font-semibold hover:bg-green-600 transition shadow-lg"
              >
                {currentActivityIndex < totalActivities - 1 ? 'Next Activity' : 'Finish Session'}
              </button>
            ) : !isRunning ? (
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-blue-500 text-white rounded-full text-xl font-semibold hover:bg-blue-600 transition"
              >
                Start
              </button>
            ) : (
              <>
                <button
                  onClick={handlePause}
                  className="px-8 py-4 bg-yellow-500 text-white rounded-full text-xl font-semibold hover:bg-yellow-600 transition"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={handleSkip}
                  className="px-8 py-4 bg-gray-500 text-white rounded-full text-xl font-semibold hover:bg-gray-600 transition"
                >
                  Skip
                </button>
              </>
            )}
          </div>
        </div>

        {/* Upcoming Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Up Next</h2>
          <div className="space-y-3">
            {session.activities.slice(currentActivityIndex + 1).map((activity) => (
              <div
                key={activity.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg opacity-60"
              >
                <div>
                  <h3 className="font-medium">{activity.title}</h3>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <span className="text-gray-500 font-medium">{activity.duration} min</span>
              </div>
            ))}
            {session.activities.slice(currentActivityIndex + 1).length === 0 && (
              <p className="text-gray-500 text-center py-4">This is your last activity!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeTimer;
