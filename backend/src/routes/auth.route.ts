import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';


const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/refresh-token', AuthController.refreshToken);
export default router;
