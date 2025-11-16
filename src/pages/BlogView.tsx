import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Calendar, Tag, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface Blog {
  id: string;
  topic: string;
  tone: string;
  title: string;
  meta_description: string;
  content: string;
  keywords: string[];
  created_at: string;
  word_count: number;
}

export default function BlogView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('blogs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          title: "Blog not found",
          description: "The requested blog doesn't exist",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }
      
      setBlog(data);
    } catch (error: any) {
      console.error('Error fetching blog:', error);
      toast({
        title: "Failed to load blog",
        description: error.message,
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!blog) return;
    
    const text = `${blog.title}\n\n${blog.meta_description}\n\n${blog.content}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Blog content copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsMarkdown = () => {
    if (!blog) return;

    const markdown = `# ${blog.title}\n\n**Meta Description:** ${blog.meta_description}\n\n**Keywords:** ${blog.keywords.join(', ')}\n\n---\n\n${blog.content}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blog.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Blog saved as Markdown file",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="glass-card">
          <CardContent className="p-8 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-5xl font-heading font-bold gradient-text leading-tight">{blog.title}</h1>
              <p className="text-xl text-foreground/80 font-body leading-relaxed">{blog.meta_description}</p>
              
              <div className="flex flex-wrap gap-2">
                {blog.keywords.map((keyword, i) => (
                  <span key={i} className="px-3 py-1 text-sm rounded-full bg-primary/20 text-primary flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(blog.created_at), 'MMMM d, yyyy')}
                </span>
                <span className="capitalize px-3 py-1 rounded-full bg-accent/20 text-accent">
                  {blog.tone}
                </span>
                <span>{blog.word_count} words</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                onClick={downloadAsMarkdown}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download MD
              </Button>
            </div>

            {/* Content */}
            <div className="pt-6 border-t border-border">
              <div className="prose prose-invert prose-lg max-w-none font-body
                prose-headings:font-heading
                prose-h2:text-4xl prose-h2:font-bold prose-h2:mb-6 prose-h2:mt-10 
                prose-h2:bg-gradient-to-r prose-h2:from-primary prose-h2:via-accent prose-h2:to-primary 
                prose-h2:bg-clip-text prose-h2:text-transparent
                prose-h2:leading-tight
                prose-h3:text-2xl prose-h3:font-semibold prose-h3:mb-4 prose-h3:mt-8
                prose-h3:text-accent
                prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                prose-strong:text-primary prose-strong:font-bold prose-strong:bg-primary/10 
                prose-strong:px-1 prose-strong:rounded
                prose-ul:my-6 prose-li:text-foreground/80 prose-li:mb-2
                prose-ol:my-6 prose-ol:text-foreground/80
                prose-blockquote:border-l-4 prose-blockquote:border-accent 
                prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground">
                <ReactMarkdown>{blog.content}</ReactMarkdown>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}