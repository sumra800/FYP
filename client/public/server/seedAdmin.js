const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const adminEmail = 'admin@servease.com';
        const adminPassword = 'adminpassword123';

        // Check if admin exists
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        // Create admin user
        const user = await User.create({
            name: 'Super Admin',
            email: adminEmail,
            password: adminPassword,
            phone: '0000000000',
            address: 'Admin HQ',
            role: 'admin',
            isVerified: true
        });

        console.log('Admin user created successfully!');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
