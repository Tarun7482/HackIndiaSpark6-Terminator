import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import store from './store/store';
import { loadMedical, loadNetwork, loadProvider } from "./store/interactions";
import { medicalLoaded } from './store/reducer';
import { Form, Navbar } from "./components";
import config from "./config.json";
import "./App.css";

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        const provider = loadProvider(dispatch);
        const chainId = await loadNetwork(provider, dispatch);
        const chainConfig = config[chainId];

        if (chainConfig && chainConfig.MedicalRecord) {
          const medicalConfig = chainConfig.MedicalRecord;
          const medical = await loadMedical(provider, medicalConfig.address, dispatch);
          dispatch(medicalLoaded({ medical }));
        } else {
          console.error("No configuration found for chainId:", chainId);
        }
      } catch (error) {
        console.error("Error loading blockchain data:", error);
      }
    };

    loadBlockchainData();
  }, [dispatch]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="dashboard">
        <section className="welcome-panel" aria-labelledby="welcome-title">
          <div className="welcome-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> BLOCKCHAIN-POWERED HEALTHCARE</span>
            <h1 id="welcome-title">Medical records,<br /><span>made more secure.</span></h1>
            <p>Manage patient information through a simple workspace built around transparent, verifiable records.</p>
            <div className="trust-points">
              <span><span className="check-mark">✓</span> Wallet-connected access</span>
              <span><span className="check-mark">✓</span> On-chain record submission</span>
            </div>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="medical-cross">+</div>
            <div className="art-shield"><span>✓</span></div>
            <div className="art-caption"><span className="live-dot" /> RECORD SECURITY</div>
          </div>
        </section>

        <section className="workspace-heading">
          <div>
            <p className="section-kicker">YOUR WORKSPACE</p>
            <h2>Patient records</h2>
            <p className="section-description">Enter the patient details below to submit a record.</p>
          </div>
          <div className="secure-label"><span>⌑</span> Blockchain workflow</div>
        </section>

        <Form />

        <footer className="app-footer">
          <span>Terminator <span className="footer-separator">/</span> E-Report</span>
          <span>Use demo data only. Do not submit real patient information.</span>
        </footer>
      </main>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;