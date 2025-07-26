import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Shield, Database, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GDPRCompliance() {
  // Set page title and meta description for SEO
  React.useEffect(() => {
    document.title = "GDPR Compliance - Sofeia AI Content Generator | Data Rights & Privacy";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'GDPR Compliance: Your data rights with Sofeia AI. Request data deletion, access your information, and understand how we protect your privacy under EU regulations.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-4">GDPR Compliance</h1>
          <p className="text-lg text-muted-foreground">
            Your data rights and how we protect your privacy under EU regulations.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <CardTitle>Your Rights Under GDPR</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Right to Access (Article 15)</h3>
                <p className="text-sm text-muted-foreground">
                  You can request a copy of all personal data we hold about you, including your email address, usage history, and credit information.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Right to Rectification (Article 16)</h3>
                <p className="text-sm text-muted-foreground">
                  You can request correction of any inaccurate personal data we hold about you.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Right to Erasure (Article 17)</h3>
                <p className="text-sm text-muted-foreground">
                  You can request deletion of your personal data when there is no compelling reason for continued processing.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Right to Data Portability (Article 20)</h3>
                <p className="text-sm text-muted-foreground">
                  You can request your data in a structured, machine-readable format to transfer to another service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                <CardTitle>Data We Collect</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Email address (for account verification and communication)</li>
                <li>• Usage statistics (conversation history, credit usage)</li>
                <li>• Technical data (IP address, browser type for security)</li>
                <li>• Content generated through our AI services</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                We process this data under legitimate interest for service provision and user consent where required.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                <CardTitle>Data Sharing & AI Providers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                To provide our AI content generation service, we share your queries with:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Groq:</strong> For fast AI responses (US-based, GDPR compliant)</li>
                <li>• <strong>Perplexity:</strong> For research queries (US-based, privacy-focused)</li>
                <li>• <strong>Anthropic:</strong> For complex content (US-based, constitutional AI)</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                All providers have adequate data protection measures and do not retain your data beyond processing.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <CardTitle>Exercise Your Rights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                To exercise any of your GDPR rights, contact us through:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold mb-2">WhatsApp Support</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>+31 6 2807 3996</strong><br />
                    For immediate data requests and account deletion
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold mb-2">Community Support</h4>
                  <p className="text-sm text-muted-foreground">
                    <a href="https://www.facebook.com/groups/1079321647257618" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      ContentScale Facebook Group
                    </a><br />
                    For general questions about data handling
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Response Times</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  We will respond to your GDPR requests within 30 days as required by law. 
                  For urgent matters, WhatsApp support provides faster response times.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Account data: Retained while account is active + 1 year</li>
                <li>• Conversation history: 30 days after last activity</li>
                <li>• Email verification tokens: 24 hours or until used</li>
                <li>• Usage logs: 90 days for security and analytics</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                You can request earlier deletion at any time through our support channels.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            This page was last updated on January 26, 2025. 
            We may update our GDPR compliance measures to reflect changes in regulations.
          </p>
        </div>
      </div>
    </div>
  );
}