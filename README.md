# PolicyBolt

AI-powered privacy policy management platform that automatically generates and maintains privacy policies for developers and startups.

## 🚀 Current Status

PolicyBolt is a functional SaaS application with user authentication, subscription management, project creation, and AI-powered privacy policy generation. Users can sign up, create projects, and generate privacy policies through an integrated n8n automation workflow.

## 📋 Current Features

### ✅ **Authentication & User Management**
- User registration with email confirmation
- Secure login/logout with Supabase Auth
- Profile management (edit name, email, password)
- Password strength requirements and validation

### ✅ **Subscription Management**
- Three-tier pricing plans (Solo Developer, Growing Startup, Enterprise)
- 14-day free trial (no credit card required)
- Plan selection and subscription tracking
- Project limits based on subscription tier

### ✅ **Project Management**
- Multi-step project creation wizard with:
  - Project name and purpose (Website, Mobile App, SaaS Platform)
  - English spelling preference (US/UK)
  - User geography and compliance regions
  - AI services configuration
  - Hosting provider details
  - GitHub repository connection
- Project configuration stored as JSON
- Project status tracking and management

### ✅ **Privacy Policy Generation**
- AI-powered policy generation via n8n + GPT-4o integration
- Manual policy generation trigger
- Policy versioning and status tracking
- Policy approval workflow (pending_review → active)
- Policy content management and viewing

### ✅ **Policy Distribution**
- Download policies as Markdown files
- Embeddable widget for websites
- Auto-updating embed code (no need to change code when policies update)
- Public policy viewing via embed URLs

### ✅ **Dashboard & Analytics**
- Personal dashboard with project overview
- Policy update tracking and counters
- Subscription status and trial information
- Project and policy management interfaces

## 🗄️ Database Schema (Supabase)

### **`plans`**
Stores available subscription plans and their features.
```sql
- id (uuid, primary key)
- name (text) - Plan name (e.g., "Solo Developer")
- description (text) - Plan description
- price (numeric) - Monthly price in USD
- max_projects (integer) - Maximum projects allowed
- features (jsonb) - Array of plan features
- is_active (boolean) - Whether plan is available for selection
- created_at, updated_at (timestamptz)
```

### **`user_subscriptions`**
Tracks user subscription status and trial information.
```sql
- id (uuid, primary key)
- user_id (uuid) - References auth.users
- plan_id (uuid) - References plans table
- status (text) - 'trial', 'active', 'cancelled', 'expired'
- trial_ends_at (timestamptz) - When trial expires
- created_at, updated_at (timestamptz)
- UNIQUE constraint on user_id (one subscription per user)
```

### **`projects`**
Stores user projects and their configuration.
```sql
- id (uuid, primary key)
- user_id (uuid) - References auth.users
- name (text) - Project name
- repository_url (text, nullable) - GitHub repository URL
- status (text) - 'active', 'inactive', 'error'
- github_synced (boolean) - Whether GitHub is connected
- config (jsonb) - Project wizard configuration (purpose, geography, AI settings, etc.)
- last_scan_at (timestamptz, nullable) - Last repository scan timestamp
- created_at, updated_at (timestamptz)
```

### **`policies`**
Stores generated privacy policies with versioning and approval workflow.
```sql
- id (uuid, primary key)
- user_id (uuid) - References auth.users
- project_id (uuid) - References projects table
- title (text) - Policy title
- content (text) - Full policy content
- version (text) - Version number (e.g., "1.0", "1.1")
- status (text) - 'inactive', 'active', 'pending_review'
- approved_at (timestamptz, nullable) - When policy was approved
- created_at, updated_at (timestamptz)
```

### **`policy_updates`**
Tracks policy update frequency per project.
```sql
- id (uuid, primary key)
- user_id (uuid) - References auth.users
- project_id (uuid) - References projects table
- update_count (integer) - Number of policy updates
- last_update_at (timestamptz, nullable) - Last update timestamp
- created_at, updated_at (timestamptz)
- UNIQUE constraint on (user_id, project_id)
```

## 🔄 Current Workflow

### **User Onboarding**
1. User signs up and receives email confirmation
2. User selects a subscription plan (starts 14-day trial)
3. User accesses dashboard and can create projects

### **Project Creation**
1. User goes through 6-step project wizard
2. Configuration stored in `projects.config` as JSON
3. Optional GitHub repository connection
4. Project created with 'active' status

### **Policy Generation (via n8n)**
1. User manually triggers policy generation OR
2. GitHub webhook triggers automation (when implemented)
3. n8n workflow:
   - Receives webhook with project details
   - Reads repository (if connected)
   - Generates policy using GPT-4o
   - Saves policy with 'pending_review' status
4. User reviews and approves policy
5. Policy status changes to 'active'

### **Policy Distribution**
1. User can download active policies as Markdown
2. User can get embed code for website integration
3. Embed widget automatically shows latest active 

### ** Payment Integration**
- **Stripe Integration**: Complete payment processing for plan subscriptions
- **Subscription Management**: Allow users to upgrade/downgrade plans
- **Cancellation Flow**: Implement cancellation with retention offers (50% discount for 3 months)
- **Billing Dashboard**: Invoice history, payment methods, billing cycles

## 🚧 Pending Work

### **🔴 High Priority - GitHub Integration**
- **GitHub OAuth/App**: Authenticate and connect repositories
- **Webhook Setup**: Automatic webhook creation for connected repos
- **Push Detection**: Trigger policy generation on code changes
- **Repository Analysis**: Enhanced code scanning for privacy-relevant changes

### **🟡 Medium Priority - Enhanced Features**
- **Policy Diff Viewer**: Show changes between policy versions
- **Email Notifications**: Notify users of policy updates and approvals
- **Team Collaboration**: Multi-user access for Growing Startup+ plans
- **Custom Templates**: Allow users to customize policy templates
- **API Access**: REST API for programmatic policy management

### **🟢 Low Priority - User Experience**
- **Onboarding Tour**: Guided tour for new users
- **Policy Preview**: Live preview during project setup
- **Bulk Operations**: Manage multiple projects/policies at once
- **Advanced Analytics**: Policy update trends, compliance tracking

### **🟢 Low Priority - Advanced Features**
- **White-label Solutions**: Custom branding for Enterprise plans
- **Legal Review Service**: Professional legal review option
- **Compliance Monitoring**: Automated compliance checking
- **Integration Marketplace**: Connect with other legal/compliance tools

## 🛠️ Technical Stack

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: n8n + OpenAI GPT-4o
- **Deployment**: Ready for Netlify/Vercel
- **State Management**: React hooks + custom hooks

## 🔧 Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (Supabase keys)
4. Run development server: `npm run dev`
5. Set up Supabase database using provided migrations

## 📝 Environment Variables Required

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
```

**Note**: The `RESEND_API_KEY` must also be configured in your Supabase project's Edge Functions environment variables for the `send-email` function to work properly.

## 🚀 Deployment

The application is ready for deployment to any static hosting provider. Build with `npm run build` and deploy the `dist` folder.

---

**Note**: This is a functional MVP with core features implemented. The pending work items represent the roadmap for turning this into a complete commercial SaaS product.