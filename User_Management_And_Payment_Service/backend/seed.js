const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const register = async () => {
    try {
        connectDB(); // Connect to MongoDB
        const hashPassword = await bcrypt.hash("admin",10);
        const newUser = new User({
            name: 'System Admin',
            email: 'sysadmin@digidine.com',
            password: hashPassword,
            phoneNo: '1234567890',
            address: '123 Admin St, City, Country',
            role: 'restaurant_owner',
        });
        await newUser.save();
        console.log('Retaurent user created successfully');
    } catch (error) {
        console.error(error);
        process.exit(1); // Exit process with failure
    }
    
}

register();