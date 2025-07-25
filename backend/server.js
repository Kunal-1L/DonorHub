require("dotenv").config(); // ✅ Load environment variables first
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios");
const admin = require("firebase-admin");

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Import models
const {
  Users,
  UserProfile,
  HospitalProfile,
  BloodDrive,
  DonorRegistration,
  NotificationTokens,
  EmergencyBloodRequest,
  DonorRequest,
  DonorCall,
  DriveRegistration,
} = require("./model.js");

// Load environment variables
const DB_URI = process.env.DB_URI;
const SECRET_KEY = process.env.SECRET_KEY;
const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;

// Connect to MongoDB
mongoose
  .connect(DB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit if MongoDB connection fails
  });

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://donor-hub-eight.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:8000",
    ];

    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// JWT Middleware
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access Denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    const verified = jwt.verify(token, SECRET_KEY);
    req.user_id = verified.user_id;
    req.user_role = verified.user_role;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    res.status(400).json({ message: "Invalid or expired token." });
  }
};

app.get("/location-suggestions", async (req, res) => {
  const { q } = req.query;
  if (!LOCATIONIQ_API_KEY) {
    return res.status(500).json({ error: "LocationIQ API key not configured" });
  }

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      error:
        "Query parameter 'q' is required and must be at least 2 characters long",
    });
  }

  try {
    const response = await axios.get(
      `https://api.locationiq.com/v1/autocomplete.php`,
      {
        params: {
          key: LOCATIONIQ_API_KEY,
          q,
          limit: 5,
          format: "json",
        },
      }
    );

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ error: "No location suggestions found" });
    }

    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching LocationIQ suggestions:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error fetching location suggestions" });
  }
});

