const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: 'c:/Users/K/Desktop/CGMP/backend/.env' });

const User = require('c:/Users/K/Desktop/CGMP/backend/models/User.js');

const checkDb = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/citizen_grievance_portal');
        console.log('Connected to DB');

        const users = await User.find({}).select('+password');
        for (const user of users) {
             console.log(`User: ${user.email}`);
             console.log(`Password Hash: ${user.password}`);
             if (user.password) {
                 const isMatch = await bcrypt.compare('password123', user.password);
                 console.log(`Matches 'password123': ${isMatch}`);
             } else {
                 console.log(`No password field found.`);
             }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDb();
