# IDBI WealthLens

An autonomous, predictive wealth co-pilot embedded directly into the IDBI mobile banking app. It shifts the banking paradigm from passive holding to active, automated wealth creation by analyzing daily cash flows, spending patterns, and account balances using AI to generate context-aware "micro-investment" nudges and personalized portfolio strategies.

## Screenshots

<div align="center">
  <img src="./public/assets/media__1782902030631.png" alt="Chat Interface" width="250" />
  <img src="./public/assets/media__1782902030644.png" alt="Investment Nudge Card" width="250" />
  <img src="./public/assets/media__1782903592055.png" alt="Investment Success" width="250" />
</div>

## Features (Phase 1 PoC)

- **Conversational UI**: A chat interface where users can ask financial questions, and the AI correctly identifies the intent.
- **Predictive Cash Flow Nudge**: Analyzes mock transaction data, identifies surplus cash, and proactively sends an actionable UI card to invest the surplus.
- **Mock Sandbox Integration**: Simulates IDBI Sandbox APIs for fetching transactions and executing investments.

## Tech Stack

- **Frontend**: Next.js (App Router), Vanilla CSS (Premium glassmorphism design)
- **Backend**: Next.js API Routes
- **AI/Reasoning Engine**: Google Gemini API (`gemini-2.5-flash`) for intent parsing and structured tool calling.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Add your Gemini API key to a `.env.local` file: `GEMINI_API_KEY=your_key_here`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Author

Created by [Akshay Saini](https://github.com/anonyxhappie).
