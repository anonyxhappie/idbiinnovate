import { Type } from '@google/genai';

export const investmentNudgeTool = {
  name: "trigger_investment_nudge",
  description: "Triggers a UI card for the user to proactively invest their surplus cash into a specific fund. Use this when the user asks what to do with their money or if they have surplus.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      fundName: {
        type: Type.STRING,
        description: "The name of the recommended fund (e.g., IDBI Liquid Fund)"
      },
      recommendedAmount: {
        type: Type.NUMBER,
        description: "The amount recommended to invest based on their surplus"
      },
      fundId: {
        type: Type.STRING,
        description: "The ID of the fund, e.g., FND123"
      },
      reasoning: {
        type: Type.STRING,
        description: "A short, persuasive reason why the user should invest this amount"
      }
    },
    required: ["fundName", "recommendedAmount", "fundId", "reasoning"]
  }
};
