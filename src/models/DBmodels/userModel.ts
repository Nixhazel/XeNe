import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		userName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		dateOfBirth: {
			type: Date,
		},
		phone: {
			type: String,
		},
		gender: {
			type: String,
		},
		walletBalance: {
			type: Number,
			default: 0,
		},
		isVerified: {
			type: Boolean,
			required: true,
		},
		// isAdmin: {
		// 	type: Boolean,
		// 	required: true,
		// },
	},
	{
		timestamps: true,
	}
);

const userModel = mongoose.model("user", userSchema);

export default userModel;
