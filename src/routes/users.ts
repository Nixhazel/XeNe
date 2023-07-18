import express from "express";
import { createUser } from '../controller/user';
const router = express.Router();

/* GET users listing. */
router.post('/signup', createUser);

export default router;
