import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

// Validate required environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

if (!stripeSecret) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

    const { return_url } = await req.json();

    if (!return_url) {
      return corsResponse({ error: 'return_url is required' }, 400);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return corsResponse({ error: 'Authorization header is required' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      console.error('Authentication error:', getUserError);
      return corsResponse({ error: 'Failed to authenticate user' }, 401);
    }

    // Get customer info
    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single();

    if (getCustomerError || !customer) {
      console.error('Customer lookup error:', getCustomerError);
      return corsResponse({ error: 'Customer not found' }, 404);
    }

    try {
      // Create a billing portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customer.customer_id,
        return_url: return_url,
      });

      console.log(`Created billing portal session for customer ${customer.customer_id}`);

      return corsResponse({ 
        url: portalSession.url,
        session_id: portalSession.id 
      });

    } catch (stripeError: any) {
      console.error('Stripe API error:', stripeError);
      return corsResponse({ 
        error: 'Failed to create billing portal session',
        details: stripeError.message 
      }, 500);
    }

  } catch (error: any) {
    console.error('Billing portal endpoint error:', error);
    return corsResponse({ 
      error: 'Internal server error',
      details: error.message 
    }, 500);
  }
});