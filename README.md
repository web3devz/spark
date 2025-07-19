# Spark: AI-Powered Video Clip Generator and NFT Minter
![image](https://github.com/user-attachments/assets/f223b173-02b3-4123-ba39-84f6d349f08d)

## Introduction

Spark is a cutting-edge web application that revolutionizes the way content creators interact with long-form video content. By leveraging the power of AI and blockchain technology, Spark allows users to:

1. Upload long-form videos
2. Automatically generate short, engaging clips using AI-powered content analysis
3. Mint these clips as NFTs on either the Story Protocol or Zora platforms

This innovative approach not only saves time for content creators but also opens up new monetization opportunities by transforming existing content into valuable digital assets. Spark is the perfect tool for creators looking to maximize the impact and value of their video content in the Web3 era.

### Integrations
- **Livepeer**: Used for video transcription and processing
- **Story Protocol**: For minting AI generated video clips as NFTs with customizable licensing terms
- **Zora**: For minting AI generated video clips as NFTs on zora
- **Google's Gemini AI**: Analyzes transcripts to identify the most engaging clip segments


## Video Demo
https://drive.google.com/file/d/1C7DpDXTlO5f6SWSdp7zavoAYJdGkjCQP/view?usp=drive_link

## Dapp deployed link
https://spark-ai-app.vercel.app/

## Technical Architecture

Spark is built on a modern tech stack that combines frontend technologies with AI services and blockchain integration. Here's an overview of the key components:

### Frontend
- **React**: The core framework for building the user interface
- **Next.js**: For server-side rendering and optimized performance
- **Tailwind CSS**: For responsive and customizable styling

### Key Components

1. **SparkApp (src/app/SparkApp.js)**
   - Main application component
   - Handles wallet connection, video upload, and clip generation

2. **MintNFTDialog (src/app/SparkApp.js)**
   - Dialog for minting NFTs
   - Supports both Story Protocol and Zora platforms

3. **Clip Generation (src/livepeer/clipGenerator.js)**
   - Utilizes Livepeer for video transcription
   - Employs Gemini AI to analyze transcripts and identify optimal clip segments

4. **Blockchain Integration**
   - Story Protocol minting (src/storyProtocol/mintAndRegisterOnStory.js)
   - Zora minting (src/zora/zora.js)

5. **IPFS Integration**
   - For storing video clips and metadata

### Workflow

1. User uploads a video file
2. The video is transcribed using Livepeer
3. Gemini AI analyzes the transcript to identify engaging clips
4. User selects a clip to mint as an NFT
5. User chooses between Story Protocol or Zora for minting
6. The clip is uploaded to IPFS
7. NFT is minted on the chosen platform with the IPFS link and metadata

## Getting Started

## Running locally in development mode
    
    npm install
    npm run dev


## Building and deploying in production


    npm install
    npm run build
    npm start



Spark represents the future of content creation and monetization, bridging the gap between traditional video content and the exciting world of Web3 and NFTs.
