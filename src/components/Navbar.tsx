import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, LayoutDashboard, Moon, Sun } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? resolvedTheme || theme : "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              {" "}
              Blog Generator
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/generate" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setTheme(nextTheme)}
                  className="p-2"
                  title={`Switch to ${nextTheme} mode`}
                >
                  {currentTheme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
