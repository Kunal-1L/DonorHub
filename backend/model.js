const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["User", "Hospital"], required: true },
  profile_completed: { type: Boolean, default: false },
});

const Users = mongoose.model("Users", userSchema);

const userProfileSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  location: { type: String, required: true },
  longitude: { type: Number },
  latitude: { type: Number },
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

const hospitalProfileSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  longitude: { type: Number },
  latitude: { type: Number },
});

const HospitalProfile = mongoose.model(
  "HospitalProfile",
  hospitalProfileSchema
);

const BloodDriveSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  title: {
    type: String,
    required: true,
  },
  organizer: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    startTime: String,
    endTime: String,
  },
  poster: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  contact: {
    name: String,
    phone: String,
    email: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }, 
});

const BloodDrive = mongoose.model("BloodDrive", BloodDriveSchema);


const DonorRegistrationSchema = new mongoose.Schema({
  driveId: {type: String, required:true, unique: true},
  registeredDonor: [
    {type: String, required: true}
  ]
});

const DonorRegistration = mongoose.model("DonorRegistration", DonorRegistrationSchema);

const NotificationTokensSchema = new mongoose.Schema({
  user_id: {type:String, required: true, unique: true},
  token: {type: String, required: true}
});

const NotificationTokens = mongoose.model("NotificationTokens", NotificationTokensSchema);

const EmergencyBloodRequestSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  location: { type: String, required: true },
  contact: {
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
  },
  medicalDoc: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now, expires: '7d' }, 
});

const EmergencyBloodRequest = mongoose.model('EmergencyBloodRequest', EmergencyBloodRequestSchema);


module.exports = {
  Users,
  UserProfile,
  HospitalProfile,
  BloodDrive,
  DonorRegistration,
  NotificationTokens,
  EmergencyBloodRequest
};
