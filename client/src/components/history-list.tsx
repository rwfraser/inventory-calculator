import { useHistory, useClearHistory } from "@/hooks/use-history";
import { Button } from "@/components/ui/button";
import { Trash2, History, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export function HistoryList() {
  const { data: history, isLoading } = useHistory();
  const { mutate: clearHistory, isPending: isClearing } = useClearHistory();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <History className="w-4 h-4 text-primary" />
          <h3>Calculation History</h3>
        </div>
        {history && history.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => clearHistory()}
            disabled={isClearing}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {!history || history.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-sm">No calculations yet.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card border border-border/50 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase bg-secondary px-2 py-0.5 rounded-full">
                      {item.operation}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {item.createdAt ? format(new Date(item.createdAt), 'HH:mm:ss') : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 text-sm font-mono">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-medium truncate text-foreground">{item.input1}</span>
                      <span className="text-muted-foreground px-1">
                        {item.operation === 'Difference' ? '↔' : item.operation === 'Subtract' ? '-' : '+'}
                      </span>
                      <span className="text-muted-foreground truncate">{item.input2}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="font-bold text-primary shrink-0">{item.result}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
