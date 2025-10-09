import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Set global options
setGlobalOptions({ maxInstances: 10 });

// Configuration - set via Firebase environment config
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'claude';
const claudeApiKey = process.env.ANTHROPIC_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

// Models
const claudeModel = 'claude-3-5-haiku-latest';
const openaiModel = 'gpt-4o-mini';

// Initialize clients
const anthropic = claudeApiKey ? new Anthropic({ apiKey: claudeApiKey }) : null;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const buildPrompt = (params) => {
  return `You are a piano practice coach creating a personalized practice session. Based on the user's skill level and goals, generate a practice session.

User Profile:
${params.skillSummary}

Session Length: ${params.sessionLength} minutes

Please generate a practice session with ${Math.round(params.sessionLength / 15)}-${Math.round(params.sessionLength / 6)} activities. Each activity should have:
- A clear, specific title
- A detailed description (be specific if the user has given context about pieces they're learning, otherwise be more general)
- Duration in minutes (total should equal ${params.sessionLength})
- Type: one of "warmup", "newPiece", "technique", "listening", "repertoire", or "exercise"
- Suggestions: 2-3 specific practice suggestions for that activity

IMPORTANT: When including repertoire review activities, prioritize pieces that haven't been reviewed recently (higher "days ago" values). The repertoire list is already sorted with least recently reviewed pieces first.

Respond ONLY with a valid JSON array in this exact format:
[
  {
    "title": "Warm Up",
    "description": "Gentle finger exercises and stretches",
    "duration": 5,
    "type": "warmup",
    "suggestions": [
      "Hanon exercises #1-5",
      "C major scale, 2 octaves, hands together",
      "Simple chord progressions (I-IV-V-I)"
    ]
  },
  ...more activities
]

Important:
- Make activities specific to the user's current pieces when possible
- Tailor difficulty to their skill level
- Focus on their stated practice focus
- Ensure durations add up to exactly ${params.sessionLength} minutes
- Return ONLY the JSON array, no other text`;
};

const parseActivitiesFromJSON = (jsonText) => {
  // Extract JSON from response
  const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from LLM response');
  }

  const activities = JSON.parse(jsonMatch[0]);

  // Convert to Activity format with IDs
  return activities.map((activity, index) => ({
    id: `activity-${Date.now()}-${index}`,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    duration: activity.duration,
    suggestions: activity.suggestions,
    selectedSuggestion: null
  }));
};

const generateWithClaude = async (params) => {
  if (!anthropic) {
    throw new Error('Claude API not configured');
  }

  const prompt = buildPrompt(params);

  const message = await anthropic.messages.create({
    model: claudeModel,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return parseActivitiesFromJSON(content.text);
};

const generateWithOpenAI = async (params) => {
  if (!openai) {
    throw new Error('OpenAI API not configured');
  }

  const prompt = buildPrompt(params);

  const completion = await openai.chat.completions.create({
    model: openaiModel,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  return parseActivitiesFromJSON(content);
};

// HTTP Cloud Function
export const generateSession = onRequest(
  {
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { skillSummary, sessionLength } = req.body;

      // Validate input
      if (!skillSummary || !sessionLength) {
        res.status(400).json({
          error: 'Missing required parameters: skillSummary and sessionLength'
        });
        return;
      }

      // Generate session based on provider
      let activities;
      if (LLM_PROVIDER === 'claude') {
        activities = await generateWithClaude({ skillSummary, sessionLength });
      } else {
        activities = await generateWithOpenAI({ skillSummary, sessionLength });
      }

      res.status(200).json({ activities });
    } catch (error) {
      console.error('Error generating session:', error);
      res.status(500).json({
        error: 'Failed to generate session',
        message: error.message
      });
    }
  }
);
