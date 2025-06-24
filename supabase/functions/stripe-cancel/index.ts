import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { action, reason, comment, accept_discount } = await req.json();

    if (!action || !['cancel', 'apply_discount'].includes(action)) {
      return corsResponse({ error: 'Invalid action. Must be "cancel" or "apply_discount"' }, 400);
    }

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return corsResponse({ error: 'Failed to authenticate user' }, 401);
    }

    // Get customer and subscription info
    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single();

    if (getCustomerError || !customer) {
      return corsResponse({ error: 'Customer not found' }, 404);
    }

    const { data: subscription, error: getSubscriptionError } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('customer_id', customer.customer_id)
      .is('deleted_at', null)
      .single();

    if (getSubscriptionError || !subscription) {
      return corsResponse({ error: 'Subscription not found' }, 404);
    }

    if (action === 'apply_discount') {
      // Apply 50% discount for 3 months
      if (!subscription.subscription_id) {
        return corsResponse({ error: 'No active subscription to apply discount to' }, 400);
      }

      try {
        // Create or retrieve the 50OFF3 coupon
        let coupon;
        try {
          coupon = await stripe.coupons.retrieve('50OFF3');
        } catch (error) {
          // If coupon doesn't exist, create it
          coupon = await stripe.coupons.create({
            id: '50OFF3',
            percent_off: 50,
            duration: 'repeating',
            duration_in_months: 3,
            name: 'Retention Offer - 50% Off for 3 Months',
          });
        }

        // Apply the coupon to the subscription
        await stripe.subscriptions.update(subscription.subscription_id, {
          coupon: '50OFF3',
        });

        // Log the retention success
        console.log(`Applied retention discount to subscription ${subscription.subscription_id} for user ${user.id}`);

        return corsResponse({ 
          success: true, 
          message: 'Discount applied successfully! You\'ll save 50% for the next 3 months.' 
        });

      } catch (error: any) {
        console.error('Error applying discount:', error);
        return corsResponse({ error: 'Failed to apply discount' }, 500);
      }
    }

    if (action === 'cancel') {
      // Log cancellation feedback
      console.log('Cancellation Feedback:', {
        user_id: user.id,
        customer_id: customer.customer_id,
        subscription_id: subscription.subscription_id,
        subscription_status: subscription.status,
        reason: reason || 'No reason provided',
        comment: comment || 'No comment provided',
        timestamp: new Date().toISOString(),
      });

      try {
        // Cancel the Stripe subscription if it exists and is not already canceled
        if (subscription.subscription_id && !['canceled', 'incomplete_expired'].includes(subscription.status)) {
          // Cancel the Stripe subscription
          await stripe.subscriptions.cancel(subscription.subscription_id);
          
          console.log(`Canceled subscription ${subscription.subscription_id} for user ${user.id}`);
        } else if (subscription.status === 'trialing') {
          // For trialing subscriptions, we still want to cancel to prevent future billing
          if (subscription.subscription_id) {
            await stripe.subscriptions.cancel(subscription.subscription_id);
            console.log(`Canceled trial subscription ${subscription.subscription_id} for user ${user.id}`);
          }
        }

        // Update our database
        await supabase
          .from('stripe_subscriptions')
          .update({ 
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('customer_id', customer.customer_id);

        // Deactivate all user projects when subscription is canceled
        try {
          const { error: projectsError } = await supabase
            .from('projects')
            .update({ 
              status: 'inactive',
              github_synced: false,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (projectsError) {
            console.error('Error deactivating user projects:', projectsError);
            // Don't fail the cancellation if project update fails, just log it
          } else {
            console.log(`Deactivated all projects for user ${user.id} after subscription cancellation`);
          }
        } catch (projectError) {
          console.error('Failed to deactivate user projects:', projectError);
          // Don't fail the cancellation if project update fails
        }
        return corsResponse({ 
          success: true, 
          message: subscription.status === 'trialing' ? 'Trial canceled successfully' : 'Subscription canceled successfully'
        });

      } catch (error: any) {
        console.error('Error canceling subscription:', error);
        return corsResponse({ error: `Failed to cancel ${subscription.status === 'trialing' ? 'trial' : 'subscription'}` }, 500);
      }
    }

  } catch (error: any) {
    console.error('Cancel endpoint error:', error);
    return corsResponse({ error: error.message }, 500);
  }
});