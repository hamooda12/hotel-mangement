import api from "../HelpersComponnent/api";

/**
 * Ask the hotel AI assistant.
 * The backend expects hotelName, question, and a conversationId.
 */
export const askHotelAI = async ({ hotelName = "", question, conversationId }) => {
  const response = await api.post("/AI/ask/normal", {
    hotelName,
    question,
    conversationId,
  });

  return response.data;
};

/**
 * Load the persisted transcript for the current authenticated user.
 */
export const getHotelAIHistory = async (conversationId) => {
  const response = await api.get("/AI/history", {
    params: { conversationId },
  });

  return response.data;
};
