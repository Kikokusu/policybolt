import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-auth',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req) => {
  // Handle CORS preflight FIRST, before any other logic
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }
  
  // Log request details after CORS handling
  console.log(`[${new Date().toISOString()}] ${req.method} request received`);
  console.log('Request URL:', req.url);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  // Test endpoint
  if (req.method === 'GET') {
    console.log('GET request - returning function status');
    return new Response(JSON.stringify({
      status: 'ok',
      message: 'Send-email function is running',
      timestamp: new Date().toISOString(),
      hasResendKey: !!RESEND_API_KEY,
      version: '1.0.0'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if RESEND_API_KEY is set
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return new Response(JSON.stringify({
        error: 'Email service not configured - Missing RESEND_API_KEY'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { type, name, email, subject, message, company } = requestBody;

    // Validate required fields
    if (!type || !name || !email || !subject || !message) {
      console.error('Missing required fields:', { type, name, email, subject, message });
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        received: { type: !!type, name: !!name, email: !!email, subject: !!subject, message: !!message }
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // For support requests, verify user is authenticated
    if (type === 'support') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        console.error('No authorization header for support request');
        return new Response(JSON.stringify({
          error: 'Authentication required for support requests'
        }), {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        return new Response(JSON.stringify({
          error: 'Invalid authentication'
        }), {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      
      console.log('Authenticated user:', user.email);
    }

    // Prepare email content
    const emailSubject = type === 'support' 
      ? `[Support Request] ${subject}` 
      : `[Contact Form] ${subject}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">PolicyBolt</h1>
          <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">
            ${type === 'support' ? 'Support Request' : 'Contact Form Submission'}
          </p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">${subject}</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 100px;">Name:</td>
                <td style="padding: 8px 0; color: #1f2937;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937;">${email}</td>
              </tr>
              ${company ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Company:</td>
                <td style="padding: 8px 0; color: #1f2937;">${company}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Type:</td>
                <td style="padding: 8px 0;">
                  <span style="background: ${type === 'support' ? '#10B981' : '#3B82F6'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${type === 'support' ? 'Support Request' : 'Contact Form'}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">Message:</h3>
            <div style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3B82F6;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>Reply to:</strong> ${email}
            </p>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">This email was sent from PolicyBolt ${type === 'support' ? 'Support System' : 'Contact Form'}</p>
          <p style="margin: 5px 0 0 0;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      </div>
    `;

    console.log('Sending email via Resend...');
    console.log('RESEND_API_KEY exists:', !!RESEND_API_KEY);
    console.log('RESEND_API_KEY length:', RESEND_API_KEY?.length);
    
    // IMPORTANT: Use the correct sender email that matches your DNS configuration
    const emailPayload = {
      from: 'Policy Bolt Team <contact@policybolt.vcorrea.com>', // FIXED: Now matches your DNS
      to: ['vitorcorreadev@gmail.com', 'contact@vcorrea.com'],
      subject: emailSubject,
      html: emailHtml,
      reply_to: email
    };
    
    console.log('Email payload (without API key):', {
      ...emailPayload,
      apiKeySet: !!RESEND_API_KEY
    });

    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      const responseText = await emailResponse.text();
      console.log('Resend response status:', emailResponse.status);
      console.log('Resend response headers:', Object.fromEntries(emailResponse.headers.entries()));
      console.log('Resend response body:', responseText);

      if (!emailResponse.ok) {
        console.error('Resend API error - Status:', emailResponse.status);
        console.error('Resend API error - Body:', responseText);
        
        let errorMessage = 'Failed to send email';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
          
          // Check for specific Resend errors
          if (errorData.name === 'validation_error') {
            errorMessage = `Validation error: ${errorData.message}`;
          } else if (errorData.name === 'rate_limit_exceeded') {
            errorMessage = 'Rate limit exceeded. Please try again later.';
          }
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const emailResult = JSON.parse(responseText);
      console.log('Email sent successfully:', emailResult);
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      console.error('Fetch error type:', fetchError.name);
      console.error('Fetch error message:', fetchError.message);
      throw fetchError;
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      id: emailResult.id
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Determine the error type and provide specific response
    let statusCode = 500;
    let errorMessage = 'Failed to send email';
    
    if (error.message?.includes('RESEND_API_KEY')) {
      errorMessage = 'Email service not configured';
    } else if (error.message?.includes('Invalid authentication')) {
      statusCode = 401;
      errorMessage = 'Invalid authentication';
    } else if (error.message?.includes('Missing required fields')) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({
      error: errorMessage,
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});