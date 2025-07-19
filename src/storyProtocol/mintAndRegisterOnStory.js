import { AddressZero, IpMetadata, PIL_TYPE, RegisterIpAndAttachPilTermsResponse, StoryClient, StoryConfig } from '@story-protocol/core-sdk'
import { http } from 'viem'
import { mintNFT } from './utils/mintNFT'
import { NFTContractAddress, RPCProviderUrl, account } from './utils/utils'
import { uploadJSONToIPFS, uploadFileToIPFS } from './utils/uploadToIpfs'
import { createHash } from 'crypto'
// import { IpRoyaltyVaultImplReadOnlyClient } from '@story-protocol/core-sdk/dist/declarations/src/abi/generated'
// const fs = require('fs')
const path = require('path')
// const acc = account
export const mintAndRegisterOnStory = async function (videoBlob, walletClient, account, nftData) {
    // 1. Set up your Story Config
    //
    // Docs: https://docs.story.foundation/docs/typescript-sdk-setup
    const config = {
        wallet: walletClient,
        account:account,
        transport: http(RPCProviderUrl),
        chainId: 'iliad',
    }
    const client = StoryClient.newClient(config)

    // 2. Set up your IP Metadata
    //
    // Docs: https://docs.story.foundation/docs/ipa-metadata-standard
    const ipMetadata = client.ipAsset.generateIpMetadata({
        title: nftData.title,
        description: nftData.description,
        attributes: [
            {
                key: 'Rarity',
                value: nftData.rarity,
            },
        ],
    })

    // 3. Set up your NFT Metadata
    //
    // Docs: https://eips.ethereum.org/EIPS/eip-721
    
    // 4. Upload your IP and NFT Metadata to IPFS
    // const readableStreamForFile = fs.createReadStream(path.join(__dirname, "vid.mp4"))
    const ipIpfsHash = await uploadFileToIPFS(videoBlob)
    console.log(ipIpfsHash)
    const nftMetadata = {
        name: nftData.title,
        description: nftData.description,
        video: `https://ipfs.io/ipfs/${ipIpfsHash}`//'https://i.imgur.com/gb59b2S.png',
    }
    // const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
    const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
    const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')

    // 5. Mint an NFT
    const tokenId = await mintNFT(account, `https://ipfs.io/ipfs/${nftIpfsHash}`, walletClient, account)
    console.log(`NFT minted with tokenId ${tokenId}`)

    // 6. Register an IP Asset
    //
    // Docs: https://docs.story.foundation/docs/register-an-nft-as-an-ip-asset
    const response = await client.ipAsset.registerIpAndAttachPilTerms({
        nftContract: NFTContractAddress,
        tokenId: tokenId,
        pilType: nftData.pilLicence, // PIL_TYPE.NON_COMMERCIAL_REMIX,
        mintingFee: 0, // empty - doesn't apply
        currency: AddressZero, // empty - doesn't apply
        ipMetadata: {
            ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
            ipMetadataHash: `0x${ipHash}`,
            nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
            nftMetadataHash: `0x${nftHash}`,
        },
        txOptions: { waitForTransaction: true },
    })
    console.log(`Root IPA created at transaction hash ${response.txHash}, IPA ID: ${response.ipId}`)
    console.log(`View on the explorer: https://explorer.story.foundation/ipa/${response.ipId}`)

    return response.ipId
}


