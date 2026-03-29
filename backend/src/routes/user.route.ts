import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { uploadUserAvatar } from "../config/uploaders";

const router = Router();

router.use(verifyToken);


router.get('/me', UserController.getProfile);
router.put('/profile', uploadUserAvatar.single("avatar"), UserController.updateProfile);
router.post('/change-password', UserController.changePassword);
router.get('/addresses', UserController.getAddresses);
router.post('/addresses', UserController.addAddress);
router.put('/addresses/:id', UserController.updateAddress);
router.delete('/addresses/:id', UserController.deleteAddress);
router.patch('/addresses/:id/default', UserController.setDefaultAddress);

export default router;