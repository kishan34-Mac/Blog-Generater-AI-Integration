import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Calendar, Tag, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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

export default function Dashboard() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchBlogs();
  }, [user]);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error: any) {
      console.error('Error fetching blogs:', error);
      toast({
        title: "Failed to load blogs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBlogs(blogs.filter(blog => blog.id !== id));
      toast({
        title: "Blog deleted",
        description: "The blog has been removed from your dashboard",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete blog",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading your blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-12 animate-fade-in">
          <div>
            <h1 className="text-5xl font-bold mb-4 gradient-text">Your Blogs</h1>
            <p className="text-xl text-muted-foreground">
              {blogs.length} {blogs.length === 1 ? 'blog' : 'blogs'} generated
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Link to="/generate" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate New
            </Link>
          </Button>
        </div>

        {blogs.length === 0 ? (
          <Card className="glass-card text-center py-12">
            <CardContent>
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No blogs yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first AI-generated blog to get started
              </p>
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link to="/generate">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Your First Blog
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Card key={blog.id} className="glass-card hover-lift group">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {blog.meta_description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {blog.keywords?.slice(0, 3).map((keyword, i) => (
                      <span key={i} className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {keyword}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(blog.created_at), 'MMM d, yyyy')}
                    </span>
                    <span className="capitalize px-2 py-1 rounded-full bg-accent/20 text-accent text-xs">
                      {blog.tone}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link to={`/blog/${blog.id}`} className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteBlog(blog.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}