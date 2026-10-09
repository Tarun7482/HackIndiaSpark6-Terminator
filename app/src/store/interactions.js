import { BrowserProvider, getAddress, formatUnits, Contract } from "ethers";
import MEDICAL_ABI from "../abis/MedicalRecord.json";
import { providerLoaded, networkLoaded, accountLoaded, etherBalanceLoaded } from './reducer';

// Load Provider
export const loadProvider = (dispatch) => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("No Ethereum wallet provider was found.");
  }
  const connection = new BrowserProvider(window.ethereum);
  dispatch(providerLoaded({ connection }));
  return connection;
};

// Load Network
export const loadNetwork = async (provider, dispatch) => {
  const network = await provider.getNetwork();
  const chainId = network.chainId;
  const chainIdString = typeof chainId === "bigint" ? chainId.toString() : chainId;
  dispatch(networkLoaded({ chainId: chainIdString }));
  return chainIdString;
};

// Load Account
export const loadAccount = async (provider, dispatch) => {
  if (!provider) {
    if (typeof window.ethereum === "undefined") {
      throw new Error("Please install MetaMask or another compatible wallet.");
    }
    provider = new BrowserProvider(window.ethereum);
  }

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  if (!accounts || accounts.length === 0) {
    throw new Error("No wallet account was selected.");
  }

  const account = getAddress(accounts[0]);
  dispatch(accountLoaded({ account }));
  const balance = await provider.getBalance(account);
  const balanceAsString = formatUnits(balance, "ether");
  dispatch(etherBalanceLoaded({ balance: balanceAsString }));
};

// Load Medical
export const loadMedical = (provider, address, dispatch) => {
  const medical = new Contract(address, MEDICAL_ABI, provider);
  return medical;
};

export const submitRecord = async (
  name,
  age,
  gender,
  bloodType,
  allergies,
  diagnosis,
  treatment,
  provider,
  medical,
  dispatch
) => {
  dispatch({ type: "NEW_RECORD_LOADED" });
  try {
    const signer = await provider.getSigner();
    const transaction = await medical
      .connect(signer)
      .addRecord(name, age, gender, bloodType, allergies, diagnosis, treatment);
    await transaction.wait();
    dispatch({ type: "NEW_RECORD_SUCCESS" });
    return transaction.hash;
  } catch (error) {
    dispatch({ type: "NEW_RECORD_FAIL" });
    throw error;
  }
};