// Signup Route
app.post("/signup", async (req, res) => {
  const { user_id, password, role } = req.body;
  try {
    if (await Users.findOne({ user_id })) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hash_pwd = await bcrypt.hash(password, 10);
    const user = new Users({ user_id, password: hash_pwd, role });
    await user.save();
    res.status(200).json({ message: `${role} registered successfully` });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { user_id, password } = req.body;
  try {
    const user = await Users.findOne({ user_id });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ user_id, user_role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user_id,
      user_role: user.role,
      profile_completed: user.profile_completed,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Profile Creation Route (User & Hospital)
app.post("/profile", verifyToken, async (req, res) => {
  try {
    const { name, phone, bloodGroup, location } = req.body;
    const role = req.user_role;
    // Fetch Coordinates
    const response = await axios.get(
      `https://us1.locationiq.com/v1/search.php`,
      {
        params: { key: LOCATIONIQ_API_KEY, q: location, format: "json" },
      }
    );

    if (response.data.length === 0) {
      return res.status(404).json({ message: "Location not found." });
    }

    const { lat, lon } = response.data[0];
    if (role === "User") {
      const profile = new UserProfile({
        user_id: req.user_id,
        name,
        phone,
        bloodGroup,
        location,
        latitude: lat,
        longitude: lon,
      });
      await Users.updateOne(
        { user_id: req.user_id },
        { $set: { profile_completed: true } }
      );
      await profile.save();
      res.status(200).json({ message: "User Profile Created", profile });
    } else {
      const profile = new HospitalProfile({
        user_id: req.user_id,
        name,
        phone,
        location,
        latitude: lat,
        longitude: lon,
      });
      await profile.save();
      await Users.updateOne(
        { user_id: req.user_id },
        { $set: { profile_completed: true } }
      );
      res.status(200).json({ message: "Hospital Profile Created", profile });
    }
  } catch (error) {
    console.error("Profile Creation Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/get-profile", verifyToken, async (req, res) => {
  try {
    const user_id = req.user_id;
    var pro = await UserProfile.findOne({ user_id });
    if (!pro) {
      pro = await HospitalProfile.findOne({ user_id });
    }
    res
      .status(200)
      .json({ message: "Profile Fetched Successfully", profile: pro });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Haversine formula to calculate distance (in KM)
const getDistanceFromLatLon = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in KM
  const degToRad = (deg) => deg * (Math.PI / 180);

  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) *
    Math.cos(degToRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in KM
};

// Route to get blood drives within 10KM radius
app.get("/blood-drives", verifyToken, async (req, res) => {
  try {
    const user_id = req.user_id;
    const user_role = req.user_role;
    let userLat, userLon;

    if (user_role === "User") {
      const user = await UserProfile.findOne({ user_id });
      if (!user) return res.status(404).json({ message: "User not found" });
      userLat = user.latitude;
      userLon = user.longitude;
    } else {
      const user = await HospitalProfile.findOne({ user_id });
      if (!user) return res.status(404).json({ message: "Hospital not found" });
      userLat = user.latitude;
      userLon = user.longitude;
    }
    const today = new Date();
    // Fetch upcoming blood drives
    const bloodDrives = await BloodDrive.find({ date: { $gte: today }, user_id: { $ne: user_id } });
    // Filter drives within 10KM radius
    const drivesWithinRadius = bloodDrives.filter((drive) => {
      const driveLat = drive.latitude;
      const driveLon = drive.longitude;
      return getDistanceFromLatLon(userLat, userLon, driveLat, driveLon) <= 10;
    });
    res.json({ drives: drivesWithinRadius });
  } catch (error) {
    console.error("Error fetching blood drives:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/post-drive", verifyToken, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { location } = req.body;
    const response = await axios.get(
      "https://us1.locationiq.com/v1/search.php",
      {
        params: { key: LOCATIONIQ_API_KEY, q: location, format: "json" },
      }
    );

    if (response.data.length === 0) {
      return res.status(404).json({ message: "Location not found." });
    }

    const { lat, lon } = response.data[0];
    const user = new BloodDrive({
      ...req.body,
      user_id: user_id,
      latitude: lat,
      longitude: lon,
    });
    await user.save();
    res.status(200).json({ message: "Blood Drive posted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to Post", error: error.message });
  }
});

app.post("/donor-registration", verifyToken, async (req, res) => {
  const { driveId, donorId } = req.body;
  try {
    let camp = await DonorRegistration.findOne({ driveId });

    if (!camp) {
      camp = await DonorRegistration.create({
        driveId,
        registeredDonor: [donorId],
      });
    } else {
      if (!camp.registeredDonor.includes(donorId)) {
        camp.registeredDonor.push(donorId);
        await camp.save();
        // update the drive registration
        await DriveRegistration.findOneAndUpdate(
          { driveId },
          { $addToSet: { registeredDonor: donorId } },
          { new: true, upsert: true }
        );
      } else {
        res.status(200).json({ message: "You are already registered..." });
        return;
      }
    }

    res.status(200).json({ message: "Donor registered successfully", camp });
  } catch (error) {
    console.error("Error in donor registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/my-drives", verifyToken, async (req, res) => {
  console.log("Fetching user's drives...");
  try {
    const user_id = req.user_id;
    // filter drives by user_id to get time, title, poster name, and location
    const drives = await BloodDrive.find({ user_id }, {
      title: 1,
      poster: 1,
      location: 1,
      time: 1,
      date: 1
    }
    );
    const result = await DonorRegistration.aggregate([
      { $match: { user_id } },
      {
        $project: {
          driveId: 1,
          registeredDonorCount: { $size: "$registeredDonor" }
        }
      }
    ]);

    if (drives.length === 0) {
      return res.status(200).json({ message: "No drives found for this user" });
    }
    res.status(200).json([drives, result]);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}
);


app.post("/save-token", verifyToken, async (req, res) => {
  try {
    const { token } = req.body;
    const user_id = req.user_id;

    await NotificationTokens.findOneAndUpdate(
      { user_id },
      { $set: { token: token } },
      { new: true, upsert: true }
    );
    res.status(200).json({ message: "Successfully done" });
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).json({ message: "Failed to save", error: error.message });
  }
});

sendNotification = async (deviceToken, title, body, data) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: data,
    token: deviceToken,
  };

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    return error;
  }
};

function isBloodCompatible(donorGroup, recipientGroup) {
  donorGroup = donorGroup.toUpperCase();
  recipientGroup = recipientGroup.toUpperCase();

  if (donorGroup === recipientGroup) {
    return true;
  }

  switch (donorGroup) {
    case "O-":
      return true;
    case "O+":
      return (
        recipientGroup === "O+" ||
        recipientGroup === "A+" ||
        recipientGroup === "B+" ||
        recipientGroup === "AB+"
      );
    case "A-":
      return (
        recipientGroup === "A-" ||
        recipientGroup === "A+" ||
        recipientGroup === "AB-" ||
        recipientGroup === "AB+"
      );
    case "A+":
      return recipientGroup === "A+" || recipientGroup === "AB+";
    case "B-":
      return (
        recipientGroup === "B-" ||
        recipientGroup === "B+" ||
        recipientGroup === "AB-" ||
        recipientGroup === "AB+"
      );
    case "B+":
      return recipientGroup === "B+" || recipientGroup === "AB+";
    case "AB-":
      return recipientGroup === "AB-" || recipientGroup === "AB+";
    case "AB+":
      return false;
    default:
      return false;
  }
}

app.post("/emergency-push", verifyToken, async (req, res) => {
  try {
    const info = {
      user_id: req.user_id,
      bloodGroup: req.body.bloodGroup,
      location: req.body.location,
      contact: {
        contactEmail: req.body.contactEmail,
        contactName: req.body.contactName,
        contactPhone: req.body.contactPhone,
      },
      medicalDoc: req.body.medicalDoc,
    };

    const emergencyRequest = new EmergencyBloodRequest(info);
    const savedEmergencyRequest = await emergencyRequest.save();
    const emergencyRequestId = savedEmergencyRequest._id;

    var userProfile = await UserProfile.findOne({ user_id: req.user_id });
    if (!userProfile) {
      userProfile = await HospitalProfile.findOne({ user_id: req.user_id });
      if (!userProfile)
        return res.status(404).json({ message: "User profile not found." });
    }

    const { location } = req.body;
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/search.php`,
        {
          params: { key: LOCATIONIQ_API_KEY, q: location, format: "json" },
        }
      );

      if (response.data.length === 0) {
        return res.status(404).json({ message: "Location not found." });
      }

      const { lat: userLat, lon: userLon } = response.data[0];

      const availableUsers = await UserProfile.find({
        user_id: { $ne: req.user_id },
      });
      const nearbyUsers = availableUsers.filter((user) => {
        const distance = getDistanceFromLatLon(
          userLat,
          userLon,
          user.latitude,
          user.longitude
        );

        const isCompatible = isBloodCompatible(
          user.bloodGroup,
          info.bloodGroup
        );

        return distance <= 10 && isCompatible;
      });
      const nearbyUserIds = nearbyUsers.map((user) => user.user_id);
      const existingCall = await DonorCall.findOne({ user_id: req.user_id });

      if (existingCall !== null) {
        return res
          .status(400)
          .json({ message: "Multiple Requests not allowed within 3 Days" });
      } else {
        const newDonorCall = new DonorCall({
          user_id: req.user_id,
          request_id: emergencyRequestId,
          requested_user_id: nearbyUserIds.map((id) => ({ req_user: id })),
        });
        await newDonorCall.save();
      }

      // Save userId and emergencyRequestId in DonorRequest
      await Promise.all(
        nearbyUserIds.map(async (nearbyUserId) => {
          try {
            let donorRequest = await DonorRequest.findOne({
              user_id: nearbyUserId,
            });

            if (donorRequest) {
              if (!donorRequest.request.includes(emergencyRequestId)) {
                donorRequest.request.push(emergencyRequestId);
                await donorRequest.save();
              }
            } else {
              const newDonorRequest = new DonorRequest({
                user_id: nearbyUserId,
                request: [emergencyRequestId],
              });
              await newDonorRequest.save();
            }
          } catch (error) {
            console.error(
              `Error updating/creating DonorRequest for user ${nearbyUserId}:`,
              error
            );
          }
        })
      );

      const tokens = await NotificationTokens.find({
        user_id: { $in: nearbyUserIds },
      });

      const notificationTitle = "Emergency Blood Request!";
      const notificationBody = `A blood request has been made near you. Location: ${info.location}, Blood Type: ${info.bloodGroup}`;

      const notificationPromises = tokens.map(async (token) => {
        try {
          const response = await sendNotification(
            token.token,
            notificationTitle,
            notificationBody,
            { location: info.location, bloodGroup: info.bloodGroup }
          );
          return response;
        } catch (error) {
          console.error(
            `Error sending notification to ${token.user_id} (${token.token}):`,
            error
          );
          return null;
        }
      });

      await Promise.all(notificationPromises);
      res.status(200).json({ message: "Uploaded Successfully...." });
    } catch (locationError) {
      console.error(
        "Error fetching coordinates from LocationIQ:",
        locationError
      );
      return res.status(500).json({
        message: "Error fetching location coordinates",
        error: locationError.message,
      });
    }
  } catch (error) {
    console.error("Emergency Push Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

app.get("/donor-calls", verifyToken, async (req, res) => {
  try {
    const user_id = req.user_id;

    let donorRequest = await DonorRequest.findOne({
      user_id: user_id,
    }).populate("request");

    if (!donorRequest) {
      return res.status(200).json({ message: "No Requests for you" });
    }

    const expiredRequestIds = donorRequest.request
      .filter((req) => {
        const expirationTime =
          req.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000;
        return expirationTime <= Date.now();
      })
      .map((req) => req._id);

    if (expiredRequestIds.length > 0) {
      await DonorRequest.findOneAndUpdate(
        { user_id: user_id },
        { $pull: { request: { $in: expiredRequestIds } } },
        { new: true }
      );
      donorRequest = await DonorRequest.findOne({ user_id: user_id }).populate(
        "request"
      );
    }

    return res.status(200).json({
      ...donorRequest.toObject(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

app.post("/donor-req-res", verifyToken, async (req, res) => {
  try {
    const req_user = req.user_id;
    const { request_id } = req.body;

    const donorCall = await DonorCall.findOne({ request_id });

    if (!donorCall) {
      return res.status(404).json({ message: "DonorCall not found" });
    }

    let userFound = false;

    // Update the interest_status for the matching req_user
    donorCall.requested_user_id = donorCall.requested_user_id.map((entry) => {
      if (entry.req_user === req_user) {
        userFound = true;
        // if (entry.interest_status === true) {
        //   return res
        //     .status(404)
        //     .json({ message: "Your response is already submitted and now caller contact you further" });
        // }
        return { ...entry._doc, interest_status: true };
      }
      return entry;
    });

    if (!userFound) {
      return res
        .status(404)
        .json({ message: "Requested user not found in donor call" });
    }

    await donorCall.save();

    res.status(200).json({
      message: "Your response is submitted and now caller contact you further",
    });
  } catch (error) {
    console.error("Error in /donor-req-res:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/donor-responses", verifyToken, async (req, res) => {
  try {
    const donorCall = await DonorCall.findOne({ user_id: req.user_id });

    if (!donorCall) {
      return res
        .status(200)
        .json({ message: "No donor call found for this user." });
    }

    const responses = donorCall.requested_user_id
      .filter((entry) => entry.interest_status === true)
      .map((entry) => entry.req_user);

    // Fetch user profiles for all interested users
    const userProfiles = await UserProfile.find({ user_id: { $in: responses } })
      .select("name age bloodGroup location phone")
      .lean();

    return res.status(200).json({ interestedUsers: userProfiles });
  } catch (error) {
    console.error("Error in /donor-response:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Protected Route Example
app.get("/dashboard", verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user_role}: ${req.user_id}!` });
});

// Start Server
const PORT = 8000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
