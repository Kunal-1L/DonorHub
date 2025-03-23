import styles from "./SignUp.module.css";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

const LogIn = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(() => {
    return JSON.parse(sessionStorage.getItem("userData")) || null;
  });
 

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