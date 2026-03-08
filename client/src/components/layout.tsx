import { ReactNode } from "react";
import { Box } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-border/40 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Inventory<span className="text-primary">Calc</span>
              </h1>
              <p className="text-xs text-muted-foreground font-medium hidden sm:block">
                Warehouse Coordinate System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {/* Header Actions if needed */}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>System Capacity: 52 Racks × 20 Shelves × 4 Trays × 15 Bins × 5 Items = 312,000 Total Locations</p>
        </div>
      </footer>
    </div>
  );
}
