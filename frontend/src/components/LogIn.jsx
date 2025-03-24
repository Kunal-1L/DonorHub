import styles from "./SignUp.module.css";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { onMessage, getMessaging } from "firebase/messaging";
import { generateToken } from "../notifications/firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

const LogIn = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(() => {
    return JSON.parse(sessionStorage.getItem("userData")) || null;
  });
  
  const [token, setToken] = useState("");

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
      console.log("Login Error:", error);
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

  // Function to send token to backend
  const sendToken = async (token) => {
    try {
      await axios.post(`${API_BASE_URL}/save-token`, 
        { token },  // Sending as a request body
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      console.log("Token saved successfully!");
    } catch (error) {
      console.error("Error saving token:", error);
    }
  };

  useEffect(() => {
    const fetchTokenAndSend = async () => {
      if (userData && token === "") {
        try {
          const newToken = await generateToken(); 
          setToken(newToken);
          if (newToken) {
            await sendToken(newToken);
          }
        } catch (error) {
          console.error("Error generating or saving token:", error);
        }
      }
    };

    fetchTokenAndSend();

    // Listening for incoming messages
    const messaging = getMessaging();
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("New push notification:", payload);
    });

    return () => {
      unsubscribe();
    };
  }, [userData, token]); 

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
