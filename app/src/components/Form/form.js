import React, { useState } from "react";
import "./form.css";
import { useDispatch, useSelector } from "react-redux";
import { submitRecord } from "../../store/interactions";

const emptyForm = {
  name: "",
  age: "",
  gender: "",
  bloodType: "",
  allergies: "",
  diagnosis: "",
  treatment: ""
};

const Form = () => {
  const provider = useSelector((state) => state.provider.connection);
  const medical = useSelector((state) => state.medical.contract);
  const account = useSelector((state) => state.provider.account);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const dispatch = useDispatch();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (notice) setNotice(null);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    if (!provider || !medical) {
      setNotice({ type: "error", message: "The blockchain connection is not ready. Check your wallet and selected network, then try again." });
      return;
    }

    setIsSubmitting(true);
    setNotice({ type: "success", message: "Please confirm the transaction in your wallet. The record will be saved after the transaction is confirmed." });

    try {
      await submitRecord(
        formData.name.trim(),
        formData.age,
        formData.gender,
        formData.bloodType.trim(),
        formData.allergies.trim(),
        formData.diagnosis.trim(),
        formData.treatment.trim(),
        provider,
        medical,
        dispatch
      );
      setFormData(emptyForm);
      setNotice({ type: "success", message: "Transaction confirmed. The patient record was submitted successfully." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error?.code === "ACTION_REJECTED"
          ? "The wallet transaction was cancelled. No record was submitted."
          : "The record could not be submitted. Check your wallet, network and transaction details, then try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {account ? (
        <form onSubmit={submitHandler} className="patient-form">
          <h1>New patient record</h1>
          <p className="form-intro">Complete the details carefully. Required fields are marked by the browser before submission.</p>

          <p className="form-section-label">Patient information</p>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Patient name</label>
              <input type="text" id="name" name="name" autoComplete="off" required maxLength={100}
                onChange={handleChange} value={formData.name} placeholder="Enter patient name" />
            </div>
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input type="number" id="age" name="age" required min="0" max="130" step="1"
                onChange={handleChange} value={formData.age} placeholder="Age in years" />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select name="gender" id="gender" required onChange={handleChange} value={formData.gender}>
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="bloodType">Blood type</label>
              <select id="bloodType" name="bloodType" required onChange={handleChange} value={formData.bloodType}>
                <option value="" disabled>Select blood type</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          <hr className="form-divider" />
          <p className="form-section-label">Medical information</p>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label htmlFor="allergies">Known allergies</label>
              <input type="text" id="allergies" name="allergies" required maxLength={500}
                onChange={handleChange} value={formData.allergies} placeholder="List allergies, or enter None if unknown/none reported" />
            </div>
            <div className="form-group form-group-full">
              <label htmlFor="diagnosis">Diagnosis / notes</label>
              <input type="text" id="diagnosis" name="diagnosis" required maxLength={1000}
                onChange={handleChange} value={formData.diagnosis} placeholder="Enter diagnosis or clinical notes" />
            </div>
            <div className="form-group form-group-full">
              <label htmlFor="treatment">Treatment / care plan</label>
              <input type="text" id="treatment" name="treatment" required maxLength={1000}
                onChange={handleChange} value={formData.treatment} placeholder="Enter treatment or care plan" />
            </div>
          </div>

          {notice && (
            <div className={`form-notice ${notice.type === "error" ? "error" : ""}`} role={notice.type === "error" ? "alert" : "status"}>
              {notice.message}
            </div>
          )}

          <div className="form-actions">
            <p className="form-helper">Submitting may require a wallet confirmation and a network transaction fee. Use fictional data for demos.</p>
            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? "Waiting for confirmation…" : "Submit patient record"}
            </button>
          </div>
        </form>
      ) : (
        <section className="connect-message" aria-labelledby="connect-title">
          <h1 id="connect-title">Connect your wallet to continue</h1>
          <p>Your wallet identifies the account submitting this demo record. Connect MetaMask or a compatible wallet, then select the network configured for this deployment.</p>
          <span className="connect-hint">Wallet connection required · Never share your recovery phrase</span>
        </section>
      )}
    </div>
  );
};

export default Form;
