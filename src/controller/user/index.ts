import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import User from "../../models/DBmodels/userModel";
import { loginZod, signupUserZod, updateProfileZod } from "../../models/zod";
import sendMail from "../../utills/config/email.config";

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
		const html = `
		<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>User Verification</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <h1 style="color: #007bff; margin: 0;">User Verification</h1>
    <h2 style="color: #333; margin-top: 10px;">Hello ${newuser.userName},</h2>
    <p style="color: #333; font-size: 16px;">Please enter the OTP below to verify your account.</p>
    <div style="background-color: #007bff; color: #ffffff; padding: 10px; border-radius: 5px; font-size: 24px; text-align: center;">
      <p style="margin: 0;">${newuser.oTp}</p>
    </div>
  </div>
  <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">If you did not request this verification, please ignore this email.</p>
  <p style="color: #666; font-size: 14px; text-align: center;">Best regards,<br>SERV</p>
</body>
</html>
`;
		await sendMail(newuser.email, "Account verification", html);

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

export const logIn = async (req: Request, res: Response) => {
	const error: any = loginZod.safeParse(req.body);
	if (error.success === false) {
		return res.status(400).send({
			success: false,
			path: req.url,
			message: error.error.issues[0].message,
		});
	}
	try {
		
		const { userNameEmail, password } = req.body;
		const user = await User.findOne({
			$or: [{ email: userNameEmail }, { userName: userNameEmail }],
		});

		if (!user) {
			return res.status(400).send({
				status: "error",
				success: false,
				path: req.url,
				message: "User dose not exist",
			});
		}
		
		const verified = user!.isVerified
		if (!verified) {
			return res.status(400).send({
				status: "error",
				success: false,
				path: req.url,
				message: "User is not verified",
			});
		}

		const isMatch = await bcrypt.compareSync(password, user.password);
		if (!isMatch) {
			return res.status(400).send({
				status: "error",
				success: false,
				path: req.url,
				message: "Invalid Password",
			});
		}

		const token = jwt.sign(
			{ _id: user._id, email: user.email, isverified: user.isVerified },
			secret
		);

		return res.status(200).send({
			status: "success",
			success: true,
			message: "login successful",
			user,
			loginToken: token,
		});

	} catch (error) {
		res.status(500).send({
			status: "error",
			error: error,
			path: req.url,
			message: "Something went wrong Loging in",
			success: false,
		});
	}
}

export const completeProfile = async (req: Request, res: Response) => {
	const error: any = updateProfileZod.safeParse(req.body);
	if (error.success === false) {
		return res.status(400).send({
			success: false,
			path: req.url,
			message: error.error.issues[0].message,
		});
	}

	try {
		const { firstName, lastName, phone, dateOfBirth } = req.body
		const userId = req.user; 

		const existingUser = await User.findOne({
			_id: userId,
		});

		if (!existingUser) {
			return res
				.status(404)
				.send({ message: "User not found", success: false, path: req.url });
		}

		if (!existingUser.isVerified) {
			return res
				.status(404)
				.send({ message: "User has not verified their email", success: false, path: req.url });
		}

		const completeUserData = {
			firstName: firstName,
			lastName: lastName,
			phone: phone,
			dateOfBirth: dateOfBirth,
		};

		await User.findOneAndUpdate({ _id: userId }, completeUserData, {
			new: true,
		});

		return res.status(202).send({
			status: "success",
			success: true,
			message: "User Profile details has been updated",
		});

	} catch (error) {
		res.status(500).send({
			status: "error",
			error: error,
			path: req.url,
			message: "Something went wrong completing profile details",
			success: false,
		});
	}
};
