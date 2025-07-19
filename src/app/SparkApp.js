"use client";
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, Sparkles, Play, Pause, Coins } from "lucide-react"
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { generateClips } from "@/livepeer/clipGenerator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { mintNFT, walletClient } from '@/storyProtocol/utils/mintNFT';
import { mintAndRegisterOnStory } from '@/storyProtocol/mintAndRegisterOnStory';
import { createWalletClient, custom } from 'viem'
import { iliad } from '@story-protocol/core-sdk'
import {
  protocolRewardsABI,
  zoraCreator1155FactoryImplABI,
  zoraCreator1155FactoryImplAddress,
} from "@zoralabs/protocol-deployments";
import { zoraSepolia } from "viem/chains";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/storyProtocol/utils/uploadToIpfs";
import { createPublicClient } from 'viem'
import { createCreatorClient } from "@zoralabs/protocol-sdk";
import { parseEther } from "viem";
import { mintOnZora } from "@/zora/zora";
import ReactTypingEffect from 'react-typing-effect';
import { PIL_TYPE } from '@story-protocol/core-sdk'

// import { connectWallet, account } from '@/storyProtocol/utils/utils'
const ffmpeg = createFFmpeg({ log: true });

export default function SparkApp() {
  const [generatedClips, setGeneratedClips] = useState([])
  const [audioBlob, setAudioBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // State for loadingconst [walletAddress, setWalletAddress] = useState(null)
  const [walletClient, setWalletClient] = useState(null)
  const [walletAddress, setWalletAddress] = useState(null)

  const initializeWalletClient = async (targetChain = null) => {
    console.log("targetChain", targetChain)
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0]
        console.log("acc", account)

        const client = createWalletClient({
          chain: targetChain == null ? iliad : targetChain,
          transport: custom(window.ethereum),
          account:account
        })

        setWalletClient(client)
        setWalletAddress(account)

        return { account, client }
      } catch (error) {
        console.error('User denied account access')
        throw error
      }
    } else {
      console.log('Please install MetaMask!')
      throw new Error('MetaMask not found')
    }
  }

  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage?.getItem('isWalletConnected') === 'true') {
        try {
          const {account} = await initializeWalletClient()
          setWalletAddress(account)
        } catch (ex) {
          console.log(ex)
        }
      }
    }
    connectWalletOnPageLoad()
  }, [])

  const handleConnectWallet = async () => {
    try {
      console.log("fadfda")
      const {account, client} = await initializeWalletClient()
      console.log("123")
      setWalletAddress(account)
      localStorage.setItem('isWalletConnected', true)
    } catch (error) {
      console.error(error)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true); // Start loading
      await extractAudio(file);
      setIsLoading(false); // End loading
    }
  };

  const extractAudio = async (file) => {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    const videoFile = await fetchFile(file);
    ffmpeg.FS('writeFile', 'input.mp4', videoFile);

    await ffmpeg.run('-i', 'input.mp4', '-q:a', '0', '-map', 'a', 'output.mp3');

    const data = ffmpeg.FS('readFile', 'output.mp3');
    const audioBlob = new Blob([data.buffer], { type: 'audio/mp3' });
    setAudioBlob(audioBlob);

    const res = await generateClips(audioBlob)
    console.log("res ", res)

    const url = URL.createObjectURL(file);
    let clipCount = 0
    const generatedClipsArray = res.map((clip) => {
      clipCount += 1;
      return { id: Date.now(), title: "Clip " + clipCount.toString() , start: clip[0], end: clip[1], duration:  (clip[1] - clip[0]).toFixed(2) + " Sec", url: url }
    })

    setGeneratedClips(generatedClipsArray);

    // You can now use audioBlob for further processing
    console.log("Audio extracted and ready for use.");
  };

  const handleYouTubeLink = (event) => {
    event.preventDefault()
    console.log("YouTube link submitted:", event.target.youtubeLink.value)
    // You can add logic to handle YouTube links if needed
  }

  const handleDownloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${clip.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Sparkles className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold text-primary">Spark</span>
            </div>
            <div>
              {walletAddress ? (
                <span className="text-sm text-gray-700">{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
              ) : (
                <Button onClick={handleConnectWallet}>Connect Wallet</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center h-16">
            <ReactTypingEffect
              text={["Turn Long Videos into Short Clips in seconds"]}
              speed={30}
              eraseDelay={700000}
              typingDelay={0}
            />
          </h1>
          <p className="mt-4 text-base font-semibold text-gray-700 text-center">
            Powered by{' '}
            <span className="text-black-600">Livepeer</span>,{' '}
            <span className="text-black-600">Story Protocol</span>, and{' '}
            <span className="text-black-600">Zora</span>
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">File Upload</TabsTrigger>
                  <TabsTrigger value="youtube" disabled className="cursor-not-allowed">
                    YouTube Link (Coming Soon)
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="file">
                  <div className="grid w-full items-center gap-4">
                    <Label htmlFor="video" className="text-lg font-semibold">Upload Video File</Label>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="video" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-gray-500">MP4, AVI, MOV</p>
                        </div>
                        <Input id="video" type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="youtube">
                  <p className="text-center text-gray-500 py-4">
                    YouTube link functionality is coming soon!
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {isLoading ? (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Generated Clips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4">
                  {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div> */}
                  <p className="text-center text-gray-700 font-bold">Generating clips using Livepeer...</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
                  {[...Array(6)].map((_, index) => (
                    <SkeletonClipCard key={index} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Generated Clips</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedClips.length === 0 ? (
                  <p className="text-center text-gray-500">No clips generated yet. Upload a video to get started!</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {generatedClips.map((clip) => (
                      <ClipCard 
                        key={clip.id} 
                        clip={clip} 
                        walletClient={walletClient} 
                        walletAddress={walletAddress}
                        initializeWalletClient={initializeWalletClient}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

function SkeletonClipCard() {
  return (
    <Card>
      <CardHeader>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </CardHeader>
      <CardContent>
        <div className="h-40 bg-gray-300 rounded mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </CardContent>
      <CardFooter>
        <div className="h-8 bg-gray-300 rounded w-full"></div>
      </CardFooter>
    </Card>
  );
}

function ClipCard({ clip, walletClient, walletAddress, initializeWalletClient }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = async () => {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    const videoFile = await fetchFile(clip.url);
    ffmpeg.FS('writeFile', 'input.mp4', videoFile);

    // Use FFmpeg to trim the video
    await ffmpeg.run(
      '-i', 'input.mp4',
      '-ss', clip.start.toString(),
      '-to', clip.end.toString(),
      '-c', 'copy',
      'output.mp4'
    );

    const data = ffmpeg.FS('readFile', 'output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);

    // Trigger download
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${clip.title}.mp4`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{clip.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <video
            ref={videoRef}
            src={clip.url}
            className="w-full rounded-md"
            onLoadedMetadata={(e) => {
              e.target.currentTime = clip.start;
            }}
            onTimeUpdate={(e) => {
              if (e.target.currentTime >= clip.end) {
                e.target.currentTime = clip.start;
                e.target.pause();
                setIsPlaying(false);
              }
            }}
          >
            <source src={clip.url} type="video/mp4" />
          </video>
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-2 left-2"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-2">Duration: {clip.duration}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleDownload}>
          <Upload className="mr-2 h-4 w-4" /> Download
        </Button>
        
        <MintNFTDialog 
          clip={clip} 
          walletClient={walletClient} 
          walletAddress={walletAddress}
          initializeWalletClient={initializeWalletClient}
        />
      </CardFooter>
    </Card>
  );
}


function MintNFTDialog({ clip, walletClient, walletAddress, initializeWalletClient }) {
  const [nftData, setNftData] = useState({
    title: '',
    description: '',
    license: PIL_TYPE.NON_COMMERCIAL_REMIX,
    rarity: 'Common',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionUrl, setTransactionUrl] = useState('');
  const [currentChain, setCurrentChain] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNftData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!nftData.title.trim()) {
      alert('Please enter a title for your NFT.');
      return false;
    }
    if (!nftData.description.trim()) {
      alert('Please enter a description for your NFT.');
      return false;
    }
    return true;
  };

  const handleNetworkSwitch = async (platform) => {
    const targetChain = platform === 'story' ? iliad : zoraSepolia;
    if (currentChain !== targetChain) {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
          const targetChainIdHex = `0x${targetChain.id.toString(16)}`; // Convert to hex and add '0x' prefix
          
          if (currentChainId !== targetChainIdHex) {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainIdHex }],
              });
            } catch (switchError) {
              // This error code indicates that the chain has not been added to MetaMask.
              if (switchError.code === 4902) {
                try {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainId: targetChainIdHex,
                        chainName: targetChain.name,
                        rpcUrls: [targetChain.rpcUrls.default.http[0]],
                        nativeCurrency: targetChain.nativeCurrency,
                        blockExplorerUrls: [targetChain.blockExplorers.default.url],
                      },
                    ],
                  });
                } catch (addError) {
                  console.error('Failed to add the network:', addError);
                  alert('Failed to add the network. Please try again or add it manually.');
                  return false;
                }
              } else {
                console.error('Failed to switch network:', switchError);
                alert('Failed to switch network. Please try again.');
                return false;
              }
            }
          }
        } else {
          console.log('Please install MetaMask!');
          alert('Please install MetaMask to switch networks.');
          return false;
        }

        // Reinitialize the wallet client with the new chain
        const { client } = await initializeWalletClient(targetChain);
        
        setCurrentChain(targetChain);
        
        // Update the walletClient in the parent component
        // You might need to lift this state up to the parent component
        // and pass a function to update it
        // updateWalletClient(client);

        return true;
      } catch (error) {
        console.error('Failed to switch network:', error);
        alert('Failed to switch network. Please try again.');
        return false;
      }
    }
    return true;
  };

  const handleMint = async (platform) => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    const client = await handleNetworkSwitch(platform);
    if (!client) return;

    setIsLoading(true);
    setTransactionUrl('');

    try {
      const videoBlob = await fetchVideoBlob(clip.url);
      const clipBlob = await extractClip(videoBlob, clip.start, clip.end);

      let txHash;
      if (platform === 'story') {
        const walletClientInst = createWalletClient({
          chain:  iliad ,
          transport: custom(window.ethereum),
          account:walletAddress
        })
        const nftInfoData = {
          title: nftData.title,
          description: nftData.description,
          pilLicence: nftData.license,
          rarity: nftData.rarity,
        }
        const ipaId = await mintAndRegisterOnStory(clipBlob, walletClientInst, walletAddress, nftInfoData);
        setTransactionUrl(`https://explorer.story.foundation/ipa/${ipaId}`);
      } else if (platform === 'zora') {
        const walletClientInst = createWalletClient({
          chain: zoraSepolia,
          transport: custom(window.ethereum),
          account:walletAddress
        })
        const nftInfoData = {
          title: nftData.title,
          description: nftData.description,
          rarity: nftData.rarity,
        }
        txHash = await mintOnZora(clipBlob, walletClientInst, walletAddress, nftInfoData);
        setTransactionUrl(`https://sepolia.explorer.zora.energy/tx/${txHash.mintHash}`);
      }

      alert(`NFT minted successfully on ${platform}!`);
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Failed to mint NFT. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Coins className="mr-2 h-4 w-4" /> Mint NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mint NFT</DialogTitle>
          <DialogDescription>
            Choose a platform and enter the details for your NFT.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="story" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="story">Story Protocol</TabsTrigger>
            <TabsTrigger value="zora">Zora</TabsTrigger>
          </TabsList>
          <TabsContent value="story">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title*
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={nftData.title}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description*
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={nftData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="license" className="text-right">
                  License*
                </Label>
                <select
                  id="license"
                  name="license"
                  value={nftData.license}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                >
                  <option value={PIL_TYPE.NON_COMMERCIAL_REMIX}>Non-Commercial Remix</option>
                  <option value={PIL_TYPE.COMMERCIAL_USE}>Commercial Use</option>
                  <option value={PIL_TYPE.COMMERCIAL_REMIX}>Commercial Remix</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rarity" className="text-right">
                  Rarity*
                </Label>
                <select
                  id="rarity"
                  name="rarity"
                  value={nftData.rarity}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                >
                  <option value="Common">Common</option>
                  <option value="Uncommon">Uncommon</option>
                  <option value="Rare">Rare</option>
                  <option value="Epic">Epic</option>
                  <option value="Legendary">Legendary</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleMint('story')} disabled={isLoading}>
                {isLoading ? 'Minting...' : 'Mint & Register on Story'}
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="zora">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title*
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={nftData.title}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description*
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={nftData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rarity" className="text-right">
                  Rarity*
                </Label>
                <select
                  id="rarity"
                  name="rarity"
                  value={nftData.rarity}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                >
                  <option value="Common">Common</option>
                  <option value="Uncommon">Uncommon</option>
                  <option value="Rare">Rare</option>
                  <option value="Epic">Epic</option>
                  <option value="Legendary">Legendary</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleMint('zora')} disabled={isLoading}>
                {isLoading ? 'Minting...' : 'Mint on Zora'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
        {transactionUrl && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Transaction successful! </p>
            <a
              href={transactionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {" "}View minted NFT
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper function to fetch video as blob
async function fetchVideoBlob(url) {
  const response = await fetch(url);
  return response.blob();
}

// Helper function to extract clip
async function extractClip(videoBlob, start, end) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoBlob);

    video.onloadedmetadata = () => {
      video.currentTime = start;
    };

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(video.src);
        resolve(blob);
      }, 'image/jpeg');
    };

    video.onerror = reject;
  });
}

async function uploadToIPFS(content) {
  // Implement your IPFS upload logic here
  // This is a placeholder and needs to be replaced with actual IPFS upload code
  console.log('Uploading to IPFS:', content);
  return 'placeholder-ipfs-hash';
}

