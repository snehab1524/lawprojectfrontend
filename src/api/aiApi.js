import API from "./authApi.js";

const AI_LAWYER_API_KEY =
  import.meta.env.VITE_AI_LAWYER_SECRET_KEY || "ai-lawyer-secret-key";

const withAiKey = {
  headers: {
    "x-api-key": AI_LAWYER_API_KEY,
  },
};

export const askLegalAI = async (payload) => {
  const requestBody =
    typeof payload === "string"
      ? { question: payload }
      : payload;

  const response = await API.post("/ai/ask", requestBody, withAiKey);
  return response.data;
};

export const getCaseSummary = async (caseId) => {
  const response = await API.get(`/ai/case/${caseId}/summary`, withAiKey);
  return response.data;
};
