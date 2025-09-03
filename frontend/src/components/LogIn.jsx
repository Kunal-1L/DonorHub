import styles from "./SignUp.module.css";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { onMessage, getMessaging } from "firebase/messaging";
import { generateToken } from "../notifications/firebase";
import { toast } from "react-toastify";
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

      if (result.status === 200) {
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
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Login failed");
      } else if (error.request) {
        toast.error("Network Error: Could not connect to the server.");
      } else {
        toast.error("Login Error: " + error.message);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      user_id: emailRef.current.value,
      password: passwordRef.current.value,
    };
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
      await axios.post(
        `${API_BASE_URL}/save-token`,
        { token },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        },
      );
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
    const unsubscribe = onMessage(messaging, (payload) => {});

    return () => {
      unsubscribe();
    };
  }, [userData, token]);

  return (
    <div className={styles.background}>
      <title>LogIn</title>
      <div className={styles.signup_container}>
        <h2>Log In</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            type="email"
            ref={emailRef}
            name="email"
            placeholder="Enter your email"
            required
          />
          <input
            type="password"
            ref={passwordRef}
            name="password"
            placeholder="Enter your password"
            required
          />
          <button type="submit">Log In</button>
        </form>
        <div className={styles.shift_container}>
          Don't have an account?{" "}
          <a
            style={{ color: "blue", marginLeft: "2px", cursor: "pointer" }}
            onClick={handleSignUpClick}
          >
            Click Here
          </a>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
