// express-backend/src/routes/auth.ts
import { Router } from 'express';
import { signupUser, signinUser } from '../controllers/authController';

const router = Router();

router.post('/signup', signupUser);
router.post('/signin', signinUser);

export default router;
