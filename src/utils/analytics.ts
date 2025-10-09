import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '../firebase';

/**
 * Log a custom analytics event
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
};

/**
 * Set user ID for analytics
 */
export const setAnalyticsUserId = (userId: string | null) => {
  if (analytics && userId) {
    setUserId(analytics, userId);
  }
};

/**
 * Set user properties for analytics
 */
export const setAnalyticsUserProperties = (properties: Record<string, any>) => {
  if (analytics) {
    setUserProperties(analytics, properties);
  }
};

// Predefined event helpers for common actions
export const analyticsEvents = {
  // Session events
  sessionGenerated: (sessionLength: number, activityCount: number) => {
    trackEvent('session_generated', { session_length: sessionLength, activity_count: activityCount });
  },

  sessionStarted: (sessionLength: number) => {
    trackEvent('session_started', { session_length: sessionLength });
  },

  sessionCompleted: (sessionLength: number, completedActivities: number) => {
    trackEvent('session_completed', {
      session_length: sessionLength,
      completed_activities: completedActivities
    });
  },

  // Goal events
  goalCreated: (goalType: string) => {
    trackEvent('goal_created', { goal_type: goalType });
  },

  goalDeleted: (goalType: string) => {
    trackEvent('goal_deleted', { goal_type: goalType });
  },

  // Profile events
  pieceAdded: (frequency: string) => {
    trackEvent('piece_added', { review_frequency: frequency });
  },

  scaleUpdated: (key: string, technique: string, bpm: number) => {
    trackEvent('scale_updated', { key, technique, bpm });
  },

  // Practice events
  activityCompleted: (activityType: string, duration: number) => {
    trackEvent('activity_completed', { activity_type: activityType, duration });
  },

  // Auth events
  userSignedUp: () => {
    trackEvent('sign_up', { method: 'email' });
  },

  userSignedIn: () => {
    trackEvent('login', { method: 'email' });
  }
};
