import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { verifyToken } from '../middlewares/auth.middleware';
import { uploadUserAvatar } from "../config/uploaders";

const router = Router();

// Tất cả các route dưới đây đều cần verifyToken
router.use(verifyToken);

// 1. Quản lý thông tin cá nhân & Avatar
router.get('/me', UserController.getProfile);
router.put('/profile',  uploadUserAvatar.single("avatar"), UserController.updateProfile);

// 2. Đổi mật khẩu
router.post('/change-password', UserController.changePassword);

// 3. Quản lý sổ địa chỉ (Address Book)
router.get('/addresses', UserController.getAddresses);
router.post('/addresses', UserController.addAddress);
router.put('/addresses/:id', UserController.updateAddress);
router.delete('/addresses/:id', UserController.deleteAddress);
router.patch('/addresses/:id/default', UserController.setDefaultAddress);

export default router;