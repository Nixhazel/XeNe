import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import User from "../../models/DBmodels/userModel";
import { signupUserZod } from "../../models/zod";

const saltRounds = parseInt(process.env.SALT_ROUNDS || "");
const secret = process.env.JWT_SECRET as string;
const otpLength = parseInt(process.env.OTP_LENGTH || "");

export const createUser = async (req: Request, res: Response) => {
	const error: any = signupUserZod.safeParse(req.body);
	if (error.success === false) {
		return res.status(400).send({
			success: false,
			path: req.url,
			message: error.error.issues[0].message,
		});
	}

	try {
		const { email, password, confirmPassword, userName } = req.body;
		const existingUser = await User.findOne({
			email: email,
		});
		if (existingUser) {
			return res
				.status(409)
				.send({ message: "User already exists", success: false });
		}

		if (password !== confirmPassword) {
			return res
				.status(409)
				.send({ message: "Password and ConfirmPassword dose not match" });
		}
		// const token = jwt.sign({ email: email }, secret, { expiresIn: "1d" });
		const salt = await bcrypt.genSaltSync(saltRounds);
		const hashPassword = await bcrypt.hashSync(password, salt);

		const newUserData = {
			userName,
			email,
			password: hashPassword,
			isVerified: false,
			oTp: otpGenerator.generate(otpLength, {
				digits: true,
				lowerCaseAlphabets: false,
				upperCaseAlphabets: false,
				specialChars: false,
			}),
			// isAdmin: false,
		};
		const newuser = new User(newUserData);
		await newuser.save();

		return res.status(201).send({
			status: "success",
			success: true,
			path: req.url,
			message: `New user with email - ${newuser.email} added successfully`,
			data: newuser,
		});
	} catch (error) {
		res.status(500).send({
			status: "error",
			error: error,
			path: req.url,
			message: "Something went wrong creating user",
			success: false,
		});
	}
};

export const verifyUserOtp = async (req: Request, res: Response) => {
	try {
		const { email, oTp } = req.body;

		const existingUser = await User.findOne({
			email: email,
		});

		if (!existingUser) {
			return res
				.status(404)
				.send({ message: "User not found", success: false });
		}

		if (existingUser && existingUser.oTp !== oTp) {
			return res.status(401).send({ message: "Invalid OTP", success: false });
		}
		await User.findByIdAndUpdate(existingUser._id, { isVerified: true });

		return res.status(202).send({
			message: "User is now Verified",
			status: "success",
			success: true,
			path: req.url,
			// data: { existingUser }
		});
	} catch (error) {
		res.status(500).send({
			status: "error",
			error: error,
			path: req.url,
			message: "Something went wrong verifying user",
			success: false,
		});
	}
};
