import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import { ethers, providers, utils, Contract, BigNumber } from "ethers";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import {
  NFT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  STAKING_CONTRACT_ADDRESS,
  STAKING_CONTRACT_ABI,
} from "../constants";

export default function Home() {
  // Set state for wallet
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // Create a BigNumber `0`
  const zero = BigNumber.from(0);
  // tokensToBeClaimed keeps track of the number of tokens that can be claimed
  // based on the Olym3 Labs NFT's held by the user for which they havent claimed the tokens
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  const [balanceOfOlym3LabsTokens, setBalanceOfOlym3LabsTokens] = useState(zero);

  const [balanceOfOwnerNFTStaking, setBalanceOfOwnerNFTStaking] = useState(zero);
  const [balanceOfStakingRewards, setBalanceOfStakingRewards] = useState(zero);
  // based on the Olym3 Labs NFT's held by the user for which they have staked the tokens
  const [tokensToBeStaked, setTokensToBeStaked] = useState(zero);
  // based on the Olym3 Labs NFT's held by the user for which they will unstaked the tokens
  const [tokenUnstaked, setTokenUnstaked] = useState(zero);


  // tokensToBeStaked keeps track of the number of tokens that can be stacked
  const [balanceOfOlym3LabsStaked, setbalanceOfOlym3LabsStaked] = useState(zero);
  // balanceOfOlym3LabsStaked keeps track of number of Olym3 NFTs stacked by an address
  
  const [balanceOfOwnerOlym3NFT, setbalanceOfOwnerOlym3NFT] = useState(zero);
  // balanceOfOwnerOlym3LabsNFT keeps track of number of Owner Olym3 NFTs owned by an address

  // amount of the tokens that the user wants to mint
  const [tokenAmount, setTokenAmount] = useState(zero);
   // amount of the tokens that the user wants to mint
   const [nftAmount, setNftAmount] = useState(zero);
  // tokensMinted is the total amount of tokens that have been minted till now out of max total supply.(5000)
  const [tokensMinted, setTokensMinted] = useState(zero);

   // nftsMinted is the total amount of tokens that have been minted till now out of max total supply.(5000)
   const [nftsMinted, setNftsMinted] = useState(zero);

  // tokensStaked is the total amount of tokens that have been minted till now out of max total supply.(5000)
  const [tokensStaked, settokensStaked] = useState(zero);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const Web3ModalRef = useRef();

  /**
   * getTokensToBeClaimed: checks the balance of tokens that can be claimed by the user
   */
  const getTokensToBeClaimed = async () => {
    try {
      // Get provider from web3Modal. No Signer (read-only)
      const provider = await getProviderOrSigner();
      // Create an instance of NFT Contract
      const nftContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      // Create instance of tokenContract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      // We need a signer now to extract the address from the connected Metamask account
      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to Metamask
      const address = await signer.getAddress();
      // call the balanceOf from the NFT contract to get the number of NFT's held by the user
      var balance = await nftContract.balanceOf(address);
      // balance is a BigNumber and we need to compare it with the const `zero` we set earlier
      balance = 1;
      if (balance === zero) {
        setTokensToBeClaimed(zero);
      } else {
        // amount keeps track of the number of unclaimed tokens
        var amount = 0;
        // For all the NFT's, check if the tokens have already been claimed
        // Only increase the amount if the tokens have not been claimed
        // for a an NFT(for a given tokenId)
        for (var i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokensIdsClaimed(tokenId);
          if (!claimed) {
            amount++;
          }
        }
        // tokensToBeClaimed has been initialized to a Big Number, thus we would convert amount
        // to a big number and then set its value
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (error) {
      console.error(errror);
      setTokensToBeClaimed(zero);
    }
  };

  
  /**
   * getBalanceOfOwnOlym3LabsNFT: checks the balance of Own Olym3 NFT held by an address
   */
  const getbalanceOfOwnerOlym3NFT = async () => {
    try {
      // get provider from web3Modal (read-only)
      const provider = await getProviderOrSigner();
      // create instance of nft contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      // We will get the signer now to extract the address of the currently connected Metamask
      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to Metamask
      const address = await signer.getAddress();
      // call the balanceOf from the token contract to get the number of tokens held by the user
      const balance = await nftContract.balanceOf(address);
      // balance is already a big number, so we dont need to convert it before setting it
      setbalanceOfOwnerOlym3NFT(balance);
    } catch (error) {
      console.error(error);
      setbalanceOfOwnerOlym3NFT(zero);
    }
  };

    /**
   * getBalanceOfStakingRewards: checks the balance of Own Olym3 NFT stake by an address
   */
    const getBalanceOfStakingRewards = async () => {
      try {
        // get provider from web3Modal (read-only)
        const provider = await getProviderOrSigner();
        // create instance of staking contract
        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_CONTRACT_ABI,
          provider
        );
        // We will get the signer now to extract the address of the currently connected Metamask
        const signer = await getProviderOrSigner(true);
        // Get the address associated to the signer which is connected to Metamask
        const address = await signer.getAddress();
        // call the balanceOf from the staking contract to get the number of nft staking by the user
        const balance = await stakingContract.getStakerRewards(address);
        // balance is already a big number, so we dont need to convert it before setting it
        setBalanceOfStakingRewards(balance);
      } catch (error) {
        console.error(error);
        setBalanceOfStakingRewards(zero);
      }
    };
  

  /**
   * getBalanceOfOwnerNFTStaking: checks the balance of Own Olym3 NFT stake by an address
   */
  const getBalanceOfOwnerNFTStaking = async () => {
    try {
      // get provider from web3Modal (read-only)
      const provider = await getProviderOrSigner();
      // create instance of staking contract
      const stakingContract = new Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_CONTRACT_ABI,
        provider
      );
      // We will get the signer now to extract the address of the currently connected Metamask
      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to Metamask
      const address = await signer.getAddress();
      // call the balanceOf from the staking contract to get the number of nft staking by the user
      const balance = await stakingContract.getStakerTokenCount(address);
      // balance is already a big number, so we dont need to convert it before setting it
      setBalanceOfOwnerNFTStaking(balance);
    } catch (error) {
      console.error(error);
      setBalanceOfOwnerNFTStaking(zero);
    }
  };

  /**
   * getBalanceOfOlym3LabsTokens: checks the balance of Olym3 NFT held by an address
   */
  const getBalanceOfOlym3LabsTokens = async () => {
    try {
      // get provider from web3Modal (read-only)
      const provider = await getProviderOrSigner();
      // create instance of token contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      // We will get the signer now to extract the address of the currently connected Metamask
      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to Metamask
      const address = await signer.getAddress();
      // call the balanceOf from the token contract to get the number of tokens held by the user
      const balance = await tokenContract.balanceOf(address);
      // balance is already a big number, so we dont need to convert it before setting it
      setBalanceOfOlym3LabsTokens(balance);
    } catch (error) {
      console.error(error);
      setBalanceOfOlym3LabsTokens(zero);
    }
  };


/**
   * stakeOlym3LabsToken: mints `amount` number of tokens to a give address
   */
const stakeOlym3LabsToken = async (stakedamount) => {
  try {
    // We need a Signer here (write to blockchain)
    // Create an instance of tokenContract
    const signer = await getProviderOrSigner(true);
    // create an instance of tokenContract
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer
    );
    
    const txn = await tokenContract.stake(stakedamount);
    setLoading(true);
    // wait for transaction to get mined
    await txn.wait();
    setLoading(false);
    window.alert("Successfully staked Olym3 NFT");
    await getBalanceOfOlym3LabsTokens();
    await getbalanceOfOwnerOlym3NFT();
    await getBalanceOfOwnerNFTStaking();
    await getBalanceOfStakingRewards();
    await getTotalTokensMinted();
    await getTotalNFTsMinted();
    await getTokensToBeClaimed();
    await getTokensToBeStaked();

  } catch (error) {
    console.error(error);
  }
};

