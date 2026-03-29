import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// Using custom backend API instead of Supabase
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { getApiBase, getResponseError } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Calendar, Tag, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem("bg_token");
        const res = await fetch(`${getApiBase()}/api/blogs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorText = await getResponseError(res);
          throw new Error(errorText || "Failed to fetch blogs");
        }
        const data = await res.json();
        const normalizedBlogs = (data.blogs || []).map((blog: any) => ({
          ...blog,
          id: blog.id || blog._id,
        }));
        setBlogs(normalizedBlogs);
      } catch (error: Error) {
        console.error("Error fetching blogs:", error);
        toast({
          title: "Failed to load blogs",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [user, toast]);

  const deleteBlog = async (id: string) => {
    try {
      const token = localStorage.getItem("bg_token");
      const res = await fetch(`${getApiBase()}/api/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorText = await getResponseError(res);
        throw new Error(errorText || "Failed to delete");
      }

      setBlogs(blogs.filter((blog) => blog.id !== id));
      toast({
        title: "Blog deleted",
        description: "The blog has been removed from your dashboard",
      });
    } catch (error: Error) {
      toast({
        title: "Failed to delete blog",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const totalWords = blogs.reduce((sum, blog) => sum + (blog.word_count || 0), 0);
  const tagsCount = new Set(blogs.flatMap((blog) => blog.keywords || [])).size;

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
    <div className="min-h-screen pt-24 pb-12 px-4 bg-slate-950/5">
      <div className="container mx-auto max-w-7xl">
        <div className="rounded-[2rem] bg-gradient-to-br from-violet-500 via-purple-500 to-sky-500 px-8 py-10 text-white shadow-2xl shadow-violet-200/30 mb-10 overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/70 mb-3">
                Dashboard Overview
              </p>
              <h1 className="text-5xl font-bold leading-tight">
                Welcome back, {user?.fullName || "Creator"}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/80">
                Your content hub is ready. Create, review, and manage your AI blogs from one polished workspace.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button
                onClick={signOut}
                variant="secondary"
                className="text-white border-white/30 hover:bg-white/10"
              >
                Sign Out
              </Button>
              <Button
                asChild
                className="bg-white text-slate-900 hover:bg-slate-100"
              >
                <Link to="/generate" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate New
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <div className="rounded-3xl border border-white/20 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500 mb-3">Total blogs</p>
            <h2 className="text-4xl font-semibold text-slate-900">{blogs.length}</h2>
            <p className="text-sm text-slate-500 mt-2">AI blogs created so far.</p>
          </div>
          <div className="rounded-3xl border border-white/20 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500 mb-3">Total words</p>
            <h2 className="text-4xl font-semibold text-slate-900">{totalWords}</h2>
            <p className="text-sm text-slate-500 mt-2">Words written across your collection.</p>
          </div>
          <div className="rounded-3xl border border-white/20 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500 mb-3">Unique tags</p>
            <h2 className="text-4xl font-semibold text-slate-900">{tagsCount}</h2>
            <p className="text-sm text-slate-500 mt-2">Different keyword bundles used.</p>
          </div>
        </div>

        {blogs.length === 0 ? (
          <Card className="glass-card text-center py-12 border border-slate-200 bg-white/90 shadow-xl shadow-slate-900/10">
            <CardContent>
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
              <h3 className="text-2xl font-semibold mb-2">No blogs yet</h3>
              <p className="text-slate-600 mb-6">
                Create your first AI-generated blog to get started.
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
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
              <Card
                key={blog.id}
                className="glass-card hover:-translate-y-1 transform transition duration-300 shadow-xl border border-slate-200"
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="line-clamp-2 text-slate-900">
                        {blog.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-slate-500">
                        {blog.meta_description}
                      </CardDescription>
                    </div>
                    <span className="rounded-2xl bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      {blog.word_count} words
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {blog.keywords?.slice(0, 3).map((keyword, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-xs rounded-full bg-violet-100 text-violet-700"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(blog.created_at), "MMM d, yyyy")}
                    </span>
                    <span className="capitalize px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                      {blog.tone}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button asChild variant="outline" className="flex-1">
                      <Link
                        to={`/blog/${blog.id}`}
                        className="flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteBlog(blog.id)}
                      className="border-destructive text-destructive hover:bg-destructive/10"
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
