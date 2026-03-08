import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, FileText } from "lucide-react";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  maxWidth?: "md" | "lg" | "xl" | "2xl" | "5xl" | "6xl";
}

export default function Layout({ children, title, maxWidth = "6xl" }: LayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const widthClass = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
  }[maxWidth];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card sticky top-0 z-50" data-testid="app-header">
        <div className={`${widthClass} mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-tight" data-testid="text-app-title">
                Tax Forms
              </span>
            </div>
            {title && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground" data-testid="text-page-title">{title}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              data-testid="button-toggle-theme"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            {user && (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline" data-testid="text-user-email">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={logout} data-testid="button-logout">
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={`${widthClass} mx-auto px-4 py-6 w-full flex-1`}>
        {children}
      </main>

      <footer className="border-t bg-card/50 py-3" data-testid="app-footer">
        <div className={`${widthClass} mx-auto px-4`}>
          <p className="text-xs text-muted-foreground text-center">
            Tax Forms &middot; 2023 Federal Tax Return Data Entry
          </p>
        </div>
      </footer>
    </div>
  );
}
