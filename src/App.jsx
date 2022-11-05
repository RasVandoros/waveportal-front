import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import * as ReactBootStrap from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';

const getEthereumObject = () => window.ethereum;


/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
     * First make sure we have access to the Ethereum object.
     */
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const contractABI = abi.abi;
  const contractAddress = "0x80563D18d6A99f5c4D7ea18cF00A26aCF13156c8";
  const [loading, setLoading] = useState(false);
  const [waved, setWaved] = useState(false);
  const [totalTxs, setTotalTxs] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  const [projectList, setProjectList] = useState(false);

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const getTotal = async () => {
     try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setTotalTxs(count.toNumber());
        } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
        setProjectList(!projectList);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(document.getElementById("myText").value);
        console.log("Mining...", waveTxn.hash);

        setLoading(true);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        setLoading(false);
        setWaved(true);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setTotalTxs(count.toNumber());
        
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const printMsg = async () => { return "testing something" };
  /*
   * This runs our function when the page loads.
   * More technically, when the App component "mounts".
   */
  useEffect(async () => {
    const account = await findMetaMaskAccount();
    if (account !== null) {
      setCurrentAccount(account);
    }
    await getTotal();
  }, []);

  return (
    <div className="mainContainer">
      
      <div className="dataContainer">
        <div className="header">
          Yo! 🍻
        </div>
      
        <div className="bio">
          I'm g-van. 

          <form action="/url" method="GET">
            <p>Whats on your mind friend?</p>
            <input type="text" id="myText"></input>
          </form>
          <button className="waveButton" onClick={wave}>
            Speak!
          </button>
        </div>
        
        <button className="waveButton" onClick={getAllWaves}>
            Check logs!
        </button>
        
        {loading && (
          <div className="lds-circle"><div></div></div>
        )}

        {waved && (
          <div className="waved">
            Love you too gee.❤️
          </div>
        )}
        {waved && (
          <div className="waved">
            Number of frens so far: {totalTxs}
          </div>
        )}
        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton2" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

         {projectList && allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}

 
        
      </div>
    </div>

    
  );
};

export default App;