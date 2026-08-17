import Stripe from 'stripe';
import { env } from './env';
import { HttpError } from '../utils/httpError';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.stripe.secretKey) {
    throw new HttpError(503, 'Stripe no está configurado (falta STRIPE_SECRET_KEY)');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(env.stripe.secretKey, {
      apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion,
    });
  }
  return stripeClient;
}
