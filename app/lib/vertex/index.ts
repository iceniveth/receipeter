import { GoogleGenAI } from "@google/genai";

export default async function doSomethingFromVertexAI(apiKey: string) {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: "Receipeter",
    location: "asia-southeast1",
    apiKey,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-001",
    contents: "Write a 100-word poem.",
  });

  console.dir({ response });
}
