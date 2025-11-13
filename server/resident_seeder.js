const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Resident = require('./models/Resident');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const createTestResidentUser = async () => {
  try {
    // 1. Find the first Resident in your database
    const resident = await Resident.findOne();

    if (!resident) {
      console.log('No residents found. Please add a resident via the Admin Dashboard first.');
      process.exit();
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('resident123', salt);

    // 3. Create User linked to that Resident
    // We use the resident's email if it exists, otherwise make a dummy one
    const userEmail = resident.email && resident.email !== '' 
      ? resident.email 
      : `resident${resident._id}@balihai.com`;

    // Check if user already exists
    await User.deleteOne({ email: userEmail });

    const user = await User.create({
      name: `${resident.firstName} ${resident.lastName}`,
      email: userEmail,
      password: hashedPassword,
      role: 'resident',
      linkedResident: resident._id
    });

    console.log(`Resident User Created!`);
    console.log(`Login Email: ${userEmail}`);
    console.log(`Login Password: resident123`);
    
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

createTestResidentUser();