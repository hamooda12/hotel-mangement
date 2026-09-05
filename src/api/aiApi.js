import api from "../HelpersComponnent/api";

/**
 * Ask the hotel AI assistant.
 * The backend expects hotelName, question, and a conversationId.
 */
export const askHotelAI = async ({ hotelName = "", question, conversationId }) => {
  const response = await api.post("/AI/ask", {
    hotelName,
    question,
    conversationId,
  });

  return response.data;
};
