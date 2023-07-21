import nodemailer from "nodemailer";
const userEmail = process.env.USEREMAIL;
const emailPass = process.env.PASS;
const service = process.env.SERVICE;

const configOptions = {
	host: "smtp.gmail.com",
	service: service,
	port: 587,
	secure: false,
	auth: {
		user: userEmail,
		pass: emailPass,
	},
	tls: {
		rejectUnauthorized: false,
	},
};
const sendMail = async (email: string, subject: string, html: string) => {
	try {
		const transport: any = nodemailer.createTransport(configOptions);
		await transport.sendMail({
			from: userEmail,
			to: email,
			subject: subject,
			html: html,
		});
	} catch (error) {
		console.log("Email not sent");
		console.log(error);
	}
};
export default sendMail;
