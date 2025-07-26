import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AuthDialog from "@/components/auth/AuthDialog";
import { Bot, Sparkles, Globe, MessageSquare } from "lucide-react";

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false);

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
              The world's most advanced autonomous content agent. Get SEO-optimized HTML content 
              ready for direct copy-paste, powered by multiple AI providers.
            </p>
            <Button 
              size="lg" 
              onClick={() => setAuthOpen(true)}
              className="text-lg px-8 py-6"
            >
              Start with 3 Free Credits
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card>
              <CardHeader>
                <Sparkles className="h-8 w-8 text-primary mb-2" />
                <CardTitle>C.R.A.F.T Framework</CardTitle>
                <CardDescription>
                  Enhanced content optimization with RankMath SEO principles for 100/100 scoring
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Multi-AI Routing</CardTitle>
                <CardDescription>
                  Intelligent routing between Groq, Perplexity, and Anthropic based on query complexity
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Real HTML Output</CardTitle>
                <CardDescription>
                  Get properly formatted HTML with h1, h2, h3 headings, lists, and tables for direct use
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* How it Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8">How It Works</h2>
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
              <p className="text-sm text-muted-foreground">
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

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}