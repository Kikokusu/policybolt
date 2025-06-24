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
      // Get auth token for support requests
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (emailData.type === 'support') {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify(emailData),
        mode: 'cors',
      });

      // Check if response is ok first
      if (!response.ok) {
        let errorMessage = 'Failed to send email';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        // If response is ok but not JSON, treat as success
        result = { success: true };
      }
      
      if (emailData.type === 'support') {
        toast.success('Support request sent successfully! We\'ll get back to you within 24 hours.');
      } else {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
      }

      return { success: true, data: result };
    } catch (error: any) {
      console.error('Error sending email:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send email. Please try again.';
      if (error.message) {
        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Configuration error. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendEmail,
    loading,
  };
}