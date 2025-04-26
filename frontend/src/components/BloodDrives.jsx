import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./BloodDrives.module.css";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BloodDrives = () => {
  const [drives, setDrives] = useState([]);
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const divRef1 = useRef();
  const [loading, setLoading] = useState(true);
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

        if (response.status === 200) {
          setDrives(response.data.drives);
        }
      } catch (error) {
        let errorMessage = "Failed to fetch blood drives.";
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
      } finally {
        setLoading(false);
      }
    };
    fetchBloodDrives();
  }, [userData?.token]);

  const handleOutsideClick = (event) => {
    if (divRef1.current && !divRef1.current.contains(event.target)) {
      document.getElementById("drive-details").innerHTML = "";
      document.getElementById("drive-details").className = "";
      document.getElementById("drive-details").style = "";
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
    return <Loading />;
  }

  const handleDriveClick = (index, event) => {
    const drive = drives[index];
    const detailsContainer = document.getElementById("drive-details");
    const clickY = event.clientY;

    if (detailsContainer) {
      detailsContainer.innerHTML = `
        <h2>${drive.title}
       <span id="close_button">\u00D7</span>
        </h2>
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
      detailsContainer.className = styles.drive_details;
      detailsContainer.style.top = `${clickY + 10}px`;
      const closeButton = document.getElementById("close_button");

      if (closeButton) {
        closeButton.onclick = () => handleOutsideClick(event);
      }

      setIsDriveDetailsVisible(true);
    }
  };
  const handleRegistration = async (event, index) => {
    event.stopPropagation();
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
      toast.success(response.data.message);
      navigate("/why-donate");
    } catch (error) {
      let errorMessage = "Registration error";

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

  const handleEmergencyClick = () => {
    if (!userData) {
      navigate("/login");
      return;
    }
    navigate("/emergency-call");
  };
  return (
    <>
      <title>Blood Drives</title>
      <div
        className={styles.drive_container}
        style={{
          backgroundImage:
            "linear-gradient(to bottom,rgb(255, 255, 255) 25%,to #fcb69f 100%)",
        }}
      >
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
              onClick={() => handleDriveClick(index, event)}
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
              {userData?.role === "User" &&
                drive.user_id != userData.user_id && (
                  <button
                    className={styles.reg_btn}
                    onClick={(event) => handleRegistration(event, index)}
                  >
                    Register
                  </button>
                )}
            </div>
          ))
        ) : (
          <div className={styles.not_found} style={{fontSize: "20px"}}>No blood drives available.</div>
        )}
        {
          <div ref={divRef1} id="drive-details">
            {/* Content will be populated here by handleDriveClick */}
          </div>
        }
      </div>
    </>
  );
};

export default BloodDrives;
