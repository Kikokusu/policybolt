export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_test_solo',
    priceId: import.meta.env.VITE_STRIPE_SOLO_PRICE_ID || 'price_test_solo_default',
    name: 'Solo Developer Plan',
    description: 'Perfect for indie makers and solo founders. Includes 1 project with GitHub integration, auto-updating privacy policies, limited compliance coverage and email support.',
    mode: 'subscription',
  },
  {
    id: 'prod_test_startup',
    priceId: import.meta.env.VITE_STRIPE_STARTUP_PRICE_ID || 'price_test_startup_default',
    name: 'Growing Startup',
    description: 'Built for fast-moving teams. Manage up to 5 projects with auto-updating privacy policies, global compliance coverage, team collaboration tools, GitHub integration, and priority support.',
    mode: 'subscription',
  },
];