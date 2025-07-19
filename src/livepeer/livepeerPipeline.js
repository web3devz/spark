const { Livepeer } = require("@livepeer/ai");
// const fs = require('fs');
const { fileURLToPath } = require('url');
const path = require('path');

const livepeerAI = new Livepeer({
  httpBearer: process.env.NEXT_PUBLIC_LIVEPEER,
});

async function getTranscript(videoBlob) {
  try {
    
    // const __filename = fileURLToPath(import.meta.url);
    // const __dirname = path.dirname(__filename);
    // Read the audio file
    // const audioFilePath = path.join(__dirname, 'video/audioFile.mp3');
    // const audioFile = fs.readFileSync(audioFilePath);

    const result = await livepeerAI.generate.audioToText({
      audio: {
        fileName: 'audiofile.mp3',
        content: videoBlob//new Uint8Array(audioFile)
      },
      modelId: "openai/whisper-large-v3" // This is the default model
    //   model_id: "openai/whisper-large-v3" // This is the default model
    });
    livepeerAI.generate.te
    console.log("Full transcription:", result.textResponse);
    console.log("Transcription chunks:", result.textResponse.chunks);
    return result.textResponse.chunks
    return 
  } catch (error) {
    console.error("Error in audio to text conversion:", error);
  }
}

module.exports={
  getTranscript
}