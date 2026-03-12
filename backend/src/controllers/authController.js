import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import validator from "validator";
import Session from "../models/Session.js";
import User from "../models/User.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

export const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: "First name, last name, email, and password are required." });
        }
        const normalizedEmail = (email || "").trim().toLowerCase();
        if (!validator.isEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Invalid email!" });
        }

        const duplicate = await User.findOne({ email: normalizedEmail });
        if (duplicate) {
            return res.status(409).json({ message: "Email already exist!" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const displayName = `${(lastName || "").trim()} ${(firstName || "").trim()}`.trim();
        const user = await User.create({
            email: normalizedEmail,
            password: hashPassword,
            displayName,
            phone: (phone || "").trim(),
        });

        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: ACCESS_TOKEN_TTL,
        });

        const refreshToken = crypto.randomBytes(64).toString("hex");
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: REFRESH_TOKEN_TTL,
        });

        return res.status(201).json({
            token: accessToken,
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                roles: user.roles || [],
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const normalizedEmail = (email || "").trim().toLowerCase();
        if (!validator.isEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Invalid email!" });
        }

        const user = await User.findOne({ email: normalizedEmail }).populate({
            path: "roles",
            select: "_id",
        });
        if (!user) {
            return res.status(401).json({ message: "Email or password is incorrect" });
        }

        const passwordCorrect = await bcrypt.compare(password, user.password);
        if (!passwordCorrect) {
            return res.status(401).json({ message: "Email or password is incorrect" });
        }

        //create a jwt token
        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: ACCESS_TOKEN_TTL,
        });

        //refresh token    
        const refreshToken = crypto.randomBytes(64).toString("hex");

        //create new session to save refresh token
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: REFRESH_TOKEN_TTL,
        });

        //return jwt token in response body        
        const roles = (user.roles || []).map((role) => role._id);
        return res.status(200).json({
            token: accessToken,
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                roles,
            },
        });
    } catch (error) {
        console.error("login error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (token) {
            await Session.deleteOne({ refreshToken: token });
            res.clearCookie("refreshToken");
        }
        return res.sendStatus(204);
    } catch (error) {
        console.error("logout error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({ message: "Token is not available" });
        }

        const session = await Session.findOne({ refreshToken: token });
        if (!session) {
            return res.status(403).json({ message: "Invalid token or expired" });
        }

        if (session.expiresAt < new Date()) {
            return res.status(403).json({ message: "Token has expired" });
        }

        const accessToken = jwt.sign({ userId: session.userId }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: ACCESS_TOKEN_TTL,
        });

        return res.status(200).json({ accessToken });
    } catch (error) {
        console.error("refreshToken error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const me = async (req, res) => {
    try {
        return res.status(200).json({ user: req.user });
    } catch (error) {
        console.error("me error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