/**
   * mintOlym3LabsNft: mints `nftAmount` number of tokens to a give address
   */
const mintOlym3LabsNft = async (nftAmount) => {
  try {
    // We need a Signer here (write to blockchain)
    // Create an instance of nftContract
    const signer = await getProviderOrSigner(true);
    // create an instance of nftContract
    const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      signer
    );
    const txn = await nftContract?.mintMultiple(await signer.getAddress(), nftAmount, {
      gasLimit: 300000, 
  });
    setLoading(true);
    // wait for transaction to get staked
    await txn.wait();
    setLoading(false);
    window.alert("Successfully minted Olym3 NFT");
    await getBalanceOfOlym3LabsTokens();
    await getbalanceOfOwnerOlym3NFT();
    await getBalanceOfOwnerNFTStaking();
    await getBalanceOfStakingRewards();
    await getTotalTokensMinted();
    await getTotalNFTsMinted();
    await getTokensToBeClaimed();
    await getTokensToBeStaked();
  } catch (error) {
    console.error(error);
  }
};

/**
   * stakeOlym3LabsNft: stake `stakeTokenID` number of tokens to a give address
   */
const stakeOlym3LabsNft = async (stakeTokenID) => {
  try {
    // We need a Signer here (write to blockchain)
    // Create an instance of nftContract
    const signer = await getProviderOrSigner(true);
    // create an instance of nftContract
    const stakeContract = new Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_CONTRACT_ABI,
      signer
    );
    const txn = await stakeContract?.stake(stakeTokenID, {
      gasLimit: 300000, 
  });
    setLoading(true);
    // wait for transaction to get mined
    await txn.wait();
    setLoading(false);
    window.alert("Successfully Stake Olym3 NFT: ", stakeTokenID);
    await getBalanceOfOlym3LabsTokens();
    await getbalanceOfOwnerOlym3NFT();
    await getBalanceOfOwnerNFTStaking();
    await getBalanceOfStakingRewards();
    await getTotalTokensMinted();
    await getTotalNFTsMinted();
    await getTokensToBeClaimed();
    await getTokensToBeStaked();
  } catch (error) {
    console.error(error);
  }
};

