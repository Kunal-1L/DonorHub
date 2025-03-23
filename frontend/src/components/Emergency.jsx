import React, { useState, useRef } from "react";
import axios from "axios";
import styles from "./Emergency.module.css"; // Updated import
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Vite environment variable

const Emergency = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  if(!userData){
      navigate('/login');
      return;
  }
  const bloodTypeRef = useRef();
  const contactNameRef = useRef();
  const contactPhoneRef = useRef();
  const contactEmailRef = useRef();
  const medicalDocRef = useRef();
  const locationRef = useRef();
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const requestBlood = async (formData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/emergency-push`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );

      if (response.status > 200 && response.status < 300) {
        alert("Your request is sent to available users...");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      alert("Your request failed...");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("bloodType", bloodTypeRef.current.value);
    formData.append("location", locationRef.current.value);
    formData.append("contactName", contactNameRef.current.value);
    formData.append("contactPhone", contactPhoneRef.current.value);
    formData.append("contactEmail", contactEmailRef.current.value);
    formData.append("medicalDoc", medicalDocRef.current.files[0]);
    requestBlood(formData);
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion.display_name);
    locationRef.current.value = suggestion.display_name;
    setSuggestions([]);
  };

  const handleLocationChange = async(e) => {
    const inputValue = e.target.value;
    setLocation(inputValue);

     if (inputValue.length > 2) {
              try {
                const response = await axios.get(
                  `${API_BASE_URL}/location-suggestions?q=${inputValue}`
                );
                setSuggestions(response.data || []);
              } catch (error) {
                console.error("Error fetching autocomplete suggestions:", error);
                setSuggestions([]); 
              }
            } else {
              setSuggestions([]);
            }
  };

  return (
    <div className={styles.container}>
    <div className={styles.drive_post_cont}>
      <h1 className={styles.heading}>Emergency Blood Request</h1>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <label className={styles.label}>Blood Type:</label>
        <select ref={bloodTypeRef} required className={styles.input}>
          <option value="">Select Blood Type</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
        <br />
        <br />
        <div className={styles.autocomplete}>
          <label className={styles.label}>Location:</label>
          <input
            type="text"
            ref={locationRef}
            onChange={handleLocationChange}
            required
            className={styles.input}
          />
          {suggestions.length > 0 && (
            <ul className={styles.suggestionsList}>
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  className={styles.suggestionItem}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <br />
        <br />
        <label className={styles.label}>Medical Document:</label>
        <input
          type="file"
          ref={medicalDocRef}
          accept=".pdf,.jpg,.jpeg,.png"
          required
          className={styles.input}
        />
        <br />
        <br />

        <h3 className={styles.contactHeading}>Contact Information</h3>
        <label className={styles.label}>Name:</label>
        <input type="text" ref={contactNameRef} required className={styles.input} />
        <br />
        <br />

        <label className={styles.label}>Phone:</label>
        <input type="text" ref={contactPhoneRef} required className={styles.input} />

        <label className={styles.label}>Email:</label>
        <input type="email" ref={contactEmailRef} required className={styles.input} />
        <br />
        <br />

        <button type="submit" className={styles.submitButton}>
          Submit Request
        </button>
      </form>
    </div></div>
  );
};

export default Emergency;