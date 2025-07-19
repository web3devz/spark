const { GoogleGenerativeAI } = require("@google/generative-ai");


const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

async function generateTextFromGemini(prompt) {
  // Initialize the API client
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
}

// Example usage
// const prompt = "Explain the concept of artificial intelligence in simple terms.";

// generateTextFromGemini(prompt, apiKey)
//   .then((generatedText) => {
//     console.log("Generated Text:", generatedText);
//   })
//   .catch((error) => {
//     console.error("Failed to generate text:", error);
//   });

module.exports={
  generateTextFromGemini
}