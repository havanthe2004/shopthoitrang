import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';

const router = Router();
router.get('/best-sellers',ProductController.getBestSellers)
router.get('/', ProductController.getAll);
router.get('/search', ProductController.search);
router.get('/:slug', ProductController.getBySlug);

export default router;