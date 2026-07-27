import { Router } from 'express';
import express from 'express';
import { webhookController } from '../../container';

const webhookRouter = Router();

webhookRouter.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook,
);

export default webhookRouter;
