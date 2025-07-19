// const pinataSDK = require('@pinata/sdk')
// const fs = require('fs')
const path = require('path')

// const pinata = new pinataSDK({ pinataJWTKey: process.env.NEXT_PUBLIC_PINATA_JWT })

const JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export async function uploadJSONToIPFS(jsonMetadata) {
  if (!JWT) {
    throw new Error('Pinata JWT is not set');
  }

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`
      },
      body: JSON.stringify(jsonMetadata)
    });
    const data = await res.json();
    console.log(data);
    return data.IpfsHash;
  } catch (error) {
    console.error('Error uploading JSON: ', error);
    throw error;
  }
}

// could use this to upload music (audio files) to IPFS
// export async function uploadFileToIPFS(readableStreamForFile) {
//     // Create a readable stream for the file
//     const options = {
//         pinataMetadata: {
//             name: 'Audio File',
//         },
//     }

//     // Upload the file to Pinata
//     const { IpfsHash } = await pinata.pinFileToIPFS(readableStreamForFile, options)

//     return IpfsHash
// }

// export async function uploadFileToIPFS(file) {
//     const options = {
//         pinataMetadata: {
//             name: 'Audio File',
//         },
//     };

//     // Create a FormData object and append the file
//     const formData = new FormData();
//     formData.append('file', file);

//     // Upload the file to Pinata
//     const res = await pinata.pinFileToIPFS(formData, options);
//     return res.IpfsHash;
// }




export async function uploadFileToIPFS(file) {
    if (!JWT) {
      throw new Error('Pinata JWT is not set');
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    const metadata = JSON.stringify({
      name: 'File upload',
    });
    formData.append('pinataMetadata', metadata);
  
    try {
      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${JWT}`
        },
        body: formData
      });
      const data = await res.json();
      console.log(data);
      return data.IpfsHash;
    } catch (error) {
      console.error('Error uploading file: ', error);
      throw error;
    }
  }