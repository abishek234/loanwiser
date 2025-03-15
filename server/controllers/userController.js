const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const OTP = require('../models/otpModel');
const { generateOTP, sendEmail, validateEmail, validatePassword } = require('../utils/helpers');
const { generateToken } = require('../utils/jwtUtils');


const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;


        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }


        if (!validateEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long and contain at least one letter,one special character and one number'
            });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            userId: newUser.id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};


const requestLoginOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }


        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }


        const otp = generateOTP();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes

        await OTP.create(user.id, otp, expiresAt);

        const emailSent = await sendEmail({
            to: email,
            subject: 'Your Login OTP',
            text: `Your OTP for login is: ${otp}. This OTP will expire in 10 minutes.`
        });

        if (!emailSent) {
            return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            userId: user.id
        });
    } catch (error) {
        console.error('OTP request error:', error);
        res.status(500).json({ success: false, message: 'Server error while sending OTP' });
    }
};


const verifyLoginOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }


        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const otpRecord = await OTP.verify(user.id, otp);
        if (!otpRecord) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        }


        await OTP.deleteById(otpRecord.id);


        const userInfo = User.sanitizeUser(user);

        const token = generateToken(userInfo);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userInfo,
            token
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ success: false, message: 'Server error during OTP verification' });
    }
};

const loginWithPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }


        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }


        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }


        const userInfo = User.sanitizeUser(user);


        const token = generateToken(userInfo);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userInfo,
            token
        });
    } catch (error) {
        console.error('Password login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

module.exports = {
    registerUser,
    requestLoginOTP,
    verifyLoginOTP,
    loginWithPassword
};