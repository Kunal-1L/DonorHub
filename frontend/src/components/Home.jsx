import React, { useState, useEffect } from "react";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
const images = ["/transition1.jpeg", "/transition2.jpeg", "/transition3.jpeg"];

const Home = () => {
  const [showImages, setShowImages] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [sloganIndices, setSloganIndices] = useState([]);
  const [userData, setUserData] = useState();
  const navigate = useNavigate();
  useEffect(()=>{
    const u = JSON.parse(sessionStorage.getItem('userData'));
    setUserData(u);
  }, []);

  useEffect(() => {
    const sloganTimeout = setTimeout(() => {
      setShowImages(true);
    }, 2000);

    return () => clearTimeout(sloganTimeout);
  }, []);

  useEffect(() => {
    if (showImages) {
      const interval = setInterval(() => {
        setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [showImages]);

  useEffect(() => {
    // Generate three unique random indices for slogans
    const indices = [];
    while (indices.length < 3) {
      const randomIndex = Math.floor(
        Math.random() * bloodDonationSlogans.length
      );
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    setSloganIndices(indices);
  }, []);

  const bloodDonationSlogans = [
    "Your single blood donation can save up to three lives in need.",
    "The gift of life is within you, share it through blood donation.",
    "In a world of needs, your blood donation is a powerful solution.",
    "Extend a lifeline, donate blood and give the gift of hope today.",
    "Every two seconds, someone needs blood; be the reason they survive.",
    "Your blood donation is a simple act with a profound, lasting impact.",
    "Become a hero in someone's story, donate blood and save a life.",
    "The rarest blood type is the one not donated when needed most.",
    "Let your blood flow with compassion, donate and make a difference now.",
    "Join the community of life savers; your blood donation matters greatly.",
    "Give the gift that keeps on living, donate blood and inspire others.",
    "Your blood connects us all, donate and strengthen the chain of life.",
    "Don't just live, give life; your blood donation is a precious gift.",
    "One act of kindness can change everything, donate blood and be that change.",
    "Your blood has the power to heal, donate and bring hope to many.",
    "Be a beacon of hope in someone's darkest hour, donate blood today.",
    "The true measure of a person is their willingness to give blood.",
    "Your donation is more than blood; it's a second chance at life.",
    "Empower lives with your blood, donate and be a source of strength.",
    "In the face of adversity, your blood donation can be a miracle.",
  ];

  const handleEmergency = () => {
    if (!userData) {
      navigate("/login");
    } else {
      navigate("/emergency-call");
    }
  };

  const handleHostDrives = () => {
    if (!userData) {
      navigate("/login");
    } else {
      navigate("/post-drive");
    }
  };

  const handleExploreDrives = () => {
    if (!userData) {
      navigate("/login");
    } else {
      navigate("/blood-drives");
    }
  };
  return (
    <div className={styles.home_container}>
      {showImages && (
        <div className={styles.imageContainer}>
          <img
            src={images[currentImage]}
            alt="Transition"
            className={styles.transitionImage}
          />
        </div>
      )}
      <div className={styles.slogan}>
        <h1 className={styles.i1}>Donate Blood, </h1>
        <h1 className={styles.i2}>Make a Difference</h1>
      </div>
      <div className={styles.slogans}>
        {sloganIndices.map((index) => (
          <div key={index}>{bloodDonationSlogans[index]}</div>
        ))}
      </div>
      <div className={styles.app_info}>
        <div onClick={() => handleEmergency()}>Emergency Blood Request</div>
        <div onClick={() => handleHostDrives()}>Host Blood Drives</div>
        <div onClick={() => handleExploreDrives()}>Explore Drives</div>
      </div>
    </div>
  );
};

export default Home;
