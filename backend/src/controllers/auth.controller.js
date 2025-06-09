import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
    const {email, password, fullName} = req.body

    try {
        // Validate input
        if (!email || !password || !fullName) {
            return res.status(400).json({message: "All fields are required"});
        }

        if (password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters long"});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({message: "Invalid email format"});
        }
        // Check if user already exists
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "Email already exists, please use a different email"});
        }

        const idx = Math.floor(Math.random() * 100) + 1; 
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            fullName,
            email,
            password,
            profilePicture: randomAvatar,
        });

        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePicture || "",
            });

            console.log(`Stream user created for ${newUser.fullName}`);
        } catch (error) {
            console.error("Error creating Stream user:", error);
        }

        const token = jwt.sign(
            {userId: newUser._id},
            process.env.JWT_SECRET_KEY,
            {expiresIn: "7d"}
        );

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true, //XSS Protection
            sameSite: "strict", // CSRF protection
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        });

        res.status(201).json({success: true, user: newUser});

    } catch (error) {
        return res.status(500).json({message: "Server error", error: error.message});
    }

}

export async function login(req, res) {
    try {
        const {email, password} = req.body;

        if ( !email || !password ) {
            return res.status(400).json({message: "All fields are required"});
        }

        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({message: "Invalid email or password"});
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({message: "Invalid email or password"});
        }

        const token = jwt.sign(
            {userId: user._id},
            process.env.JWT_SECRET_KEY,
            {expiresIn: "7d"}
        );

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true, //XSS Protection
            sameSite: "strict", // CSRF protection
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        });

        res.status(200).json({success: true, user});

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({message: "Server error", error: error.message});
    }
}

export function logout(req, res) {
    res.clearCookie("jwt")
    res.status(200).json({message: "Logged out successfully"});
}