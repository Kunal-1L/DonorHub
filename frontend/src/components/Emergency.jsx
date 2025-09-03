import React, { useState, useRef } from "react";
import axios from "axios";
import styles from "./Emergency.module.css"; // Updated import
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Emergency = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  if (userData === null) navigate("/login");

  const bloodGroupRef = useRef();
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
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData?.token}`,
          },
        },
      );

      if (response.status === 200) {
        toast.success("Your request is sent to available users");
        navigate("/");
      }
    } catch (error) {
      let errorMessage = "Failed to send your request.";

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = "Network Error: Could not connect to the server.";
      } else {
        errorMessage += ": " + error.message;
      }
      toast.error(errorMessage);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("bloodGroup", bloodGroupRef.current.value);
    formData.append("location", locationRef.current.value);
    formData.append("contactName", contactNameRef.current.value);
    formData.append("contactPhone", contactPhoneRef.current.value);
    formData.append("contactEmail", contactEmailRef.current.value);
    formData.append("medicalDoc", medicalDocRef.current.value);
    requestBlood(formData);
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion.display_name);
    locationRef.current.value = suggestion.display_name;
    setSuggestions([]);
  };

  const handleLocationChange = async (e) => {
    const inputValue = e.target.value;
    setLocation(inputValue);

    if (inputValue.length > 2) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/location-suggestions?q=${inputValue}`,
        );
        setSuggestions(response.data || []);
      } catch (error) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  return (
    <>
      <title>Emergency Blood</title>
      <div className={styles.container}>
        <div className={styles.drive_post_cont}>
          <h1 className={styles.heading}>Emergency Blood Request</h1>
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <label className={styles.label}>Blood Type:</label>
            <select ref={bloodGroupRef} required className={styles.input}>
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
              type="url"
              ref={medicalDocRef}
              required
              className={styles.input}
            />
            <br />
            <br />

            <h3 className={styles.contactHeading}>Contact Information</h3>
            <label className={styles.label}>Name:</label>
            <input
              type="text"
              ref={contactNameRef}
              required
              className={styles.input}
            />
            <br />
            <br />

            <label className={styles.label}>Phone:</label>
            <input
              type="text"
              ref={contactPhoneRef}
              required
              className={styles.input}
            />

            <label className={styles.label}>Email:</label>
            <input
              type="email"
              ref={contactEmailRef}
              required
              className={styles.input}
            />
            <br />
            <br />

            <button type="submit" className={styles.submitButton}>
              Submit Request
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Emergency;
