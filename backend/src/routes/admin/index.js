import { Router } from 'express';
import dashboardRouter from './dashboard.js';
import productsRouter from './products.js';
import categoriesRouter from './categories.js';
import ordersRouter from './orders.js';
import heroRouter from './hero.js';
import testimonialsRouter from './testimonials.js';
import paymentAdminRouter from './payment.js';
import festivalAdminRouter from './festival.js';
import uploadRouter from './upload.js';

const router = Router();

router.use('/dashboard', dashboardRouter);
router.use('/products', productsRouter);
router.use('/categories', categoriesRouter);
router.use('/orders', ordersRouter);
router.use('/hero', heroRouter);
router.use('/testimonials', testimonialsRouter);
router.use('/payment', paymentAdminRouter);
router.use('/festival', festivalAdminRouter);
router.use('/upload', uploadRouter);

export default router;
