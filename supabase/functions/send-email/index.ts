import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface EmailRequest {
  type: 'contact' | 'support';
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { type, name, email, subject, message, company }: EmailRequest = await req.json();

    // Validate required fields
    if (!type || !name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // For support requests, verify user is authenticated
    if (type === 'support') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authentication required for support requests' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
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

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'policybolt@vcorrea.com',
        to: ['vitorcorreadev@gmail.com', 'pamteck@gmail.com', 'ftnlabiola@gmail.com', 'ross.hughey@kikokusu.com'],
        subject: emailSubject,
        html: emailHtml,
        reply_to: email,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Resend API error:', errorData);
      throw new Error('Failed to send email');
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        id: emailResult.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Email sending error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});