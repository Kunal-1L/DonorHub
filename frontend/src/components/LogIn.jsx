import styles from "./SignUp.module.css";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, onMessage, messaging} from "../firebase"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

const LogIn = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(() => {
    return JSON.parse(sessionStorage.getItem("userData")) || null;
  });

  const sendTokenToServer = async (token, userToken) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/save-token`,
        { token },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      console.log("Token saved:", response);
    } catch (error) {
      console.error("Error sending token to server:", error);
    }
  };

  useEffect(() => {
    if (!userData) return; 

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);

          const requestNotificationPermission = async () => {
            try {
              const permission = await Notification.requestPermission();
              if (permission === "granted") {
                console.log("Notification permission granted.");
                const currentToken = await getToken(messaging, {
                  vapidKey:
                    "BD29UF2RuYPquxtBekro8jads-q2ELLF3lRUxDF4OzoeAfRCZ927sGr-R25Z15FIPq_vYGlP_S6MRrPJGOTNi5M",
                });

                if (currentToken) {
                  console.log("FCM registration token:", currentToken);
                  sendTokenToServer(currentToken, userData.token);
                } else {
                  console.log("No registration token available.");
                }
              } else {
                console.log("Unable to get permission to notify.");
              }
            } catch (error) {
              console.error("Error retrieving token: ", error);
            }
          };

          requestNotificationPermission();

          onMessage(messaging, (payload) => {
            console.log("Message received:", payload);
            new Notification(payload.notification.title, {
              body: payload.notification.body,
            });
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, [userData]); 

  const handleLoginClick = async (data) => {
    try {
      const result = await axios.post(`${API_BASE_URL}/login`, data);
      const newUserData = {
        user_id: result.data.user_id,
        role: result.data.user_role,
        token: result.data.token,
        profile_completed: result.data.profile_completed,
      };
      sessionStorage.setItem("userData", JSON.stringify(newUserData));
      setUserData(newUserData); 

      if (result.data.profile_completed === false) {
        navigate("/profile");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      user_id: emailRef.current.value,
      password: passwordRef.current.value,
    };
    console.log("Login Data:", formData);
    handleLoginClick(formData);

    emailRef.current.value = "";
    passwordRef.current.value = "";
  };

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  return (
    <div className={styles.container}>
    <div className={styles.signup_container}>
      <h2>Log In</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <input type="email" ref={emailRef} name="email" placeholder="Enter your email" required />
        <input type="password" ref={passwordRef} name="password" placeholder="Enter your password" required />
        <button type="submit">Log In</button>
      </form>
      <div className={styles.shift_container}>
        Don't have an account?{" "}
        <a style={{ color: "blue", marginLeft: "2px", cursor: "pointer" }} onClick={handleSignUpClick}>
          Click Here
        </a>
      </div>
    </div>
    </div>
  );
};

export default LogIn;
