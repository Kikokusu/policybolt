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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      const result = await response.json();
      
      if (emailData.type === 'support') {
        toast.success('Support request sent successfully! We\'ll get back to you within 24 hours.');
      } else {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
      }

      return { success: true, data: result };
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email. Please try again.');
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