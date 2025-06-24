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
      console.log('Sending email via Supabase Functions:', emailData);

      // Use Supabase client to invoke the function
      // This handles auth and CORS automatically
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData,
      });

      console.log('Function response:', { data, error });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send email');
      }
      
      if (emailData.type === 'support') {
        toast.success('Support request sent successfully! We\'ll get back to you within 24 hours.');
      } else {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error sending email:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send email. Please try again.';
      
      if (error.message?.includes('Authentication required')) {
        errorMessage = 'Please log in to send support requests.';
      } else if (error.message?.includes('JWT')) {
        errorMessage = 'Authentication error. Please try refreshing the page.';
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