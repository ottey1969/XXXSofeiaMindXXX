import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AuthDialog from "@/components/auth/AuthDialog";
import { Bot, Sparkles, Globe, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false);

  // Set dynamic meta tags for enhanced SEO
  useEffect(() => {
    // Add hreflang for international SEO
    const hrefLang = document.createElement('link');
    hrefLang.setAttribute('rel', 'alternate');
    hrefLang.setAttribute('hreflang', 'en');
    hrefLang.setAttribute('href', 'https://sofeia-ai.replit.app/');
    document.head.appendChild(hrefLang);

    // Add preconnect for performance
    const preconnect = document.createElement('link');
    preconnect.setAttribute('rel', 'preconnect');
    preconnect.setAttribute('href', 'https://api.groq.com');
    document.head.appendChild(preconnect);

    // Clean up
    return () => {
      document.head.removeChild(hrefLang);
      document.head.removeChild(preconnect);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Bot className="h-12 w-12 text-primary" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Sofeia AI
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Free AI SEO content generator by ContentScale. Outperforms BrandWell & Content at Scale with advanced C.R.A.F.T optimization and multi-AI routing for superior content creation.
            </p>
            
            {/* Special Offer Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg mb-6 mx-auto max-w-2xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-bold text-lg">🎁 SPECIAL OFFER - Limited Time!</span>
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-center">
                <strong>Receive 3 FREE credits every 2 days</strong> + <strong>BONUS 3 extra credits every 2 days that expire every 14 days!</strong>
              </p>
              <p className="text-center text-sm mt-1 opacity-90">
                Use it or lose it: All bonus credits expire every 14 days to encourage active usage
              </p>
            </div>

            <Button 
              size="lg" 
              onClick={() => setAuthOpen(true)}
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              aria-label="Start using AI content generator with special offer"
            >
              Get Free AI Content Generator - Start Now!
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Sparkles className="h-8 w-8 text-primary mb-2" />
                <CardTitle>C.R.A.F.T SEO Framework</CardTitle>
                <CardDescription>
                  Advanced content optimization with RankMath SEO principles. Achieve 100/100 SEO scores with keyword density, E-A-T optimization, and schema markup integration.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Multi-AI Provider Routing</CardTitle>
                <CardDescription>
                  Intelligent AI routing: Groq for fast responses, Perplexity for research queries, Anthropic Claude for complex content. Better than single-provider solutions.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Ready-to-Use HTML Output</CardTitle>
                <CardDescription>
                  Copy-paste ready HTML with proper h1, h2, h3 structure, tables, lists, and semantic markup. No editing required - publish immediately.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Competitive Advantages */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Sofeia AI vs BrandWell vs Content at Scale</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardHeader>
                  <CardTitle className="text-green-800 dark:text-green-200">✓ Sofeia AI by ContentScale</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Multi-AI provider routing (Groq + Perplexity + Claude)</li>
                    <li>• Free 3 credits to start (no payment required)</li>
                    <li>• Ready-to-use HTML output with proper markup</li>
                    <li>• Advanced C.R.A.F.T SEO framework</li>
                    <li>• RankMath SEO integration built-in</li>
                    <li>• Real-time AI query optimization</li>
                    <li>• Schema markup automatically included</li>
                    <li>• Superior content quality & user experience</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardHeader>
                  <CardTitle className="text-red-800 dark:text-red-200">✗ BrandWell & Content at Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Single AI provider (limited capability)</li>
                    <li>• Expensive pricing ($249+/month)</li>
                    <li>• Basic content optimization</li>
                    <li>• Limited HTML formatting options</li>
                    <li>• No free trial or credits</li>
                    <li>• Generic SEO approach</li>
                    <li>• Complex enterprise-focused interface</li>
                    <li>• Lower content quality & user satisfaction</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How it Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8">How Sofeia AI Works</h2>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold">Ask Your Question</h3>
                <p className="text-sm text-muted-foreground">Type any question or content request</p>
              </div>
              <div className="space-y-2">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">Smart routing to the best AI provider</p>
              </div>
              <div className="space-y-2">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold">SEO Optimization</h3>
                <p className="text-sm text-muted-foreground">C.R.A.F.T framework applies RankMath principles</p>
              </div>
              <div className="space-y-2">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">4</span>
                </div>
                <h3 className="font-semibold">Copy & Paste</h3>
                <p className="text-sm text-muted-foreground">Get ready-to-use HTML content</p>
              </div>
            </div>
          </div>

          {/* Credits & Contact */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Simple Credit System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Start with 3 free credits. Each question uses 1 credit.
              </p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  Need more credits? Contact us on{" "}
                  <a 
                    href="https://wa.me/31628073996?text=Hi%2C%20I%20need%20more%20credits%20for%20Sofeia%20AI" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    WhatsApp: +31 6 2807 3996
                  </a>
                </p>
                <p>
                  Join our community:{" "}
                  <a 
                    href="https://www.facebook.com/groups/1079321647257618" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    ContentScale Facebook Group
                  </a>
                </p>
              </div>
              <Button 
                onClick={() => setAuthOpen(true)}
                className="w-full"
              >
                Get Started Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-semibold">Sofeia AI</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">
                Cookie Policy
              </Link>
              <Link href="/gdpr" className="hover:text-primary transition-colors">
                GDPR Rights
              </Link>
              <a 
                href="https://wa.me/31628073996" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Support
              </a>
            </div>
          </div>
          <div className="text-center mt-4 text-sm text-muted-foreground">
            © 2025 Sofeia AI. All rights reserved.
          </div>
        </div>
      </footer>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}