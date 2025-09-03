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
import DonorCalls from "./components/DonorCalls";
import Error from "./components/Error";
import DonorResponses from "./components/DonorResponses";
import MyDrives from "./components/MyDrives";
function App() {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
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
        <Route path="/donor-calls" element={<DonorCalls />} />
        <Route path="/donor-responses" element={<DonorResponses />} />
        <Route path="/my-drives" element={<MyDrives />} />
        <Route path="*" element={<Error />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
