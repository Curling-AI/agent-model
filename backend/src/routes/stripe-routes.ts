import { Router } from 'express';
import { StripeController } from '../controllers/StripeController';

const router = Router();

router.get('/products', StripeController.getAllProducts);

router.get('/invoices', StripeController.getCustomerInvoices);

router.get('/user-subscription', StripeController.getUserSubscription);

router.post('/checkout/session', StripeController.createCheckoutSession);

router.post('/billing-portal/session', StripeController.createBillingPortalSession);

export default router;