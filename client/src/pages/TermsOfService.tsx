import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, FileText, Users, CreditCard, AlertTriangle } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Sofeia AI
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
              <p className="text-gray-600 dark:text-gray-300">Last updated: January 26, 2025</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms of Service ("Terms") govern your use of Sofeia AI, an AI-powered content generation and optimization platform operated by ContentScale ("Company," "we," "our," or "us").
              </p>
              <p>
                By accessing or using Sofeia AI, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Sofeia AI provides AI-powered content generation services featuring:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Multi-provider AI routing (Groq, Perplexity, Anthropic)</li>
                <li>• C.R.A.F.T framework content optimization</li>
                <li>• SEO research and E-E-A-T optimization</li>
                <li>• Credit-based usage system</li>
                <li>• Real-time content generation and analysis</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Account Creation</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• You must provide accurate and complete information</li>
                  <li>• Email verification is required for account activation</li>
                  <li>• Each user receives 3 free credits upon registration</li>
                  <li>• One account per person or entity</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Account Security</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• You are responsible for maintaining account security</li>
                  <li>• Notify us immediately of any unauthorized access</li>
                  <li>• Do not share your account credentials</li>
                  <li>• We may suspend accounts showing suspicious activity</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Credit System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Credit System and Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Credit Usage</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Each AI query consumes 1 credit</li>
                  <li>• Credits expire at the end of each month</li>
                  <li>• No rollover to the following month</li>
                  <li>• Free credits cannot be transferred or refunded</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Pricing Tiers</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• 150 Credits: €35 (€0.23 per credit)</li>
                    <li>• 1500 Credits: €300 (€0.20 per credit) - Popular</li>
                    <li>• 5000 Credits: €899 (€0.18 per credit) - Best Value</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Payment Terms</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• All payments are processed securely</li>
                  <li>• Credits are added immediately upon payment</li>
                  <li>• Refunds subject to our refund policy</li>
                  <li>• Contact support for billing inquiries</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Prohibited Uses</h3>
                <p className="mb-3">You may not use Sofeia AI for:</p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Generating harmful, illegal, or offensive content</li>
                  <li>• Creating misleading or false information</li>
                  <li>• Violating intellectual property rights</li>
                  <li>• Attempting to reverse engineer our systems</li>
                  <li>• Excessive automated requests or abuse</li>
                  <li>• Circumventing credit limitations or restrictions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Content Guidelines</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Generated content is for your use and responsibility</li>
                  <li>• Verify accuracy before publishing AI-generated content</li>
                  <li>• Respect copyright and attribution requirements</li>
                  <li>• Comply with applicable laws and regulations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Your Content</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You retain ownership of content you input into Sofeia AI. You grant us a limited license to process your inputs to provide our services.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Generated Content</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  AI-generated content is provided to you for your use. You are responsible for ensuring generated content complies with applicable laws and doesn't infringe third-party rights.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Our Platform</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Sofeia AI platform, including software, design, and content, is protected by copyright and other intellectual property laws.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle>Disclaimers and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Service Availability</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Services provided "as is" without warranties</li>
                  <li>• We don't guarantee 100% uptime or availability</li>
                  <li>• AI responses may not always be accurate or complete</li>
                  <li>• Third-party AI providers may experience outages</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Limitation of Liability</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our liability is limited to the amount you paid for credits in the preceding 12 months. We are not liable for indirect, incidental, or consequential damages.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support and Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Support and Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                For support, questions, or concerns about these Terms:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <p><strong>WhatsApp Support:</strong> +31 6 2807 3996</p>
                <p><strong>Facebook Community:</strong> <a href="https://www.facebook.com/groups/1079321647257618" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ContentScale Facebook Group</a></p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li>• You may terminate your account at any time</li>
                <li>• We may suspend or terminate accounts for violations</li>
                <li>• Unused credits are forfeited upon termination</li>
                <li>• Certain provisions survive termination (intellectual property, limitations)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                We reserve the right to modify these Terms at any time. Material changes will be communicated through our platform or via email. Continued use after changes constitutes acceptance of the updated Terms.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}