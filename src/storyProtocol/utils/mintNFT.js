import { http, createPublicClient } from 'viem'
import { NFTContractAddress, RPCProviderUrl } from './utils'
import { iliad } from '@story-protocol/core-sdk'
import { defaultNftContractAbi } from './defaultNftContractAbi'

const baseConfig = {
    chain: iliad,
    transport: http(RPCProviderUrl),
}
export const publicClient = createPublicClient(baseConfig)

export async function mintNFT(to, uri, walletClient, account){
    console.log('Minting a new NFT...')

    const { request } = await publicClient.simulateContract({
        address: NFTContractAddress,
        functionName: 'mintNFT',
        args: [to, uri],
        abi: defaultNftContractAbi,
        account,
    })
    const hash = await walletClient.writeContract(request)
    const { logs } = await publicClient.waitForTransactionReceipt({
        hash,
    })
    if (logs[0].topics[3]) {
        return parseInt(logs[0].topics[3], 16)
    }
}
