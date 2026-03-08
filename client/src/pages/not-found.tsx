import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="max-w-md text-center p-8 bg-card rounded-2xl shadow-xl border border-border">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-2">404 Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist.
        </p>
        <Link href="/">
          <Button size="lg" className="w-full rounded-xl" data-testid="link-home">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
