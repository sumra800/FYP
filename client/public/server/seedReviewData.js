const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedReviewData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Create a Provider (Staff)
        let provider = await User.findOne({ email: 'provider@servease.com' });
        if (!provider) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            provider = await User.create({
                name: 'Test Provider',
                email: 'provider@servease.com',
                password: hashedPassword,
                role: 'staff',
                phone: '1234567890',
                address: '123 Provider St'
            });
            console.log('Provider created');
        } else {
            console.log('Provider already exists');
        }

        // 2. Create a Client
        let client = await User.findOne({ email: 'client@servease.com' });
        if (!client) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            client = await User.create({
                name: 'Test Client',
                email: 'client@servease.com',
                password: hashedPassword,
                role: 'client',
                phone: '0987654321',
                address: '456 Client Ave'
            });
            console.log('Client created');
        } else {
            console.log('Client already exists');
        }

        // 3. Create a Completed Booking
        const booking = await Booking.create({
            user: client._id,
            service: 'Home Cleaning',
            serviceId: 1,
            date: new Date(),
            time: '10:00',
            duration: 2,
            address: '456 Client Ave',
            status: 'completed',
            assignedHelper: provider._id,
            helperName: provider.name,
            totalAmount: 1000,
            paymentMethod: 'cash',
            paymentStatus: 'paid'
        });

        console.log('Completed booking created:', booking._id);

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedReviewData();
