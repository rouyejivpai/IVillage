
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

export const generateAIResponse = async (
  userPrompt: string, 
  context: string
): Promise<{ text: string; action?: string }> => {
  if (!apiKey) {
    return { text: "请配置 API Key 以使用 AI 助手。" };
  }

  try {
    const model = "gemini-2.5-flash";
    
    const systemPrompt = `
      你是一个智慧乡村平台的智能语音助手。你的目标是帮助老年人或不熟悉操作的用户。
      当前用户所在的页面上下文是：${context}。
      
      请根据用户的输入，返回一段简短的回复（不超过50字）。
      同时，如果用户想去某个页面，请在回复的JSON中包含 "action" 字段。
      
      可用的 Action (页面跳转):
      - GOTO_HOME
      - GOTO_NEWS
      - GOTO_GOV
      - GOTO_MARKET
      - GOTO_COMMUNITY
      - GOTO_ADMIN
      
      输出格式必须是纯 JSON，不要 Markdown 格式。
      例如: { "text": "好的，带您去政务大厅。", "action": "GOTO_GOV" }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { role: "user", parts: [{ text: systemPrompt + "\n用户说: " + userPrompt }] }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("No response");
    
    return JSON.parse(responseText);

  } catch (error) {
    console.error("AI Error:", error);
    return { text: "抱歉，我现在无法连接到智能服务。" };
  }
};

export const summarizePage = async (pageContent: string): Promise<string> => {
   if (!apiKey) return "AI服务未配置";
   
   try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `请用非常通俗易懂、适合老年人的语言，用一句话总结以下页面内容：\n${pageContent}`,
      });
      return response.text || "无法总结页面。";
   } catch (e) {
     return "页面读取失败。";
   }
}
