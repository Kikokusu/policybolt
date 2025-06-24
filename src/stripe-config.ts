export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SYa8awaf74Iiis',
    priceId: 'price_1RdTBsKSNriwT6N60Z6lrIQQ', // Update this to your active Solo Developer price ID
    name: 'Solo Developer Plan',
    description: 'Perfect for indie makers and solo founders. Includes 1 project with GitHub integration, auto-updating privacy policies, limited compliance coverage and email support.',
    mode: 'subscription',
  },
  {
    id: 'prod_SYa9IHBxnGkfXj',
    priceId: 'price_1RdSzKKSNriwT6N6Tlfyh1oV', // Update this to your active Growing Startup price ID
    name: 'Growing Startup',
    description: 'Built for fast-moving teams. Manage up to 5 projects with auto-updating privacy policies, global compliance coverage, team collaboration tools, GitHub integration, and priority support.',
    mode: 'subscription',
  },
];