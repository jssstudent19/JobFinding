
import { GoogleGenAI, Type } from "@google/genai";

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we'll throw an error to make it clear.
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function extractSkillsFromResume(resumeText: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract the key technical and soft skills from the following resume text. Focus on programming languages, frameworks, libraries, tools, and methodologies.

Resume:
"""
${resumeText}
"""

Return only a JSON array of strings with the extracted skills.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "A skill extracted from the resume.",
              },
            },
          },
          required: ["skills"],
        },
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (parsed && Array.isArray(parsed.skills)) {
      return parsed.skills;
    }

    throw new Error("Failed to parse skills from API response.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Could not extract skills from resume. Please check your API key and the resume text.");
  }
}
