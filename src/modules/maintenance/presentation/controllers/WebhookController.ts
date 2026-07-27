import type { Request, Response, NextFunction } from "express";
import { StripeService } from "../../infrastructure/services/StripeService";
import { HandleStripePaymentSucceededUseCase } from "../../application/use-cases/HandleStripePaymentSucceededUseCase";
import Stripe from "stripe";

export class WebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly handleStripePaymentSucceededUseCase: HandleStripePaymentSucceededUseCase,
  ) { }

  handleStripeWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      res.status(400).send("Missing Stripe signature header");
      return;
    }

    let event: Stripe.Event;

    try {
      // req.body must be the RAW buffer here, not JSON-parsed —
      // this only works if webhookRoutes.ts uses express.raw(), not express.json()
      event = this.stripeService.constructWebhookEvent(req.body as Buffer, signature);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);
      res.status(400).send(`Webhook signature verification failed`);
      return;
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const invoiceId = Number(paymentIntent.metadata.invoiceId);

          await this.handleStripePaymentSucceededUseCase.execute({
            invoiceId,
            paymentIntentId: paymentIntent.id,
            amountReceived: paymentIntent.amount_received,
          });
          break;
        }

        default:
          // Ignore event types we don't care about (Stripe sends many)
          break;
      }

      // Always respond 200 quickly so Stripe doesn't retry unnecessarily
      res.status(200).json({ received: true });
    } catch (error) {
      // Log but still acknowledge receipt — Stripe will retry on non-2xx,
      // and our HandleStripePaymentSucceededUseCase is already idempotent
      console.error("Error processing Stripe webhook event:", error);
      next(error);
    }
  };
}