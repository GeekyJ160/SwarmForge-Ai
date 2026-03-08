import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function callGemini(systemPrompt: string, userMessage: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return {
      text: response.text || "No response.",
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
