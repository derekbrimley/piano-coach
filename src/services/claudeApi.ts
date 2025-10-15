import type { Activity } from '../types';

// Firebase Cloud Function endpoint
const CLOUD_FUNCTION_URL = import.meta.env.VITE_CLOUD_FUNCTION_URL ||
  'http://localhost:5001/piano-coach-dev/us-central1/generateSession';

export interface GenerateSessionParams {
  skillSummary: string;
  sessionLength: number;
  signal?: AbortSignal;
}

// Main function that calls the Cloud Function
export const generateSessionWithLLM = async (
  params: GenerateSessionParams
): Promise<Activity[]> => {
  try {
    console.log('Cloud Function URL:', CLOUD_FUNCTION_URL);
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skillSummary: params.skillSummary,
        sessionLength: params.sessionLength
      }),
      signal: params.signal
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate session');
    }

    const data = await response.json();
    return data.activities;
  } catch (error) {
    // Don't log abort errors - they're expected when user changes session length
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    console.error('Error calling Cloud Function:', error);
    throw error;
  }
};

// Legacy exports for backwards compatibility (now they all use the Cloud Function)
export const generateSessionWithClaude = generateSessionWithLLM;
export const generateSessionWithOpenAI = generateSessionWithLLM;
