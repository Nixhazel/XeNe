import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
		},
		lastName: {
			type: String,
		},
		userName: {
			type: String,
			required: true,
			unique: true,
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
		oTp: {
			type: Number,
			required: true,
			default: 0,
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
