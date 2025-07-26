import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Shield, Eye, Database, Lock } from "lucide-react";

export default function PrivacyPolicy() {
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
              <p className="text-gray-600 dark:text-gray-300">Last updated: January 26, 2025</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Sofeia AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered content generation platform.
              </p>
              <p>
                By using Sofeia AI, you agree to the collection and use of information in accordance with this policy.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Email address (for account creation and communication)</li>
                  <li>• Profile information (name, if provided)</li>
                  <li>• Payment information (processed securely by third-party providers)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Usage Information</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Content queries and AI-generated responses</li>
                  <li>• Usage patterns and feature interactions</li>
                  <li>• Credit usage and transaction history</li>
                  <li>• Device information and browser data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Technical Information</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• IP addresses and geolocation data</li>
                  <li>• Cookies and similar tracking technologies</li>
                  <li>• Log files and error reports</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li>• <strong>Service Delivery:</strong> Provide AI content generation and optimization services</li>
                <li>• <strong>Account Management:</strong> Create and maintain your user account</li>
                <li>• <strong>Communication:</strong> Send service updates, notifications, and support messages</li>
                <li>• <strong>Improvement:</strong> Analyze usage patterns to improve our services</li>
                <li>• <strong>Security:</strong> Protect against fraud, abuse, and security threats</li>
                <li>• <strong>Legal Compliance:</strong> Meet legal obligations and enforce our terms</li>
              </ul>
            </CardContent>
          </Card>

          {/* AI Providers and Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>AI Providers and Data Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Sofeia AI uses multiple AI providers to deliver optimal results:
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• <strong>Groq:</strong> Fast responses for simple queries</li>
                  <li>• <strong>Perplexity:</strong> Research-intensive queries with citations</li>
                  <li>• <strong>Anthropic (Claude):</strong> Complex content generation</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your queries may be processed by these third-party AI providers. We ensure all providers comply with data protection standards and do not retain your data beyond processing requirements.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Encryption in transit and at rest</li>
                <li>• Secure authentication systems</li>
                <li>• Regular security audits and updates</li>
                <li>• Access controls and monitoring</li>
                <li>• Secure data centers and infrastructure</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li>• <strong>Access:</strong> Request a copy of your personal data</li>
                <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
                <li>• <strong>Deletion:</strong> Request deletion of your personal data</li>
                <li>• <strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li>• <strong>Cookies:</strong> Manage cookie preferences through your browser</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have questions about this Privacy Policy or our data practices, contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <p><strong>WhatsApp Support:</strong> +31 6 2807 3996</p>
                <p><strong>Facebook Community:</strong> <a href="https://www.facebook.com/groups/1079321647257618" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ContentScale Facebook Group</a></p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For data protection requests, please contact us through WhatsApp with "Privacy Request" in your message.
              </p>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                We may update this Privacy Policy periodically. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of Sofeia AI after any changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}