import React, { useState, useEffect } from "react";
import styles from "./Home.module.css";

const images = [
  "../public/transition1.jpeg",
  "../public/transition2.jpeg",
  "../public/transition3.jpeg",
];

const Home = () => {
  const [showImages, setShowImages] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const sloganTimeout = setTimeout(() => {
      setShowImages(true);
    }, 2000); // Delay of 2 seconds

    return () => clearTimeout(sloganTimeout);
  }, []);

  useEffect(() => {
    if (showImages) {
      const interval = setInterval(() => {
        setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000); // Transition every 3 seconds

      return () => clearInterval(interval);
    }
  }, [showImages]);
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

  function getRandomNumber() {
    return Math.floor(Math.random() * 20);
  }

  return (
    <div
      style={{
        backgroundImage: "linear-gradient(to bottom,rgb(255, 255, 255) 45%, #fcb69f 100%)",
      }}
    >
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
        <div>{bloodDonationSlogans[getRandomNumber()]}</div>
        <div>{bloodDonationSlogans[getRandomNumber()]}</div>
        <div>{bloodDonationSlogans[getRandomNumber()]}</div>
      </div>
    </div>
  );
};

export default Home;
