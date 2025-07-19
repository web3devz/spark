const { getTranscript } =  require('./livepeerPipeline.js');
const { generateTextFromGemini } =  require('./gemini.js');

async function generateClips(videoBlob) {
  try {
    // Get the transcript from Livepeer
    const transcript = await getTranscript(videoBlob);

    // Prepare the prompt for Gemini
    const prompt = `Analyze the following transcript and identify 1-2 highly valuable and meaningful clips. The transcript is an array of chunks, where each chunk has a timestamp (start and end time in seconds) and the corresponding text. For each clip you identify, provide the start and end timestamps in the format [start_time, end_time]. The timestamps should be in seconds.

Guidelines for selecting clips:
1. Focus on quality over quantity. Aim for 1-2 high-quality clips.
2. Prioritize segments that contain:
   - Key insights or main points of the conversation
   - Interesting anecdotes or examples
   - Surprising or controversial statements
   - Clear explanations of complex topics
3. Ensure each clip is coherent and can stand alone without additional context.
4. Ideal clip length is 30-60 seconds.
5. Avoid overlapping clips unless absolutely necessary for context.

Transcript structure:
[
  {
    timestamp: [start_time, end_time],
    text: "Transcribed text for this chunk"
  },
  ...
]

Transcript:
${JSON.stringify(transcript, null, 2)}

Analyze the content carefully and return only a JSON array of the most valuable clip ranges. strictly respond with json object: 
[[start_time1, end_time1], [start_time2, end_time2], ...]. dont write json in response just the json object`;

    // Generate clip timestamps using Gemini
    const clipTimestampsWithExplanations = await generateTextFromGemini(prompt);
    console.log("Clips with explanations:", clipTimestampsWithExplanations);

    // Parse the response to extract only the timestamp arrays
    const parsedClipTimestamps = JSON.parse(clipTimestampsWithExplanations.replace(/\/\*[\s\S]*?\*\/\s*/g, ''));
    return parsedClipTimestamps;
  } catch (error) {
    console.error("Error generating clips:", error);
    throw error;
  }
}

module.exports={
  generateClips
}

// Example usage
// generateClips()
//   .then((clipTimestamps) => {
//     console.log("Generated clip timestamps:", clipTimestamps);
//   })
//   .catch((error) => {
//     console.error("Failed to generate clips:", error);
//   });


