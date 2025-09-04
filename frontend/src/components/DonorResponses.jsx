import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading";
import styles from "./DonorResponses.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DonorResponses = () => {
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const [donorResponseData, setDonorResponseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Donor Responses";

    const fetchDonorResponse = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/donor-responses`, {
          headers: {
            Authorization: `Bearer ${userData?.token}`,
          },
        });
        setDonorResponseData(response.data.interestedUsers);
      } catch (error) {
        console.error("Error fetching donor responses:", error);
        toast.error("Error fetching donor responses");
      } finally {
        setLoading(false);
      }
    };

    fetchDonorResponse();
  }, []);

  return (
    <div className={styles.background}>
      <h1>Donor Responses</h1>

      {loading ? (
        <Loading />
      ) : donorResponseData && donorResponseData.length > 0 ? (
        <div className={styles.drivesList}>
          {donorResponseData.map((res) => (
            <div key={res._id} className={styles.driveCard}>
              <h2>{res.name}</h2>
              <p>
                <span className={styles.detailLabel}>Blood Group:</span> {res.bloodGroup}
              </p>
              <p>
                <span className={styles.detailLabel}>Location:</span>{" "}
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(res.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {res.location}
                </a>
              </p>
              <p>
                <span className={styles.detailLabel}>Contact Number:</span> {res.phone}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noDrives} style={{ fontSize: "20px", minHeight: "50vh" }}>
          No donor responses available.
        </div>
      )}
    </div>
  );
};

export default DonorResponses;