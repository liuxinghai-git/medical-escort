import { GoogleGenerativeAI } from "@google/generative-ai";

// 后端使用 process.env 获取环境变量

export const generateHospitalInsight = async (hospitalName: string, env: any) => {
  const apiKey = env.GEMINI_API_KEY; 
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are a professional medical consultant. 
    Provide a professional English introduction for "${hospitalName}" in China.
    The response MUST be a valid JSON object with the following fields:
    {
      "rank": "A short string about its national ranking or grade (e.g., Grade A-3)",
      "founded": "The founding year",
      "sub_title": "A professional subtitle (e.g., Affiliated with X University)",
      "description": "A 2-3 sentence professional summary focusing on its reputation and strengths."
    }
    Return ONLY the JSON. No Markdown formatting.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // 兼容可能出现的 Markdown 标签
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Backend Error:", error);
    return null;
  }
};