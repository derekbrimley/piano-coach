import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateSessionWithLLM, generateSessionWithClaude, generateSessionWithOpenAI, type GenerateSessionParams } from './claudeApi';
import type { Activity } from '../types';

// Mock fetch globally
global.fetch = vi.fn();

describe('claudeApi.ts', () => {
  const mockActivityResponse: Activity[] = [
    {
      id: '1',
      type: 'warmup',
      title: 'Scales Warmup',
      description: 'Practice major scales',
      duration: 5,
      suggestions: 'Start with C major',
    },
    {
      id: '2',
      type: 'technique',
      title: 'Hanon Exercises',
      description: 'Finger independence',
      duration: 10,
      suggestions: 'Focus on evenness',
    },
    {
      id: '3',
      type: 'repertoire',
      title: 'Beethoven Sonata',
      description: 'Practice problematic section',
      duration: 15,
      suggestions: 'Slow practice at 80 BPM',
    },
  ];

  const mockSuccessResponse = {
    activities: mockActivityResponse,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('generateSessionWithLLM', () => {
    it('should successfully generate a session with valid parameters', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSuccessResponse),
      });
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'User is intermediate pianist with 5 years experience',
        sessionLength: 30,
      };

      const result = await generateSessionWithLLM(params);

      expect(result).toEqual(mockActivityResponse);
      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('generateSession'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            skillSummary: params.skillSummary,
            sessionLength: params.sessionLength,
          }),
        })
      );
    });

    it('should return activities in correct format', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSuccessResponse),
      });
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'Beginner pianist',
        sessionLength: 20,
      };

      const result = await generateSessionWithLLM(params);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('duration');
    });

    it('should handle fetch errors gracefully', async () => {
      const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'Test',
        sessionLength: 30,
      };

      await expect(generateSessionWithLLM(params)).rejects.toThrow('Network error');
    });

    it('should throw error when response is not ok', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce({
          message: 'Invalid skill summary',
        }),
      });
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'Invalid',
        sessionLength: 30,
      };

      await expect(generateSessionWithLLM(params)).rejects.toThrow('Invalid skill summary');
    });

    it('should throw generic error when response body has no message', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce({}),
      });
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'Test',
        sessionLength: 30,
      };

      await expect(generateSessionWithLLM(params)).rejects.toThrow('Failed to generate session');
    });

    it('should pass AbortSignal to fetch when provided', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSuccessResponse),
      });
      global.fetch = mockFetch;

      const abortController = new AbortController();
      const params: GenerateSessionParams = {
        skillSummary: 'Test',
        sessionLength: 30,
        signal: abortController.signal,
      };

      await generateSessionWithLLM(params);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          signal: abortController.signal,
        })
      );
    });

    it('should not log abort errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const abortError = new DOMException('Aborted', 'AbortError');
      const mockFetch = vi.fn().mockRejectedValueOnce(abortError);
      global.fetch = mockFetch;

      const abortController = new AbortController();
      const params: GenerateSessionParams = {
        skillSummary: 'Test',
        sessionLength: 30,
        signal: abortController.signal,
      };

      await expect(generateSessionWithLLM(params)).rejects.toThrow();
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should log non-abort errors to console', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Unknown error'));
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'Test',
        sessionLength: 30,
      };

      await expect(generateSessionWithLLM(params)).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error calling Cloud Function:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should use default Cloud Function URL from env', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSuccessResponse),
      });
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'Test',
        sessionLength: 30,
      };

      await generateSessionWithLLM(params);

      // Verify fetch was called with the correct URL pattern
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toContain('generateSession');
    });

    it('should handle session with different session lengths', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSuccessResponse),
      });
      global.fetch = mockFetch;

      const sessionLengths = [15, 30, 45, 60];

      for (const length of sessionLengths) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValueOnce(mockSuccessResponse),
        });

        const params: GenerateSessionParams = {
          skillSummary: 'Test',
          sessionLength: length,
        };

        const result = await generateSessionWithLLM(params);
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      }
    });

    it('should handle empty activities array', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          activities: [],
        }),
      });
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'Test',
        sessionLength: 30,
      };

      const result = await generateSessionWithLLM(params);
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should include all required fields in POST request body', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSuccessResponse),
      });
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'Advanced pianist preparing for concert',
        sessionLength: 45,
      };

      await generateSessionWithLLM(params);

      const [, fetchOptions] = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchOptions.body as string);

      expect(body).toHaveProperty('skillSummary', 'Advanced pianist preparing for concert');
      expect(body).toHaveProperty('sessionLength', 45);
      expect(Object.keys(body).length).toBe(2);
    });
  });

  describe('Backwards compatibility exports', () => {
    it('generateSessionWithClaude should be an alias for generateSessionWithLLM', () => {
      expect(generateSessionWithClaude).toBe(generateSessionWithLLM);
    });

    it('generateSessionWithOpenAI should be an alias for generateSessionWithLLM', () => {
      expect(generateSessionWithOpenAI).toBe(generateSessionWithLLM);
    });

    it('generateSessionWithClaude should work identically to generateSessionWithLLM', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSuccessResponse),
      });
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'Test',
        sessionLength: 30,
      };

      const result = await generateSessionWithClaude(params);
      expect(result).toEqual(mockActivityResponse);
    });

    it('generateSessionWithOpenAI should work identically to generateSessionWithLLM', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSuccessResponse),
      });
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'Test',
        sessionLength: 30,
      };

      const result = await generateSessionWithOpenAI(params);
      expect(result).toEqual(mockActivityResponse);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long skill summary', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSuccessResponse),
      });
      global.fetch = mockFetch;

      const longSkillSummary = 'A'.repeat(5000);
      const params: GenerateSessionParams = {
        skillSummary: longSkillSummary,
        sessionLength: 30,
      };

      const result = await generateSessionWithLLM(params);
      expect(result).toBeDefined();
    });

    it('should handle response with extra fields', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          activities: mockActivityResponse,
          metadata: { timestamp: '2024-01-01' },
          extra: 'unused field',
        }),
      });
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'Test',
        sessionLength: 30,
      };

      const result = await generateSessionWithLLM(params);
      expect(result).toEqual(mockActivityResponse);
    });

    it('should handle abort during fetch', async () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      const mockFetch = vi.fn().mockRejectedValueOnce(abortError);
      global.fetch = mockFetch;

      const abortController = new AbortController();
      const params: GenerateSessionParams = {
        skillSummary: 'Test',
        sessionLength: 30,
        signal: abortController.signal,
      };

      await expect(generateSessionWithLLM(params)).rejects.toThrow('AbortError');
    });
  });

  describe('HTTP headers', () => {
    it('should always set Content-Type to application/json', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSuccessResponse),
      });
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'Test',
        sessionLength: 30,
      };

      await generateSessionWithLLM(params);

      const [, fetchOptions] = mockFetch.mock.calls[0];
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');
    });

    it('should use POST method', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSuccessResponse),
      });
      global.fetch = mockFetch;

      const params: GenerateSessionParams = {
        skillSummary: 'Test',
        sessionLength: 30,
      };

      await generateSessionWithLLM(params);

      const [, fetchOptions] = mockFetch.mock.calls[0];
      expect(fetchOptions.method).toBe('POST');
    });
  });
});
