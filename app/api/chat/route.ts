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

If the user asks what to do with their money, or if you identify a surplus, you MUST call the "trigger_investment_nudge" tool to present an actionable UI card to the user. Do not just output plain text for investment suggestions.

IMPORTANT: At the end of every text response, you MUST append a list of 1-3 short, relevant follow-up questions the user could ask next. Format it EXACTLY like this at the very end of your message:
|||SUGGESTIONS: ["question 1", "question 2"]`;

    // Map frontend messages to Gemini format
    // Frontend sends: { role: 'user' | 'model', parts: [{ text: string }] }
    // Gemini expects similar format.
    const contents = messages.map((msg: any) => {
      let textContent = msg.content;
      if (msg.type === 'nudge_card') {
        textContent = `[Presented Investment Nudge Card for ${msg.data?.fundName} (₹${msg.data?.recommendedAmount})]`;
      }
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: textContent || "" }]
      };
    });

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
          data: functionCall.args,
          suggestions: [
            "Why did you recommend this fund?",
            "What are the risks involved?",
            "Can I invest a different amount?"
          ]
        });
      }
    }

    // Otherwise, return standard text response
    let text = response.text || "";
    let suggestions: string[] = [];
    
    if (text.includes("|||SUGGESTIONS:")) {
      const parts = text.split("|||SUGGESTIONS:");
      text = parts[0].trim();
      try {
        suggestions = JSON.parse(parts[1].trim());
      } catch(e) {
        console.error("Failed to parse suggestions", parts[1]);
      }
    }

    return NextResponse.json({
      role: 'assistant',
      type: 'text',
      content: text,
      suggestions: suggestions
    });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    
    const errorMessage = error?.message?.toLowerCase() || '';
    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      return NextResponse.json({ 
        error: 'AI Quota exhausted for today. Please try again later or add your own API key.'
      }, { status: 429 });
    }

    return NextResponse.json({ error: 'Failed to process chat message', details: error.message }, { status: 500 });
  }
}
