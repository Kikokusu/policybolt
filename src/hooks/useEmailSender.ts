import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface EmailData {
  type: 'contact' | 'support';
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
}

export function useEmailSender() {
  const [loading, setLoading] = useState(false);

  const sendEmail = async (emailData: EmailData) => {
    setLoading(true);

    try {
      // Validate environment variable
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      // Get auth token for support requests
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add Supabase anon key if available
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (anonKey) {
        headers['apikey'] = anonKey;
      }

      if (emailData.type === 'support') {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Authentication required for support requests');
        }
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Construct the Edge Function URL
      const functionUrl = `${supabaseUrl}/functions/v1/send-email`;
      console.log('Sending email to:', functionUrl);
      console.log('Email data:', emailData);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(emailData),
      });

      // Log response details for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Read response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}`);
      }

      console.log('Parsed response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to send email (${response.status})`);
      }
      
      if (emailData.type === 'support') {
        toast.success('Support request sent successfully! We\'ll get back to you within 24 hours.');
      } else {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
      }

      return { success: true, data: responseData };
    } catch (error: any) {
      console.error('Error sending email:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send email. Please try again.';
      
      if (error.message.includes('Supabase URL not configured')) {
        errorMessage = 'Email service is not properly configured.';
      } else if (error.message.includes('Authentication required')) {
        errorMessage = 'Please log in to send support requests.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendEmail,
    loading,
  };
}