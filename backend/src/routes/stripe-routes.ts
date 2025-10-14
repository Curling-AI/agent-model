import { Router } from 'express';
import { StripeController } from '../controllers/StripeController';

const router = Router();

router.get('/products', StripeController.getAllProducts);

router.get('/invoices', StripeController.getCustomerInvoices);

export default router;