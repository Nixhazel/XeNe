import express from "express";
import { completeProfile, createUser, logIn, verifyUserOtp } from '../controller/user';
import { authenticate } from '../middleware/auth';
const router = express.Router();

/* GET users listing. */
router.post('/signup', createUser);
router.post("/verifyUserOtp", verifyUserOtp);
router.post("/logIn", logIn);
router.post("/completeprofile", authenticate, completeProfile);

export default router;
