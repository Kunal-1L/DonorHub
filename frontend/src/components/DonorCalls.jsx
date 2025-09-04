import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./DonorCalls.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DonorCalls = () => {
  const [donorCallsData, setDonorCallsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(sessionStorage.getItem("userData"));

  useEffect(() => {
    document.title = "Donor Calls";

    const fetchDonorCalls = async () => {
      try {
        setLoading(true);
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
  }, []);

  const handleReqRes = async (request_id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/donor-req-res`,
        { request_id },
        {
          headers: {
            Authorization: `Bearer ${userData?.token}`,
          },
        }
      );
      toast.success(response.data?.message || "Request responded successfully");
    } catch (error) {
      toast.error("Error responding to donor request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.background}>
      <h1>Donor Requests</h1>
      {loading ? (
        <div className={styles.loading}>Loading donor calls...</div>
      ) : (
        <div className={styles.drivesList}>
          {donorCallsData?.request?.length > 0 ? (
            donorCallsData.request.map((req) => (
              <div key={req._id} className={styles.driveCard}>
                <h2>Donor Request</h2>
                <p>
                  <span>Blood Group: </span>
                  {req.bloodGroup}
                </p>
                <p>
                  <span>Location: </span>
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(
                      req.location
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {req.location}
                  </a>
                </p>
                <p>
                  <span>Contact Name: </span>
                  {req.contact?.contactName}
                </p>
                <p>
                  <span>Contact Phone: </span>
                  {req.contact?.contactPhone}
                </p>
                <p>
                  <span>Request Date: </span>
                  {new Date(req.createdAt).toLocaleDateString()}
                </p>
                <button
                  className={styles.reg_btn}
                  onClick={() => handleReqRes(req._id)}
                >
                  Respond To Request
                </button>
              </div>
            ))
          ) : (
            <div className={styles.noDrives}>No donor requests found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DonorCalls;
