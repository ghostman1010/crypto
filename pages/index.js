import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Contract, providers, ethers } from "ethers";
import { useState, useEffect, useRef, use } from "react";
import Web3Modal from "web3modal";
import { NFT_CONTRACT_ADDRESS, abi } from "@/constants";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [nfts, setNfts] = useState(0);
  const web3ModalRef = useRef();

  const getProvideerOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();
    if (chainId != 97) {
      window.alert("Change to BNBchain testnet");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const safeMint = async () => {
    try {
      const signer = await getProvideerOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      await nftContract.safeMint(signer.getAddress(), {
        value: ethers.utils.parseEther("0.001"),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getNFTs = async () => {
    try {
      const signer = await getProvideerOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

      const nftBalance = Number(
        await nftContract.balanceOf(await signer.getAddress())
      );

      setNfts(nftBalance);
    } catch (error) {
      console.error(error);
    }
  };
  const connectWallet = async () => {
    try {
      await getProvideerOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const renderButton = () => {
    if (walletConnected) {
      return (
        <div>
          <h4>You can mint NFT</h4>
          <button className={styles.button} onClick={safeMint}>
            Mint
          </button>
        </div>
      );
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 97,
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getNFTs();
    }
  }, [walletConnected]);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>Basic React dApp</p>
          <div>
            <button onClick={connectWallet} className={styles.button}>
              {!walletConnected ? "Connect Wallet" : "disconect"}
            </button>
          </div>
        </div>
        <div>
          {renderButton()}
          <p>You have {nfts} nfts</p>
        </div>
      </main>
    </>
  );
}
