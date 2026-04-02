import { GoogleGenerativeAI } from "@google/generative-ai";

// 后端使用 process.env 获取环境变量

export const generateHospitalInsight = async (hospitalName: string, env: any) => {
  const apiKey = env.GEMINI_API_KEY; 
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash-preview" });

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
    const text = await result.response.text();
    
    // 调试用：在 Cloudflare 日志里查看原始输出
    console.log("Raw response from AI:", text);

    // 强力清洗：只保留 JSON 部分
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini API Error details:", error);
    return { 
      description: "Service temporarily unavailable. Please try again.",
      rank: "N/A",
      founded: "N/A"
    }; // 返回一个默认对象防止前端崩溃
  }
};
