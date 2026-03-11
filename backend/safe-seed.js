const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const Complaint = require('./models/Complaint');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/citizen_grievance_portal';
    await mongoose.connect(mongoUri);
    console.log('Seed: Connected to MongoDB');

    // Create Departments
    let dept1 = await Department.findOne({ name: 'PWD (Public Works Department)' });
    if (!dept1) {
      dept1 = await Department.create({
        name: 'PWD (Public Works Department)',
        categoriesHandled: ['Potholes', 'Other']
      });
    }

    let dept2 = await Department.findOne({ name: 'Sanitation Department' });
    if (!dept2) {
      dept2 = await Department.create({
        name: 'Sanitation Department',
        categoriesHandled: ['Garbage Overflow', 'Water Leakage']
      });
    }

    // Create Admin
    if (!await User.findOne({ email: 'admin@city.gov' })) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@city.gov',
        password: 'password123',
        role: 'ADMIN',
        phone: '1234567890'
      });
    }

    // Create Officers
    let officer1 = await User.findOne({ email: 'john@pwd.gov' });
    if (!officer1) {
      officer1 = await User.create({
        name: 'Officer John',
        email: 'john@pwd.gov',
        password: 'password123',
        role: 'OFFICER',
        phone: '9998887776',
        departmentId: dept1._id
      });
    }

    let officer2 = await User.findOne({ email: 'sarah@sani.gov' });
    if (!officer2) {
      officer2 = await User.create({
        name: 'Officer Sarah',
        email: 'sarah@sani.gov',
        password: 'password123',
        role: 'OFFICER',
        phone: '1112223334',
        departmentId: dept2._id
      });
    }

    // Create Citizen
    let citizen = await User.findOne({ email: 'alex@gmail.com' });
    if (!citizen) {
      citizen = await User.create({
        name: 'Alex Citizen',
        email: 'alex@gmail.com',
        password: 'password123',
        role: 'CITIZEN',
        phone: '5554443332'
      });
    }

    console.log('Missing seed accounts added to DB Successfully');
    process.exit();
  } catch (error) {
    console.error('Seed: Error', error);
    process.exit(1);
  }
};

seedData();
