import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./PostDrive.module.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PostDrive = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem("userData"));

  // Refs for form fields
  const titleRef = useRef();
  const organizerRef = useRef();
  const locationRef = useRef();
  const dateRef = useRef();
  const startTimeRef = useRef();
  const endTimeRef = useRef();
  const posterRef = useRef();
  const descriptionRef = useRef();
  const contactNameRef = useRef();
  const contactPhoneRef = useRef();
  const contactEmailRef = useRef();

  // State for location autocomplete
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Function to submit the drive form
  const submitDrive = async (formData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/post-drive`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData?.token}`,
          },
        },
      );

      if (response.status === 200) {
        toast.success("Blood Drive Posted Successfully");
        navigate("/blood-drives");
      }
    } catch (error) {
      let errorMessage = "Error posting blood drive";
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Network Error: Could not connect to the server.";
      } else {
        errorMessage += ": " + error.message;
      }
      toast.error(errorMessage);
    }
  };
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      title: titleRef.current.value,
      organizer: organizerRef.current.value,
      location: location,
      date: dateRef.current.value,
      time: {
        startTime: startTimeRef.current.value,
        endTime: endTimeRef.current.value,
      },
      poster: posterRef.current.value,
      description: descriptionRef.current.value,
      contact: {
        name: contactNameRef.current.value,
        phone: contactPhoneRef.current.value,
        email: contactEmailRef.current.value,
      },
    };

    submitDrive(formData);
  };

  // Handle selection of an autocomplete suggestion
  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion.display_name);
    if (locationRef.current) {
      locationRef.current.value = suggestion.display_name;
    }
    setSuggestions([]);
  };

  // Fetch location suggestions from the API
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
      <title>Post Drive</title>
      <div className={styles.container}>
        <div className={styles.drive_post_cont}>
          <h1 className={styles.heading}>Create Blood Drive</h1>
          <h3>Donate Today, Save Tomorrow</h3>
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <label>Title:</label>
            <input type="text" ref={titleRef} required />

            <label>Organizer:</label>
            <input type="text" ref={organizerRef} required />

            <div className={styles.autocomplete}>
              <label>Location:</label>
              <input
                type="text"
                ref={locationRef}
                value={location}
                onChange={handleLocationChange}
                required
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

            <label>Date:</label>
            <input type="date" ref={dateRef} required />

            <label>Start Time:</label>
            <input type="time" ref={startTimeRef} required />
            <label>End Time:</label>
            <input type="time" ref={endTimeRef} required />

            <label>Poster (URL):</label>
            <input type="text" ref={posterRef} />

            <label>Description:</label>
            <textarea ref={descriptionRef} />

            <h3>Contact Information</h3>
            <label>Name:</label>
            <input type="text" ref={contactNameRef} />

            <label>Phone:</label>
            <input type="text" ref={contactPhoneRef} />

            <label>Email:</label>
            <input type="email" ref={contactEmailRef} />

            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PostDrive;
