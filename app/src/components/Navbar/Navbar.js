import React, { useEffect } from 'react';
import "./Navbar.css";
import { useDispatch, useSelector } from 'react-redux';
import { loadAccount, loadProvider } from '../../store/interactions';
import Blockies from "react-blockies";

const Navbar = () => {
    const dispatch = useDispatch();
    const provider = useSelector((state) => state.provider.connection);
    const account = useSelector((state) => state.provider.account);
    const balance = useSelector((state) => state.provider.balance);

    // Ensure provider is loaded on mount
    useEffect(() => {
        const initializeProvider = async () => {
            if (!provider) {
                const providerInstance = loadProvider(dispatch);
                if (providerInstance) {
                    await loadAccount(providerInstance, dispatch);
                }
            }
        };
        initializeProvider();
    }, [dispatch, provider]);

    const connectHandler = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const providerInstance = provider || loadProvider(dispatch);
                if (providerInstance) {
                    await loadAccount(providerInstance, dispatch);
                }
            } catch (error) {
                console.error("Error connecting to the wallet:", error);
            }
        } else {
            alert("Please install MetaMask or another Ethereum wallet!");
        }
    };

    const networkHandler = async (e) => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: `0x${parseInt(e.target.value).toString(16)}` }], // Convert to hex
                });
            } catch (error) {
                console.error("Failed to switch network:", error);
            }
        } else {
            alert("Ethereum provider not found. Please install MetaMask.");
        }
    };

    return (
        <div className="Navbar">
            <div className="navname">
                <h2>E-Report</h2>
            </div>
            <div className="navnetworkSelector">
                <select name="network" id="network" onChange={networkHandler}>
                    <option value="0" disabled>Select Network</option>
                    <option value="31337">Localhost</option>
                    <option value="11155111">Sepolia</option>
                </select>
            </div>
            <div className="navbalance">
                {balance && (
                    <p className="navmyBalance">
                        <small>My Balance: </small>
                        {Number(balance).toFixed(2)} ETH
                    </p>
                )}
                {account ? (
                    <button className="navmyAccount" onClick={() => { }}>
                        <Blockies
                            seed={account}
                            size={8}
                            scale={3}
                            color="#2187D0"
                            bgColor="#F1F2F9"
                            spotColor="#767f92"
                            className="identicon"
                        />
                        {account.slice(0, 5) + "..." + account.slice(38, 42)}
                    </button>
                ) : (
                    <button className="navbalance-box" onClick={connectHandler}>
                        Connect Wallet
                    </button>
                )}
            </div>
        </div>
    );
};

export default Navbar;
