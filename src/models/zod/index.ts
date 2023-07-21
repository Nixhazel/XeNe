import { z } from "zod";

export const signupUserZod = z.object({
	userName: z
		.string({
			required_error: "User Name is required",
		})
		.min(3, {
			message: "User user name must be 3 or more characters long",
		}),

	email: z.string({ required_error: "Email is required" }).email(),

	password: z
		.string({
			required_error: "Password is required",
		})
		.min(8, { message: "Password must be 8 or more characters long" }),
	// gender: z.string({
	// 	required_error: "User gender is required",
	// }),
	// 	.min(3, {
	// 		message: 'User Last Name name must be 3 or more characters long'
	// 	}),

	// phone: z.string({
	// 	required_error: "User Phone Number is required",
	// }),
	// 	.min(4, { message: 'User Gender must be 4 or more characters long' }),
	// dateOfBirth: z.string({
	// 	required_error: 'Please select a date',
	// 	invalid_type_error: "That's not a date!"
	// })
});

export const loginZod = z.object({
	userNameEmail:z.union([z
		.string({
			required_error: "User Name is required",
		})
		.min(3, {
			message: "User user name must be 3 or more characters long",
		}), z.string({ required_error: "Email is required" }).email()]),

	password: z
		.string({
			required_error: "Password is required",
		})
		.min(8, { message: "Password must be 8 or more characters long" }),
});


