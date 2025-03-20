import { useRef } from "react";
import styles from "./SignUp.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
const SignUp = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const roleRef = useRef(null);
  const navigate = useNavigate();

  const handleCreateAccountClick = async (data) => {
    try {
      const result = await axios.post(`${API_BASE_URL}/signup`, data);
      if (result.status === 201) {
        navigate("/login");
      } else {
        alert(result.data.message || "Signup failed");
      }
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailPattern = /^[a-zA-Z0-9]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailPattern.test(emailRef.current.value)) {
      alert("Invalid email format. Example: user@example.com");
      return;
    }

    if (!passwordPattern.test(passwordRef.current.value)) {
      alert(
        "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
      );
      return;
    }

    const formData = {
      user_id: emailRef.current.value,
      password: passwordRef.current.value,
      role: roleRef.current.value,
    };

    console.log("SignUp Data:", formData);
    handleCreateAccountClick(formData);
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className={styles.container}>
    <div className={styles.signup_container}>
      <h2>Sign Up</h2>
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
        <div>
          <select ref={roleRef} name="role">
            <option value="User">User</option>
            <option value="Hospital">Hospital</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <div className={styles.shift_container}>
        Already have an account?{" "}
        <span
          style={{ color: "blue", marginLeft: "2px", cursor: "pointer" }}
          onClick={handleLoginClick}
        >
          Click Here
        </span>
      </div>
    </div>
    </div>
  );
};

export default SignUp;
