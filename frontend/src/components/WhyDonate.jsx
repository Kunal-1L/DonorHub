import React, { useEffect, useRef } from "react";
import styles from "./WhyDonate.module.css";

const WhyDonate = () => {
  const listRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          } else {
            entry.target.classList.remove(styles.visible);
          }
        });
      },
      { threshold: 0.2 }
    );

    listRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className={styles.top_section}>
        <div className={styles.top_left}>
          <img src="/BloodDrop.jpeg" alt="Blood Drop" />
        </div>
        <div className={styles.top_right}>
          <h1>Why Donate Blood?</h1>
          <h2>💉 Donate Blood, Save Lives! ❤️</h2>
        </div>
      </div>
      <div
        className={styles.bottom_section}
        style={{
          backgroundImage:
            "linear-gradient(to left,rgb(255, 255, 255) 25%,to #fcb69f 100%)",
        }}
      >
        <ul>
          {[
            {
              title: "Save Lives with a Simple Act",
              description:
                "Donating blood helps save lives by ensuring hospitals have enough supply for emergencies and surgeries.",
            },
            {
              title: "Blood Cannot Be Manufactured",
              description:
                "There is no substitute for human blood. Every donation counts, as it can only come from people like you.",
            },
            {
              title: "Emergency Readiness",
              description:
                "Blood donations are crucial for accident victims, surgeries, and those with chronic conditions.",
            },
            {
              title: "Improve Your Own Health",
              description:
                "Donating blood can help reduce the risk of heart disease and stimulate the production of new blood cells.",
            },
            {
              title: "It’s Quick, Easy & Safe",
              description:
                "The donation process is quick, and your body will replenish the blood within a short time.",
            },
          ].map((item, index) => (
            <li key={index} ref={(el) => (listRef.current[index] = el)}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default WhyDonate;