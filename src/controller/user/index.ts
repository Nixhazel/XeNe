import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/DBmodels/userModel";
import { signupUserZod } from "../../models/zod";

const saltRounds = parseInt(process.env.SALT_ROUNDS || "");
const secret = process.env.JWT_SECRET as string;

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
		const { email, password, userName } = req.body;
		const existingUser = await User.findOne({
			email: email,
		});
		if (existingUser) {
			return res
				.status(409)
				.send({ message: "User already exists", success: false });
		}

		// const token = jwt.sign({ email: email }, secret, { expiresIn: "1d" });
		const salt = await bcrypt.genSaltSync(saltRounds);
		const hashPassword = await bcrypt.hashSync(password, salt);

		const newUserData = {
			userName,
			email,
			password: hashPassword,
			isVerified: false,
			oTp: Math.floor(Math.random() * (9 - 0 + 1)) + 0,
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
	} catch (error) {}
};
