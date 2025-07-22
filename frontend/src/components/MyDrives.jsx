import { useEffect } from "react";
import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./MyDrives.module.css";
const MyDrives = () => {

    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const [myDrives, setMyDrives] = useState([]);
    const [driveCount, setDriveCount] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchMyDrives = async () => {
            if (!userData) {
                toast.error("You need to be logged in to view your drives.");
                return;
            }
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/my-drives`, {
                    headers: {
                        Authorization: `Bearer ${userData?.token}`,
                    },
                });
                console.log("My Drives Response:", response.data[0].length);
                if (response.data[0].length === 0) {
                    console.log("No drives found for this user");
                    toast.info("No drives found for this user");
                }
                setMyDrives(response.data[0]);
                console.log("My Drives:", response.data[0]);
                setDriveCount(response.data[1]);
                console.log("Drive Count:", response.data[1]);
            } catch (error) {
                toast.error("Error fetching your drives");
            } finally {
                setLoading(false);
            }
        }
        fetchMyDrives();

    }, [userData?.token]);

    return (

        <div className={styles.background}>
            <h1>My Drives</h1>
            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <div className={styles.drivesList}>
                    {myDrives.length > 0 ? (
                        myDrives.map((drive) => (
                            console.log("Drive:", drive._id),
                            <div key={drive._id} className={styles.driveCard}>
                                <h2>{drive.title}</h2>
                                <p><img src={drive.poster} alt="Drive Poster"></img></p>
                                <p>
                                    <span>Location: </span>
                                    <a href={`https://www.google.com/maps?q=${encodeURIComponent(drive.location)}`} target="_blank">
                                        {drive.location}
                                    </a>
                                </p>
                                <p><span>Date: </span>{drive.date.substring(0, 10)}</p>
                                <p><span>Time: </span>{drive.time.startTime}  -  {drive.time.endTime}</p>
                                <p><span>RegisteredCount: {driveCount.map((d) => {
                                    if (d._id == drive._id)
                                        console.log("Drive Count:", d.registeredDonor.length);
                                })}</span></p>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noDrives}>No drives found for this user</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MyDrives;