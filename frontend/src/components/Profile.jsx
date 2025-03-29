import React, { useRef, useState, useEffect } from "react";
import styles from "./Profile.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading";
import {
  faUser,
  faTint,
  faMapMarkerAlt,
  faPhone,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const bloodGroupRef = useRef(null);
  const locationRef = useRef(null);
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/get-profile`, {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        });
        setProfile(response.data.profile);
      } catch (error) {
        toast.error("Error fetching profile");
      }
    };

    if (userData?.profile_completed) {
      getProfile();
    }
  }, []);

  const handleLocationChange = async (e) => {
    const inputValue = e.target.value;
    setLocation(inputValue);

    if (inputValue.length > 2) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/location-suggestions?q=${inputValue}`
        );
        setSuggestions(response.data || []);
      } catch (error) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion.display_name);
    locationRef.current.value = suggestion.display_name;
    setSuggestions([]);
  };

  const handleSave = async () => {
    const profileData = {
      name: nameRef.current?.value || "",
      phone: phoneRef.current?.value || "",
      bloodGroup: bloodGroupRef.current?.value || "",
      location: locationRef.current?.value || "",
    };
    const token = JSON.parse(sessionStorage.getItem("userData")).token;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/profile`,
        profileData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Profile saved successfully");
        userData.profile_completed = true;
        sessionStorage.setItem("userData", JSON.stringify(userData));
        navigate("/");
      } else {
        toast.error("Error saving profile.");
      }
    } catch (error) {
      toast.error("Error submitting profile");
    }
  };

  

  return !userData.profile_completed ? (
    <>      <title>Profile Form</title>
    <div className={styles.profileContainer}>
      <h2 className={styles.userTitle}>
        <FontAwesomeIcon icon={faUser} className={styles.icon} />{" "}
        {userData.role} Profile
      </h2>

      <div className={styles.profileItem}>
        <span className={styles.label}>
          <FontAwesomeIcon icon={faUser} className={styles.icon} /> Name:
        </span>
        <input
          type="text"
          placeholder="Full Name"
          ref={nameRef}
          className={styles.inputField}
          required
        />
      </div>

      <div className={styles.profileItem}>
        <span className={styles.label}>
          <FontAwesomeIcon icon={faPhone} className={styles.icon} /> Phone:
        </span>
        <input
          type="text"
          placeholder="Enter your phone number"
          ref={phoneRef}
          className={styles.inputField}
          required
        />
      </div>

      {userData.role === "User" && (
        <div className={styles.profileItem}>
          <span className={styles.label}>
            <FontAwesomeIcon icon={faTint} className={styles.icon} /> Blood
            Group:
          </span>
          <select ref={bloodGroupRef} className={styles.selectField} required>
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      )}

      <div className={styles.profileItem}>
        <span className={styles.label}>
          <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.icon} />{" "}
          Location:
        </span>
        <div className={styles.autocompleteContainer}>
          <input
            type="text"
            placeholder="Enter your location"
            className={styles.inputField}
            value={location}
            ref={locationRef}
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
      </div>

      <button className={styles.saveButton} onClick={handleSave}>
        <FontAwesomeIcon icon={faSave} /> Save Changes
      </button>
    </div></>
  ) : profile ? (
    <>
    <title>Profile</title>
    <div className={styles.childProfile}>
      <div className={styles.profileContainer}>
        <h2 className={styles.heading}>User Profile</h2>
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Email:</strong> {profile.user_id}
        </p>
        <p>
          <strong>Phone:</strong> {profile.phone}
        </p>
        <p>
          <strong>Location:</strong> {profile.location}
        </p>
      </div>
    </div> </>
  ) : (

    <div>
      <Loading />
    </div>
  );
};

export default Profile;
