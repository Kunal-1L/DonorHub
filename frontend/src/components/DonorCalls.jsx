import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading";
import styles from "./DonorCalls.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const handleReqRes = async (request_id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/donor-req-res`,
        { request_id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData?.token}`,
          },
        }
      );
      toast.success(response.message);
    } catch (error) {
      toast.error("Error fetching donor calls");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!donorCallsData) {
    return <div className={styles.container} style={{minHeight: "50vh",  fontSize:"20px"}}>No donor call information available.</div>
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
                  <button
                    className={styles.reg_btn}
                    onClick={() => handleReqRes(req._id)}
                  >
                    Respond To Request
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.not_found} style={{fontSize: "20px"}}>
            {donorCallsData.message || "No active donor calls found."}
          </div>
        )}
      </div>
    </>
  );
};

export default DonorCalls;
