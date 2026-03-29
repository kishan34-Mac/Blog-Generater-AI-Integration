import { useState } from "react";
// Not using Supabase database anymore - saving via our API
import { useAuth } from "@/contexts/AuthContext";
import { getApiBase, getResponseError } from "@/lib/utils";

interface GeneratedBlogData {
  title: string;
  meta_description: string;
  content: string;
  keywords?: string[];
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Download,
  Edit,
  Share2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export default function Generate() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [wordCount, setWordCount] = useState(800);
  const [generating, setGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlogData | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a blog topic",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setGeneratedBlog(null);

    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, tone, wordCount }),
      });

      if (!response.ok) {
        const errorText = await getResponseError(response);
        throw new Error(
          errorText || `Generate request failed: ${response.status}`,
        );
      }

      const data = await response.json();
      const blogData: GeneratedBlogData = {
        title: data.title || `Blog about ${topic}`,
        meta_description:
          data.meta_description || `Generated blog about ${topic}`,
        keywords: data.keywords || [],
        content: data.content || data.blog || "",
      };

      setGeneratedBlog(blogData);
      setEditedContent(blogData.content);

      const token = localStorage.getItem("bg_token");
      if (token) {
        const saveResponse = await fetch(`${apiBase}/api/blogs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            topic,
            tone,
            word_count: wordCount,
            title: blogData.title,
            meta_description: blogData.meta_description,
            content: blogData.content,
            keywords: blogData.keywords,
          }),
        });

        if (!saveResponse.ok) {
          const errorText = await getResponseError(saveResponse);
          throw new Error(errorText || "Failed to save generated blog");
        }
      }

      toast({
        title: "Blog generated!",
        description:
          token !== null
            ? "Your blog has been generated and saved."
            : "Your blog has been generated. Log in to save it.",
      });
    } catch (error: unknown) {
      console.error("Error generating blog:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate blog. Please try again.";
      toast({
        title: "Generation failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedBlog) return;

    const contentToUse = isEditing ? editedContent : generatedBlog.content;
    const textToCopy = `${generatedBlog.title}\n\n${generatedBlog.meta_description}\n\n${contentToUse}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Blog content copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!generatedBlog) return;

    const contentToUse = isEditing ? editedContent : generatedBlog.content;
    const content = `# ${generatedBlog.title}\n\n${generatedBlog.meta_description}\n\n${contentToUse}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generatedBlog.title
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Blog saved as markdown file",
    });
  };

  const handleEdit = () => {
    if (isEditing) {
      // Save the edited content
      setGeneratedBlog({ ...generatedBlog, content: editedContent });
      toast({
        title: "Saved!",
        description: "Your edits have been saved",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleShare = (platform: string) => {
    if (!generatedBlog) return;

    const url = window.location.href;
    const text = `Check out this blog: ${generatedBlog.title}`;

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text,
        )}&url=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url,
        )}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url,
        )}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 gradient-text">
            Generate Your Blog
          </h1>
          <p className="text-xl text-muted-foreground">
            AI-powered content creation in seconds
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Generation Form */}
          <Card className="glass-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Blog Settings
              </CardTitle>
              <CardDescription>
                Configure your blog post parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Blog Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., The Future of AI in Healthcare"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-background/50"
                  disabled={generating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Writing Tone</Label>
                <Select
                  value={tone}
                  onValueChange={setTone}
                  disabled={generating}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="informative">Informative</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Word Count</Label>
                  <span className="text-sm text-muted-foreground">
                    {wordCount} words
                  </span>
                </div>
                <Slider
                  value={[wordCount]}
                  onValueChange={([value]) => setWordCount(value)}
                  min={300}
                  max={2000}
                  step={100}
                  className="py-4"
                  disabled={generating}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 h-12"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Blog
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="glass-card border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>
                    Watch your blog come to life
                  </CardDescription>
                </div>
                {generatedBlog && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleEdit}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {isEditing ? "Save" : "Edit"}
                    </Button>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="bg-background/30 rounded-lg p-6 min-h-[400px]">
              {generating ? (
                <div className="prose prose-invert max-w-none">
                  <div className="text-sm text-muted-foreground">
                    Generating your blog. Please wait...
                  </div>
                </div>
              ) : generatedBlog ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-heading font-bold gradient-text">
                      {generatedBlog.title}
                    </h3>
                    <p className="text-sm text-foreground/80">
                      {generatedBlog.meta_description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {generatedBlog.keywords?.map(
                        (keyword: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary"
                          >
                            {keyword}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full min-h-[400px] p-4 bg-background/50 rounded-lg border border-border text-sm font-body text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div
                      className="prose prose-invert prose-sm max-w-none font-body
                      prose-headings:font-heading
                      prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-6
                      prose-h2:bg-gradient-to-r prose-h2:from-primary prose-h2:via-accent prose-h2:to-primary 
                      prose-h2:bg-clip-text prose-h2:text-transparent
                      prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-3 prose-h3:mt-4
                      prose-h3:text-accent
                      prose-p:text-foreground/80 prose-p:text-sm prose-p:mb-3
                      prose-strong:text-primary prose-strong:font-semibold prose-strong:bg-primary/10 prose-strong:px-1 prose-strong:rounded
                      prose-ul:text-sm prose-li:text-foreground/70 prose-li:mb-1"
                    >
                      <ReactMarkdown>{editedContent}</ReactMarkdown>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-border/50">
                    <Button
                      onClick={() => handleShare("twitter")}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      onClick={() => handleShare("linkedin")}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                    <Button
                      onClick={() => handleShare("facebook")}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                  </div>

                  <Button
                    onClick={() => navigate("/dashboard")}
                    variant="outline"
                    className="w-full"
                  >
                    View in Dashboard
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your generated blog will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
