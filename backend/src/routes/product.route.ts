import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';

const router = Router();

// Lấy danh sách sản phẩm (có hỗ trợ lọc, tìm kiếm, sắp xếp qua query params)
router.get('/', ProductController.getAll);

// Lấy chi tiết 1 sản phẩm theo Slug (cho trang chi tiết sau này)
// router.get('/:slug', ProductController.getBySlug);
router.get('/:slug', ProductController.getBySlug);
export default router;