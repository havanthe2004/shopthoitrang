import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';

const router = Router();
router.get('/tree', CategoryController.getTree);
export default router;