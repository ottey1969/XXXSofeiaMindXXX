import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Cookie, Settings, Globe, BarChart } from "lucide-react";

export default function CookiePolicy() {
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
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cookie Policy</h1>
              <p className="text-gray-600 dark:text-gray-300">Last updated: January 26, 2025</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>What Are Cookies?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Cookies are small text files that are stored on your device when you visit Sofeia AI. They help us provide you with a better experience by remembering your preferences and improving our services.
              </p>
              <p>
                This Cookie Policy explains what cookies we use, why we use them, and how you can manage your cookie preferences.
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Essential Cookies
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  These cookies are necessary for the website to function properly and cannot be disabled.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• <strong>Authentication:</strong> Keep you logged in during your session</li>
                  <li>• <strong>Security:</strong> Protect against cross-site request forgery</li>
                  <li>• <strong>Session Management:</strong> Remember your current conversation and credits</li>
                  <li>• <strong>Preferences:</strong> Store your theme and language settings</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  Analytics Cookies
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  These cookies help us understand how you use our service to improve performance.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• <strong>Usage Analytics:</strong> Track feature usage and user interactions</li>
                  <li>• <strong>Performance Monitoring:</strong> Identify and fix technical issues</li>
                  <li>• <strong>Error Tracking:</strong> Monitor and resolve service problems</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Third-Party Cookies
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Our AI providers and development platform may set their own cookies.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• <strong>Replit Platform:</strong> Development and hosting infrastructure</li>
                  <li>• <strong>AI Providers:</strong> Groq, Perplexity, and Anthropic for service delivery</li>
                  <li>• <strong>Payment Processors:</strong> Secure payment processing</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Why We Use Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Why We Use Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li>• <strong>User Experience:</strong> Provide personalized and seamless interactions</li>
                <li>• <strong>Security:</strong> Protect your account and prevent unauthorized access</li>
                <li>• <strong>Performance:</strong> Optimize loading times and service reliability</li>
                <li>• <strong>Analytics:</strong> Understand usage patterns to improve our services</li>
                <li>• <strong>Support:</strong> Help diagnose technical issues and provide assistance</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookie Management */}
          <Card>
            <CardHeader>
              <CardTitle>Managing Your Cookie Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Browser Settings</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  You can control cookies through your browser settings:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• <strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                  <li>• <strong>Firefox:</strong> Preferences → Privacy & Security → Cookies</li>
                  <li>• <strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li>• <strong>Edge:</strong> Settings → Site permissions → Cookies</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important Note</h4>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Disabling essential cookies may prevent Sofeia AI from functioning properly. You may experience issues with login, credit tracking, and conversation management.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Cookie Categories</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Essential Cookies</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Required for basic functionality</p>
                    </div>
                    <span className="text-sm text-gray-500">Always Active</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Analytics Cookies</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Help improve our services</p>
                    </div>
                    <span className="text-sm text-blue-600">Manageable via browser</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>Cookie Retention Periods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Session Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Deleted when you close your browser
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Persistent Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Stored for up to 12 months
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Authentication</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      7 days or until logout
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Preferences</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      12 months or until changed
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Cookie Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our service integrates with third-party providers who may set their own cookies:
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium">Replit Development Platform</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Used for hosting and development. Review their privacy policy for cookie practices.
                  </p>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium">AI Service Providers</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Groq, Perplexity, and Anthropic may use cookies for service delivery and analytics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                We may update this Cookie Policy periodically to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on this page.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Your continued use of Sofeia AI after any changes constitutes acceptance of the updated Cookie Policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Questions About Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have questions about our use of cookies or this policy:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <p><strong>WhatsApp Support:</strong> +31 6 2807 3996</p>
                <p><strong>Facebook Community:</strong> <a href="https://www.facebook.com/groups/1079321647257618" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ContentScale Facebook Group</a></p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For cookie-related questions, please include "Cookie Policy" in your message subject.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}