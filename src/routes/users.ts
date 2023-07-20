import express from "express";
import { createUser, verifyUserOtp } from '../controller/user';
const router = express.Router();

/* GET users listing. */
router.post('/signup', createUser);
router.post("/verifyUserOtp", verifyUserOtp);

export default router;
