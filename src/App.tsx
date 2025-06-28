import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';
import { HomePage } from '@/pages/Home';
import { AboutPage } from '@/pages/About';
import { ContactPage } from '@/pages/Contact';
import { PrivacyPage } from '@/pages/Privacy';
import { LoginPage } from '@/pages/Login';
import { SignupPage } from '@/pages/Signup';
import { ConfirmEmailPage } from '@/pages/ConfirmEmail';
import { PlanSelectionPage } from '@/pages/PlanSelection';
import { SuccessPage } from '@/pages/Success';
import { DashboardPage } from '@/pages/Dashboard';
import { AddProjectPage } from '@/pages/AddProject';
import { ProjectsPage } from '@/pages/Projects';
import { PoliciesPage } from '@/pages/Policies';
import { PolicyEmbedPage } from '@/pages/PolicyEmbed';
import { SettingsPage } from '@/pages/Settings';
import { ProfilePage } from '@/pages/Profile';
import { GitHubCallback } from '@/components/GitHubCallback';
import { GitHubDebugInfo } from '@/components/GitHubDebugInfo';

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/legal/privacy" element={<PrivacyPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/confirm-email" element={<ConfirmEmailPage />} />
            <Route path="/select-plan" element={<PlanSelectionPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/projects/new" element={<AddProjectPage />} />
            <Route path="/dashboard/projects" element={<ProjectsPage />} />
            <Route path="/dashboard/policies" element={<PoliciesPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            
            {/* GitHub callback route */}
            <Route path="/github/callback" element={<GitHubCallback />} />
            
            {/* Debug route for development */}
            <Route path="/debug/github" element={<GitHubDebugInfo />} />
            
            {/* Embed routes - no authentication required */}
            <Route path="/embed/policy/:policyId" element={<PolicyEmbedPage />} />
            <Route path="/embed/project/:projectId/active-policy" element={<PolicyEmbedPage />} />
          </Routes>
        </Router>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;