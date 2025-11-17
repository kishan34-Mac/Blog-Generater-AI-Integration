import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Powered by Advanced LLM</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in">
            Generate SEO-Optimized
            <span className="block gradient-text mt-2">Blog Content in Seconds</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Create professional, engaging blog posts with AI. Choose your topic, select a tone, 
            and watch as our AI crafts perfectly optimized content for your audience.
          </p>

          <div className="flex gap-4 justify-center animate-fade-in">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8">
              <Link to={user ? "/generate" : "/auth"}>
                <Sparkles className="w-5 h-5 mr-2" />
                Start Generating
              </Link>
            </Button>
            {!user && (
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Generate complete blog posts in seconds with real-time streaming. 
                Watch your content come to life instantly.
              </p>
            </div>

            <div className="glass-card p-8 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">SEO Optimized</h3>
              <p className="text-muted-foreground">
                Every blog includes meta descriptions, keywords, and structured content 
                designed to rank well in search engines.
              </p>
            </div>

            <div className="glass-card p-8 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Multiple Tones</h3>
              <p className="text-muted-foreground">
                Choose from professional, casual, informative, creative, or persuasive 
                tones to match your brand voice perfectly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card p-12 text-center">
            <h2 className="text-4xl font-bold mb-4 gradient-text">
              Ready to Transform Your Content?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of creators using AI to produce high-quality blog content
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8">
              <Link to={user ? "/generate" : "/auth"}>
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Free
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
