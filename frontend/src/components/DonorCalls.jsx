import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading";
import styles from "./DonorCalls.module.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DonorCalls = () => {
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const [donorCallsData, setDonorCallsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonorCalls = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/donor-calls`, {
          headers: {
            Authorization: `Bearer ${userData?.token}`,
          },
        });
        setDonorCallsData(response.data);
      } catch (error) {
        toast.error("Error fetching donor calls");
      } finally {
        setLoading(false);
      }
    };
    fetchDonorCalls();
  }, [userData?.token]);

  if (loading) {
    return <Loading />;
  }

  if (!donorCallsData) {
    return <p>No donor call information available.</p>;
  }

  const { request } = donorCallsData;

  return (
    <>
      <title>Donor Calls</title>
      <div className={styles.container}>
        <h1>Donor Calls</h1>
        {request && request.length > 0 ? (
          <ul className={styles.requestList}>
            {request.map((req) => (
              <li key={req._id} className={styles.requestItem}>
                <div className={styles.requestDetails}>
                  <p>
                    <span className={styles.detailLabel}>Blood Group:</span>{" "}
                    {req.bloodGroup}
                  </p>
                  <p>
                    <span className={styles.detailLabel}>Location:</span>{" "}
                    {req.location}
                  </p>
                  <p>
                    <span className={styles.detailLabel}>Contact Name:</span>{" "}
                    {req.contact.contactName}
                  </p>
                  <p>
                    <span className={styles.detailLabel}>Contact Phone:</span>{" "}
                    {req.contact.contactPhone}
                  </p>
                  <p>
                    <span className={styles.detailLabel}>Request Date:</span>{" "}
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.not_found}>
            {donorCallsData.message || "No active donor calls found."}
          </div>
        )}
      </div>
    </>
  );
};

export default DonorCalls;
