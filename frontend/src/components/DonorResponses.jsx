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
    const fetchDonorResponse = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/donor-response`, {
          headers: {
            Authorization: `Bearer ${userData?.token}`,
          },
        });
        setDonorResponseData(response.data.interestedUsers);
      } catch (error) {
        toast.error("Error fetching donor responses");
      } finally {
        setLoading(false);
      }
    };
    fetchDonorResponse();
  }, [userData?.token]);

  if (loading) {
    return <Loading />;
  }

  if (!donorResponseData || donorResponseData.length === 0) {
    return <p>No donor response information available.</p>;
  }
  
  return (
    <>
      <title>Donor Responses</title>
      <div className={styles.container}>
        <h1>Donor Responses</h1>
        <ul className={styles.requestList}>
          {donorResponseData.map((res) => (
            <li key={res._id} className={styles.requestItem}>
              <div className={styles.requestDetails}>
                <p>
                  <span className={styles.detailLabel}>Name:</span> {res.name}
                </p>
                <p>
                  <span className={styles.detailLabel}>Blood Group:</span> {res.bloodGroup}
                </p>
                <p>
                  <span className={styles.detailLabel}>Location:</span> {res.location}
                </p>
                <p>
                  <span className={styles.detailLabel}>Contact Number:</span> {res.phone}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
  

export default DonorResponses;
