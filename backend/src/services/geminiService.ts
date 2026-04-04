import { GoogleGenerativeAI } from "@google/generative-ai";

// 后端使用 process.env 获取环境变量

export const generateHospitalInsight = async (hospitalName: string, env: any) => {
  const apiKey = env.GEMINI_API_KEY; 
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// 在你的 API 路由里执行这个函数
// diagnoseGeminiModels(genAI);

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
  let result;
  for (let i = 0; i < 3; i++) {
    try {
		  result = await model.generateContent(prompt);
		  break; // 成功则跳出循环
		} catch (err: any) {
		  // ✅ 兼容性修复：检测 429 错误
		  // Google SDK 错误通常在 err.message 或 err.status 里
		  const isRateLimit = err.message?.includes("429") || err.status === 429;
		  
		  if (isRateLimit && i < 2) {
			const waitTime = Math.pow(2, i) * 2000;
			console.log(`被限流了，正在等待 ${waitTime}ms 后重试 (第 ${i+1} 次)...`);
			await new Promise(r => setTimeout(r, waitTime));
			continue;
		  }
		  throw err; // 不是 429 或者重试次数用完了，抛出错误
		}
	  }
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
      founded: "N/A",
      sub_title: "N/A"
    }; // 返回一个默认对象防止前端崩溃
  }
};


export async function diagnoseGemini(apiKey: string) {
  // 核心测试：遍历两个可能的路径
  const paths = [
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
  ];

  for (const url of paths) {
    try {
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
      });
      
      console.log(`URL: ${url} | Status: ${response.status}`);
      if (response.ok) {
        return `✅ 找到了正确路径: ${url}`;
      }
    } catch (e) {
      console.log(`❌ 路径失败: ${url}`);
    }
  }
  return "所有路径均测试失败";
}


export async function fetchHospitalDetailsFromGemini(hospitalName: string, apiKey: string) {
  // 1. 尝试获取模型列表，直接使用 v1beta (AI Studio 的默认路径)
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(listUrl);
  const data = await response.json();
  
  console.log("--- API 返回的可用模型列表 ---");
  console.log(JSON.stringify(data.models.map((m: any) => m.name)));
  
  // 2. 根据日志里的名字，选一个看起来像 flash 或 pro 的名字赋值给下面
  // 比如日志里写的是 "models/gemini-3.0-flash-preview"
  // 你就用那个名字
}

// 增加一个简单的重试机制
export async function callGeminiWithRetry(prompt: string, modelName: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (error: any) {
      if (error.status === 429 && i < retries - 1) {
        const waitTime = Math.pow(2, i) * 2000; // 2秒, 4秒, 8秒...
        console.log(`被限流了，正在等待 ${waitTime}ms 后重试...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }
      throw error;
    }
  }
}