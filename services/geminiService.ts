import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // In a real app, ensure this is handled securely or via proxy.

export const generateFeedback = async (
  assignmentTitle: string, 
  assignmentDescription: string, 
  studentSubmission: string
): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning mock response.");
    return "API Key missing. Please configure your API key to use AI feedback. (Simulated: Great job on this assignment! Your understanding of the concepts is clear.)";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-3-flash-preview'; 

    const prompt = `
      You are an expert instructor.
      Assignment: ${assignmentTitle}
      Description: ${assignmentDescription}
      Student Submission: ${studentSubmission}
      
      Please provide constructive feedback for this student. 
      Focus on strengths and areas for improvement. 
      Keep it concise (under 100 words).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Could not generate feedback.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with AI service. Please try again manually.";
  }
};
