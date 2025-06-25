export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  max_projects: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StripeCustomer {
  id: number;
  user_id: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface StripeSubscription {
  id: number;
  customer_id: string;
  subscription_id: string | null;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
  status: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface StripeUserSubscription {
  customer_id: string | null;
  subscription_id: string | null;
  subscription_status: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused' | null;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  repository_url: string | null;
  status: 'active' | 'inactive' | 'error';
  github_synced: boolean;
  github_installation_id: string | null;
  config: any | null;
  last_scan_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PolicyUpdate {
  id: string;
  user_id: string;
  project_id: string;
  update_count: number;
  last_update_at: string | null;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface Policy {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  content: string;
  version: string;
  status: 'inactive' | 'active' | 'pending_review';
  created_at: string;
  approved_at: string | null;
  updated_at: string;
  project?: Project;
}

export interface Database {
  public: {
    Tables: {
      plans: {
        Row: Plan;
        Insert: Omit<Plan, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Plan, 'id' | 'created_at' | 'updated_at'>>;
      };
      stripe_customers: {
        Row: StripeCustomer;
        Insert: Omit<StripeCustomer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<StripeCustomer, 'id' | 'created_at' | 'updated_at'>>;
      };
      stripe_subscriptions: {
        Row: StripeSubscription;
        Insert: Omit<StripeSubscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<StripeSubscription, 'id' | 'created_at' | 'updated_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
      };
      policy_updates: {
        Row: PolicyUpdate;
        Insert: Omit<PolicyUpdate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PolicyUpdate, 'id' | 'created_at' | 'updated_at'>>;
      };
      policies: {
        Row: Policy;
        Insert: Omit<Policy, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Policy, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      stripe_user_subscriptions: {
        Row: StripeUserSubscription;
      };
    };
    Functions: {
      increment_policy_update_counter: {
        Args: {
          p_user_id: string;
          p_project_id: string;
        };
        Returns: void;
      };
      approve_policy: {
        Args: {
          policy_id: string;
        };
        Returns: void;
      };
    };
  };
}