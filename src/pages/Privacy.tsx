import { Navigation } from '@/components/shared/navigation';
import { Footer } from '@/components/shared/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Calendar, Mail } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6">
              <Shield className="w-3 h-3 mr-1" />
              Privacy Policy
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Your privacy is
              <br />
              <span className="gradient-text">our priority</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              This privacy policy explains how PolicyBolt collects, uses, and protects your information 
              when you use our AI-powered privacy policy management service.
            </p>
            <div className="flex items-center justify-center mt-6 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              Last updated: January 15, 2025
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            
            {/* Information We Collect */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">1. Information We Collect</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Account Information</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      When you create an account, we collect your name, email address, and company information. 
                      This information is necessary to provide you with access to our services and to communicate with you.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Repository Data</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      With your explicit consent, we access your GitHub repositories to analyze code changes 
                      and detect privacy-relevant modifications. We only read the code necessary for policy generation 
                      and do not store your source code on our servers.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Usage Data</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We collect information about how you use our service, including features accessed, 
                      time spent on the platform, and interaction patterns. This helps us improve our service 
                      and provide better user experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">2. How We Use Your Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <strong>Service Provision:</strong> To provide, maintain, and improve our AI-powered 
                      privacy policy generation and management services.
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <strong>Communication:</strong> To send you service-related notifications, updates, 
                      and respond to your inquiries.
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <strong>Analytics:</strong> To understand how our service is used and to improve 
                      our AI models and user experience.
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <strong>Legal Compliance:</strong> To comply with applicable laws, regulations, 
                      and legal processes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">3. Data Sharing and Disclosure</h2>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  We do not sell, trade, or otherwise transfer your personal information to third parties, 
                  except in the following limited circumstances:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <strong>Service Providers:</strong> We may share information with trusted third-party 
                      service providers who assist us in operating our service (e.g., cloud hosting, analytics).
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <strong>Legal Requirements:</strong> When required by law, court order, or government 
                      request, or to protect our rights and safety.
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <strong>Business Transfers:</strong> In connection with a merger, acquisition, 
                      or sale of assets, with appropriate notice to users.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">4. Data Security</h2>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  We implement industry-standard security measures to protect your information:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Technical Safeguards</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• End-to-end encryption</li>
                      <li>• Secure data transmission (TLS)</li>
                      <li>• Regular security audits</li>
                      <li>• Access controls and monitoring</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Operational Safeguards</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Employee training and background checks</li>
                      <li>• Principle of least privilege access</li>
                      <li>• Incident response procedures</li>
                      <li>• Regular backup and recovery testing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">5. Your Rights and Choices</h2>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <strong>Access:</strong> Request access to the personal information we hold about you.
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <strong>Correction:</strong> Request correction of inaccurate or incomplete information.
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <strong>Deletion:</strong> Request deletion of your personal information, subject to legal requirements.
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">6. Contact Us</h2>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  If you have any questions about this privacy policy or our data practices, 
                  please contact us:
                </p>

                <div className="flex items-center space-x-3 mb-4">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="font-medium">privacy@policybolt.com</span>
                </div>

                <p className="text-sm text-muted-foreground">
                  We will respond to your inquiry within 30 days of receipt.
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}