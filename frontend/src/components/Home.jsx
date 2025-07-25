import React, { useState, useEffect } from "react";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import dashAni from "../../public/Dash(1).json";

const images = ["/transition1.jpeg", "/transition2.jpeg", "/transition3.jpeg"];

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

const Home = () => {
  const [showImages, setShowImages] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [sloganIndices, setSloganIndices] = useState([]);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem("userData"));
    setUserData(u);
  }, []);

  useEffect(() => {
    const sloganTimeout = setTimeout(() => {
      setShowImages(true);
    }, 5);

    return () => clearTimeout(sloganTimeout);
  }, []);


  const getRandomIndices = (prevIndices) => {
    let newIndices = new Set();

    while (newIndices.size < 3) {
      const randomIndex = Math.floor(
        Math.random() * bloodDonationSlogans.length
      );
      if (!prevIndices.includes(randomIndex)) {
        newIndices.add(randomIndex);
      }
    }

    return Array.from(newIndices);
  };

  useEffect(() => {
    setSloganIndices(getRandomIndices([])); // Initial indices

    const interval = setInterval(() => {
      setSloganIndices((prevIndices) => getRandomIndices(prevIndices));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleEmergency = () => {
    navigate(userData ? "/emergency-call" : "/login");
  };

  const handleHostDrives = () => {
    navigate(userData ? "/post-drive" : "/login");
  };

  const handleExploreDrives = () => {
    navigate(userData ? "/blood-drives" : "/login");
  };

  return (
    <div className={styles.home_container}>
      {showImages && (
        <div className={styles.imageContainer}>
          <div className={styles.slogan}>
            <h1 className={styles.i1}>Donate Blood, </h1>
            <h1 className={styles.i2}>Make a Difference</h1>
          </div>
          <Lottie animationData={dashAni} loop={true} className={styles.lottieAnimation}/>

        </div>
      )}

      <div className={styles.app_info}>
        <div onClick={handleEmergency}>Emergency Blood Request<div className={styles.underline}></div></div>
        <div onClick={handleHostDrives}>Host Blood Drives<div className={styles.underline}></div></div>
        <div onClick={handleExploreDrives}>Explore Drives<div className={styles.underline}></div></div>
      </div>
      <div className={styles.slogans}>
        {sloganIndices.map((index) => (
          <div key={index}>{bloodDonationSlogans[index]}</div>
        ))}
      </div>
      <div className={styles.faqsHeader}>
        <div></div> <div className={styles.myDiv}>FAQs</div>
        <div></div>
      </div>

      <div className={styles.faqs}>
        <div>
          <h3> Eligibility to Donate</h3>
          <p>
            Healthy individuals 16-18+ (varies), minimum weight, meeting health
            criteria. Illnesses, meds, travel, tattoos can affect eligibility.
            Check guidelines.
          </p>
        </div>
        <div>
          <h3>The Donation Process</h3>
          <p>
            Registration, health check, blood draw (8-10mins),short rest with
            refreshments. Takes about an hour. Sterile supplies used.
          </p>
        </div>

        <div>
          <h3>Frequency of Donation</h3>
          <p>
            Typically every 56 days (8 weeks) for whole blood. Platelets can be
            more frequent. Follow recommended waiting periods.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
