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

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
  plan?: Plan;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  repository_url: string | null;
  status: 'active' | 'inactive' | 'error';
  github_synced: boolean;
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
      user_subscriptions: {
        Row: UserSubscription;
        Insert: Omit<UserSubscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSubscription, 'id' | 'created_at' | 'updated_at'>>;
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