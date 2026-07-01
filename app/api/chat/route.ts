import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { investmentNudgeTool } from '@/lib/gemini';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found. Please add it to your .env file.");
      return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Load mock user data to inject into the system prompt
    const dataPath = path.join(process.cwd(), 'data', 'mock_user_data.json');
    let userDataContext = '';
    try {
      const fileContents = fs.readFileSync(dataPath, 'utf8');
      userDataContext = fileContents;
    } catch (e) {
      console.error("Failed to load mock data for context.");
    }

    const systemInstruction = `You are IDBI WealthLens, an autonomous, predictive wealth co-pilot embedded in the IDBI mobile banking app.
Your goal is to shift the banking paradigm from passive holding to active, automated wealth creation.
Analyze the user's financial data to generate context-aware "micro-investment" nudges and personalized portfolio strategies.
Be concise, professional, and persuasive.

Here is the user's current financial context (mock data):
${userDataContext}

If the user asks what to do with their money, or if you identify a surplus, you MUST call the "trigger_investment_nudge" tool to present an actionable UI card to the user. Do not just output plain text for investment suggestions.`;

    // Map frontend messages to Gemini format
    // Frontend sends: { role: 'user' | 'model', parts: [{ text: string }] }
    // Gemini expects similar format.
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [investmentNudgeTool] }],
        temperature: 0.2,
      }
    });

    // Check if the model decided to call a function
    if (response.functionCalls && response.functionCalls.length > 0) {
      const functionCall = response.functionCalls[0];
      if (functionCall.name === 'trigger_investment_nudge') {
        return NextResponse.json({
          role: 'assistant',
          type: 'nudge_card',
          data: functionCall.args
        });
      }
    }

    // Otherwise, return standard text response
    return NextResponse.json({
      role: 'assistant',
      type: 'text',
      content: response.text
    });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to process chat message', details: error.message }, { status: 500 });
  }
}