/**
   * unStakeOlym3LabsNft: stake `unStakeTokenID` number of tokens to a give address
   */
const unStakeOlym3LabsNft = async (unStakeTokenID) => {
  try {
    // We need a Signer here (write to blockchain)
    // Create an instance of nftContract
    const signer = await getProviderOrSigner(true);
    // create an instance of nftContract
    const unStakeContract = new Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_CONTRACT_ABI,
      signer
    );
    const txn = await unStakeContract?.unstake(unStakeTokenID, {
      gasLimit: 300000, 
  });
    setLoading(true);
    // wait for transaction to get unstacked
    await txn.wait();
    setLoading(false);
    window.alert("Successfully unStake Olym3 NFT: ", unStakeTokenID);
    await getBalanceOfOlym3LabsTokens();
    await getbalanceOfOwnerOlym3NFT();
    await getBalanceOfOwnerNFTStaking();
    await getBalanceOfStakingRewards();
    await getTotalTokensMinted();
    await getTotalNFTsMinted();
    await getTokensToBeClaimed();
    await getTokensToBeStaked();
  } catch (error) {
    console.error(error);
  }
};


  /**
   * mintOlym3LabsToken: mints `amount` number of tokens to a give address
   */
  const mintOlym3LabsToken = async (amount) => {
    try {
      // We need a Signer here (write to blockchain)
      // Create an instance of tokenContract
      const signer = await getProviderOrSigner(true);
      // create an instance of tokenContract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      // Each token is of `0.0005 ether`. The value we need to send is `0.0005 * amount`
      const value = 0.0005 * amount;
      const txn = await tokenContract.mint(amount, {
        // value signifies the cost of one Olym3 Labs token which is "0.0005" eth.
        // We are parsing `0.0005` string to ether using the utils library from ethers.js
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      // wait for transaction to get mined
      await txn.wait();
      setLoading(false);
      window.alert("Successfully minted Olym3 Token.");
      await getBalanceOfOlym3LabsTokens();
      await getbalanceOfOwnerOlym3NFT();
      await getBalanceOfOwnerNFTStaking();
      await getBalanceOfStakingRewards();
      await getTotalTokensMinted();
      await getTotalNFTsMinted();
      await getTokensToBeClaimed();
      await getTokensToBeStaked();
    } catch (error) {
      console.error(error);
    }
  };


  /**
   * claimOlym3TokenReward: mints `amount` number of tokens to a give address
   */
  const claimOlym3TokenReward = async (amount) => {
    try {
      // We need a Signer here (write to blockchain)
      // Create an instance of tokenContract
      const signer = await getProviderOrSigner(true);
      // create an instance of tokenContract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const stakingContract = new Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_CONTRACT_ABI,
        signer
      );
      // Each token is of `0.0005 ether`. The value we need to send is `0.0005 * amount`
      const value = 0.0005 * amount;
      const txn = await tokenContract.mint(amount, {
        // value signifies the cost of one Olym3 Labs token which is "0.0005" eth.
        // We are parsing `0.0005` string to ether using the utils library from ethers.js
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      // wait for transaction to get mined
      await txn.wait();
      //await stakingContract.zeroStakerRewards(address);
      setLoading(false);
      window.alert("Successfully claimed Olym3 Token.");
      await getBalanceOfOlym3LabsTokens();
      await getbalanceOfOwnerOlym3NFT();
      await getBalanceOfOwnerNFTStaking();
      await getBalanceOfStakingRewards();
      await getTotalTokensMinted();
      await getTotalNFTsMinted();
      await getTokensToBeClaimed();
      await getTokensToBeStaked();
    } catch (error) {
      console.error(error);
    }
  };

   /**
   * claimOlym3TokenRewardV1: mints `amount` number of tokens to a give address
   */
   const claimOlym3TokenRewardV1 = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to Metamask
      const address = await signer.getAddress();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const stakingContract = new Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_CONTRACT_ABI,
        signer
      );

      const balance = await stakingContract.getStakerRewards(address);
      const value = ethers.utils.parseUnits((0.0005 * amount / 10 ** 18).toFixed(18), "ether");
      setLoading(true);
      const txn = await tokenContract.claimRewards(balance, {
        value: value,
        gasLimit: "100000" // Example gas limit
      });
      await txn.wait();
      await stakingContract.zeroStakerRewards(address);
      setBalanceOfStakingRewards(zero);
      setLoading(false);
      window.alert("Successfully claimed Olym3 Token.");
      
  
      // Refresh all balances and totals
      await refreshBalancesAndTotals();
    } catch (error) {
      console.error("Error occurred:", error.message || error);
      setLoading(false);

    }
  };
  
  
  async function refreshBalancesAndTotals() {
    // Assuming these functions are defined to fetch and update UI/state with latest data
    await getBalanceOfOlym3LabsTokens();
    await getbalanceOfOwnerOlym3NFT();
    await getBalanceOfOwnerNFTStaking();
    await getBalanceOfStakingRewards();
    await getTotalTokensMinted();
    await getTotalNFTsMinted();
    await getTokensToBeClaimed();
    await getTokensToBeStaked();
  }
  

  /**
   * unstakeOlym3LabsTokens: Helps the user claim Olym3 Tokens
   */
  const unstakeOlym3LabsTokens = async () => {
    try {
      // Signer needed for writing transaction
      const signer = await getProviderOrSigner();
      // Create an instance of tokenContract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const txn = await tokenContract.claim();
      setLoading(true);
      // wait for txn to get mined
      await txn.wait();
      setLoading(false);
      window.alert("Successfully claimed Olym3 Tokens");
      await getBalanceOfOlym3LabsTokens();
      await getbalanceOfOwnerOlym3NFT();
      await getBalanceOfOwnerNFTStaking();
      await getBalanceOfStakingRewards();
      await getTotalTokensMinted();
      await getTotalNFTsMinted();
      await getTokensToBeClaimed();
      await getTokensToBeStaked();
    } catch (error) {
      console.error(error);
    }
  };


  /**
   * claimOlym3LabsTokens: Helps the user claim Olym3 Tokens
   */
  const claimOlym3LabsTokens = async () => {
    try {
      // Signer needed for writing transaction
      const signer = await getProviderOrSigner();
      // Create an instance of tokenContract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const txn = await tokenContract.claim();
      setLoading(true);
      // wait for txn to get mined
      await txn.wait();
      setLoading(false);
      window.alert("Successfully claimed Olym3 Tokens");
      await getBalanceOfOlym3LabsTokens();
      await getbalanceOfOwnerOlym3NFT();
      await getBalanceOfOwnerNFTStaking();
      await getBalanceOfStakingRewards();
      await getTotalTokensMinted();
      await getTotalNFTsMinted();
      await getTokensToBeClaimed();
      await getTokensToBeStaked();
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * getTotalTokensMinted: Retrieves how many tokens have been minted till now out of the total supply
   */
  const getTotalTokensMinted = async () => {
    try {
      // Get provider from web3Modal. No Signer (read-only)
      const provider = await getProviderOrSigner();
      // Create instance of token contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      // Get all tokens that have been minted
      const _tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);
    } catch (error) {
      console.error(error);
    }
  };

  /*******
   * getTotalNFTsMinted: Retrieves how many tokens have been minted till now out of the total supply
   */
  const getTotalNFTsMinted = async () => {
    try {
      // Get provider from web3Modal. No Signer (read-only)
      const provider = await getProviderOrSigner();
      // Create instance of token contract
      const nftsContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      // Get all tokens that have been minted
      const _nftsMinted = await nftsContract.getLastTokenId();
      setNftsMinted(_nftsMinted);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect Metmask
    const provider = await Web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to Rinkeby, alert user and throw error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 1001) {

      window.alert("Change the network to Klaytn Baobap");
      throw new Error("Change network to Klaytn Baobap");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /**
   * connectWallet: Connects the MetaMask wallet
   */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      Web3ModalRef.current = new Web3Modal({
        network: "klaytn_baobap",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getTotalNFTsMinted();
      getBalanceOfOlym3LabsTokens();
      getBalanceOfOwnerNFTStaking();
      getBalanceOfStakingRewards();
      getbalanceOfOwnerOlym3NFT();
      getTokensToBeClaimed();
    }
  }, [walletConnected]);

  /**
   * mintNFTButton: returns a button based on the state of the dapp
   */
  const mintNFTButton = () => {
    //If we are waiting for something, return a loading button
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    
    // show the mint nft button
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of NFT mint."
            // convert e.target.value to a value
            onChange={(e) => setNftAmount(e.target.value)}
            className={styles.input}
          />
        </div>

        <button
          className={styles.button}
          disabled={!(nftAmount > 0)}
          onClick={() => mintOlym3LabsNft(nftAmount)}
        >
          Mint NFTs
        </button>
      </div>
    );
  };

  /**
   * mintTokenButton: returns a button based on the state of the dapp
   */
   const mintTokenButton = () => {
     //If we are waiting for something, return a loading button
     if (loading) {
       return (
         <div>
           <button className={styles.button}>Loading...</button>
         </div>
       );
     }
     // If tokens to be claimed are greater than 0, Return a claim button
     if (tokensToBeClaimed > 0) {  
       return (
         <div>
           <div className={styles.description}>
             {tokensToBeClaimed * 10} Tokens can be claimed!
           </div>
           <button className={styles.button} onClick={claimOlym3LabsTokens}>
             Claim Tokens
           </button>
         </div>
       );
     }
     // If user doesn't have any tokens to claim, show the mint button
     return (
       <div style={{ display: "flex-col" }}>
         <div>
           <input
             type="number"
             placeholder="Amount of Tokens"
             // convert e.target.value to a BigNumber
             onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
             className={styles.input}
           />
         </div>

         <button
           className={styles.button}
           disabled={!(tokenAmount > 0)}
           onClick={() => mintOlym3LabsToken(tokenAmount)}
         >
           Mint Tokens
         </button>
       </div>
     );
   };

  /**
   * claimButton: returns a button based on the state of the dapp
   */
   const claimButton = () => {
     //If we are waiting for something, return a loading button
     if (loading) {
       return (
         <div>
           <button className={styles.button}>Loading...</button>
         </div>
       );
     }
     // If tokens to be claimed are greater than 0, Return a claim button
     if (balanceOfStakingRewards.gt(0)) {  
       return (
         <div>
           <button className={styles.button} onClick={() => claimOlym3TokenRewardV1(balanceOfStakingRewards)}>
             Claim Reward
           </button>
         </div>
       );
     }
   };



  const stakeButton = () => {
    //If we are waiting for something, return a loading button
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    // If user doesn't have any tokens to stack, show the stack button
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="TokenID"
            onChange={(e) => settokensStaked(e.target.value)}
            className={styles.input}
          />
        </div>

        <button
          className={styles.button}
          disabled={!(tokensStaked >= 0)}
          onClick={() => stakeOlym3LabsNft(tokensStaked)}
        >
          Stake NFT
        </button>
      </div>
    );
  };

  const unStakeButton = () => {
    //If we are waiting for something, return a loading button
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    // If tokens to be stacked are greater than 0, Return a unstack button 
    // If user doesn't have any tokens to stack, show the stack button
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="TokenID"
            onChange={(e) => setTokenUnstaked(e.target.value)}
            className={styles.input}
          />
        </div>

        <button
          className={styles.button}
          disabled={!(tokenUnstaked >= 0)}
          onClick={() => unStakeOlym3LabsNft(tokenUnstaked)}
        >
          unStake NFT
        </button>
      </div>
    );
  };


  return (
    <div>
      <Head>
        <title>Olym3 Labs</title>
        <meta name="description" content="Non-Custodial NFT Staking" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Non-Custodial NFT Staking!</h1>
          <div className={styles.description}>
            You can Mint/ Stake/ Unstake/ Claim Reward OLYM3 Token here:
          </div>
          <div className={styles.description}>
            Your Wallet has: {utils.formatEther(balanceOfOlym3LabsTokens)}{" "}
                Olym3 Tokens.
          </div>
          {walletConnected ? (
            <div>
             
              <div className={styles.description}>
                {/* OLYM3 NFT COLLECTION */}
                You have {utils.formatEther(balanceOfOwnerOlym3NFT)  * 10 ** 18}/{utils.formatEther(nftsMinted) * 10 ** 18} NFTs minted! TokenID:
              </div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                You have staked {utils.formatEther(balanceOfOwnerNFTStaking) * 10 ** 18}{" "}
                Olym3 NFTs. TokenID:
              </div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                You have {utils.formatEther(balanceOfStakingRewards)}{" "}
                Olym3 Token to claim.
              </div>
              <div>
              
                <ul><li>{mintTokenButton()}</li> </ul> 
                <ul><li>{mintNFTButton()}</li> </ul> 
                <ul><li>{stakeButton()}</li></ul>
                <ul><li>{unStakeButton()}</li> </ul>
                <ul><li>{claimButton()}</li> </ul>
                
              </div>
              
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./nft-staking.svg" />
        </div>
      </div>

      <footer className={styles.footer}>Klaytn Hacker House 💰 to Olym3 Labs</footer>
    </div>
  );
}