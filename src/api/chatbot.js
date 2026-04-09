import { askLegalAI } from "./aiApi.js"

export const sendMessageToAI = async (message) => {
  try {
    const response = await askLegalAI(message)
    return response?.answer || "No AI response returned."
  } catch (error) {
    console.error("AI Error:", error)
    return error?.response?.data?.error || "Sorry, AI service is unavailable."
  }
}
