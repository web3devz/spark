import { privateKeyToAccount } from 'viem/accounts'

// Add your private key to your .env file.
const privateKey = `0x${process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY}`
export const account = privateKeyToAccount(privateKey)

// This is a pre-configured PIL Flavor: https://docs.story.foundation/docs/pil-flavors
export const NonCommercialSocialRemixingTermsId = '1'

// A NFT contract address that will be used to represent your IP Assets
export const NFTContractAddress= (process.env.NFT_CONTRACT_ADDRESS ) || '0xd2a4a4Cb40357773b658BECc66A6c165FD9Fc485'
export const SPGNFTContractAddress  =
    (process.env.SPG_NFT_CONTRACT_ADDRESS ) || '0x9BDca7dbdd7cFB7984993e6EcEbB91DAE360f791'

// Add your rpc provider url to your .env file
// You can select from one of these: https://docs.story.foundation/docs/story-network#-rpcs
export const RPCProviderUrl = process.env.RPC_PROVIDER_URL || 'https://testnet.storyrpc.io'

// The currency used for paying License Tokens or tipping
// This address must be whitelisted by the protocol. You can see the
// currently whitelisted addresses here: https://docs.story.foundation/docs/royalty-module#whitelisted-revenue-tokens
export const CurrencyAddress  = (process.env.CURRENCY_ADDRESS ) || '0x91f6F05B08c16769d3c85867548615d270C42fC7'
