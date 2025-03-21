import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./BloodDrives.module.css";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Vite environment variable

const BloodDrives = () => {
  const [drives, setDrives] = useState([]);
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const divRef1 = useRef();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDriveDetailsVisible, setIsDriveDetailsVisible] = useState(false);

  if (!userData) {
    navigate("/login");
  }
  useEffect(() => {
    const fetchBloodDrives = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/blood-drives`, {
          headers: {
            Authorization: `Bearer ${userData?.token}`,
          },
        });

        if (response.status >= 200 && response.status < 300) {
          console.log(response.data.drives);
          setDrives(response.data.drives);
        } else {
          setError("Server Error");
        }
      } catch (error) {
        console.error("Error fetching blood drives:", error);
        setError("Failed to fetch blood drives.");
      } finally {
        setLoading(false);
      }
    };

    fetchBloodDrives();
  }, [userData?.token]);

  const handleOutsideClick = (event) => {
    if (divRef1.current && !divRef1.current.contains(event.target)) {
      document.getElementById("drive-details").innerHTML = "";
      setIsDriveDetailsVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handlePostClick = () => {
    if (!userData) {
      navigate("/login");
      return;
    }
    navigate("/post-drive");
  };

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const handleDriveClick = (index) => {
    const drive = drives[index];
    const container = document.getElementById("drive-details");
    if (container) {
      container.innerHTML = `
        <h2>${drive.title}</h2>
        <p><strong>Organizer:</strong> ${drive.organizer}</p>
        <p><strong>Location:</strong> ${drive.location}</p>
        <p><strong>Date:</strong> ${new Date(
          drive.date
        ).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${drive.time.startTime} - ${
        drive.time.endTime
      }</p>
        ${
          drive.poster
            ? `<img src="${drive.poster}" alt="Drive Poster" style="max-width: 300px;"/>`
            : ""
        }
        <p><strong>Description:</strong> ${
          drive.description || "No description provided."
        }</p>
        ${
          drive.contact
            ? `
          <h3>Contact Information</h3>
          <p><strong>Name:</strong> ${drive.contact.name || "N/A"}</p>
          <p><strong>Phone:</strong> ${drive.contact.phone || "N/A"}</p>
          <p><strong>Email:</strong> ${drive.contact.email || "N/A"}</p>
        `
            : ""
        }
      `;
    }
    setIsDriveDetailsVisible(true);
  };

  const handleRegistration = async (event, index) => {
    event.stopPropagation(); // Stop event bubbling
    try {
      const registrationReq = {
        driveId: drives[index]._id.toString(),
        donorId: userData.user_id,
      };
      const response = await axios.post(
        `${API_BASE_URL}/donor-registration`,
        registrationReq,
        {
          headers: {
            Authorization: `Bearer ${userData?.token}`,
          },
        }
      );
      console.log(response.data);
      alert(response.data.message);
      navigate('/why-donate')
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const handleEmergencyClick = ()=>{
    if (!userData) {
      navigate("/login");
      return;
    }
    navigate("/emergency-call");
  }
  return (
    <div className={styles.drive_container} style={{
      backgroundImage:
        "linear-gradient(to bottom,rgb(255, 255, 255) 25%,to #fcb69f 100%)",
    }}>
      <button className={styles.post_btn} onClick={handlePostClick}>
        Post Blood Drive
      </button>
      <button className={styles.post_btn} onClick={handleEmergencyClick}>
        Emergency Blood
      </button>
      {drives.length > 0 ? (
        drives.map((drive, index) => (
          <div
            key={index}
            className={styles.drive}
            onClick={() => handleDriveClick(index)}
          >
            <div className={styles.poster}>
              <img src={drive.poster} alt="Drive Poster" />
            </div>
            <div className={styles.drive_info}>
              <div>
                <strong>Location:</strong> {drive.location}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {new Date(drive.date).toLocaleDateString()} |{" "}
                <strong>Time:</strong> {drive.time.startTime} -{" "}
                {drive.time.endTime}
              </div>
            </div>
            {userData?.role === "User" && drive.user_id != userData.user_id && (
              <button
                className={styles.reg_btn}
                onClick={(event) => handleRegistration(event, index)}
              >
                Register
              </button>
            )}
            <div
              ref={divRef1}
              id="drive-details"
              className={isDriveDetailsVisible ? styles.drive_details : ""}
            ></div>
          </div>
        ))
      ) : (
        <p>No blood drives available.</p>
      )}
    </div>
  );
};

export default BloodDrives;