import { Route, Routes } from "react-router-dom";
import WhyDonate from "./components/WhyDonate";
import Home from "./components/Home";
import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar";
import BloodDrives from "./components/BloodDrives";
import PostDrive from "./components/PostDrive";
import Emergency from "./components/Emergency";
import Footer from "./components/Footer";
function App() {
  
  return (
    <div style={{ padding: "2rem" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/why-donate" element={<WhyDonate />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/blood-drives" element={<BloodDrives />} />
        <Route path="/post-drive" element={<PostDrive />} />
        <Route path="/emergency-call" element={<Emergency />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
