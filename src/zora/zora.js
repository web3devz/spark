import { uploadFileToIPFS, uploadJSONToIPFS } from "../storyProtocol/utils/uploadToIpfs";
import { createWalletClient, custom } from 'viem'

import { zoraSepolia } from "viem/chains";
import { createPublicClient } from 'viem'
import { createCreatorClient } from "@zoralabs/protocol-sdk";

export const mintOnZora = async (clipBlob, walletClient, walletAddress, nftData) => {
    // Upload the clip to IPFS
    const ipfsHash = await uploadFileToIPFS(clipBlob);

    // Prepare metadata
    const metadata = {
      name: nftData.title,
      description: nftData.description,
      image: `ipfs://${ipfsHash}`,
      attributes: [
        { trait_type: 'Rarity', value: nftData.rarity }
      ],
    };

    // Upload metadata to IPFS
    const metadataIpfsHash = await uploadJSONToIPFS(metadata);

    const baseConfig = {
      chain: zoraSepolia,
      transport: custom(window.ethereum),
    }
    const publicClient = createPublicClient(baseConfig)

    // Create a Creator Client
    const creatorClient = createCreatorClient({ chainId: zoraSepolia.id, publicClient });

    // Step 1: Create a new 1155 contract
    const { parameters: contractParameters, contractAddress } = await creatorClient.create1155({
      contract: {
        name: nftData.title,
        uri: `ipfs://${metadataIpfsHash}`,
      },
      token: {
        tokenMetadataURI: `ipfs://${metadataIpfsHash}`,
        salesConfig: {
          // Optional: Set a price per token if desired
          // pricePerToken: parseEther("0.1"),
        },
      },
      account: walletAddress,
    });

    // Execute the contract creation transaction
    const contractHash = await walletClient.writeContract(contractParameters);
    console.log('Zora contract created:', contractHash);

    // Wait for the contract creation transaction to be mined
    await publicClient.waitForTransactionReceipt({ hash: contractHash });

    console.log("contractAddress", contractAddress)
    
    
    // Step 2: Mint a token on the newly created contract
    const { parameters: mintParameters } = await creatorClient.create1155OnExistingContract({
      contractAddress,
      token: {
        tokenMetadataURI: `ipfs://${metadataIpfsHash}`,
      },
      account: walletAddress,
    });

    // Execute the minting transaction
    const mintHash = await walletClient.writeContract(mintParameters);
    // Wait for the contract creation transaction to be mined
    await publicClient.waitForTransactionReceipt({ hash: mintHash });
    console.log('Zora NFT minted:', mintHash);

    return { contractHash, mintHash };
  };