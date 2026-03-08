import { useState } from "react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCreateHistory } from "@/hooks/use-history";
import { HistoryList } from "@/components/history-list";
import { CoordinateDisplay } from "@/components/coordinate-display";
import { parseCoordinate, toLinear, fromLinear, validateCoordinateFormat, formatCoordinate } from "@/lib/inventory-math";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, ArrowLeftRight, Calculator, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function CalculatorPage() {
  const [baseCoord, setBaseCoord] = useState("");
  const [secondValue, setSecondValue] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"add" | "sub" | "diff">("add");

  const { toast } = useToast();
  const createHistory = useCreateHistory();

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    try {
      // 1. Validate Base Coord
      if (!validateCoordinateFormat(baseCoord)) {
        throw new Error("Invalid base coordinate format");
      }
      const baseObj = parseCoordinate(baseCoord);
      const baseLinear = toLinear(baseObj);

      let calcResult = "";
      let operationLabel = "";
      
      // 2. Perform Operation
      if (mode === "add" || mode === "sub") {
        const amount = parseInt(secondValue, 10);
        if (isNaN(amount) || amount <= 0) throw new Error("Please enter a valid positive number");
        
        const newLinear = mode === "add" 
          ? baseLinear + amount 
          : baseLinear - amount;
          
        const resObj = fromLinear(newLinear); // throws if out of bounds
        calcResult = `${resObj.rack}${String.fromCharCode(resObj.shelf+96)}${resObj.tray}${String.fromCharCode(resObj.bin+96)}${resObj.item}`;
        
        // Re-format specifically to match our nice letter conversion logic inside the lib
        // Actually, let's use the helper we made
        calcResult = formatCoordinate(resObj);
        
        operationLabel = mode === "add" ? "Add Items" : "Subtract Items";
      } else {
        // Difference Mode
        if (!validateCoordinateFormat(secondValue)) {
          throw new Error("Invalid second coordinate format");
        }
        const secondObj = parseCoordinate(secondValue);
        const secondLinear = toLinear(secondObj);
        const diff = Math.abs(baseLinear - secondLinear);
        calcResult = diff.toString();
        operationLabel = "Difference";
      }

      // 3. Set Result & Save History
      setResult(calcResult);
      createHistory.mutate({
        operation: operationLabel,
        input1: baseCoord,
        input2: secondValue,
        result: calcResult
      });

      toast({
        title: "Calculation Success",
        description: `Result: ${calcResult}`,
      });

    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: err.message,
      });
    }
  };

  const handleReset = () => {
    setBaseCoord("");
    setSecondValue("");
    setResult(null);
    setError(null);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-[calc(100vh-10rem)]">
        
        {/* Main Calculator Area */}
        <div className="lg:col-span-8 space-y-6">
          <GlassCard className="p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Calculator className="w-64 h-64" />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Input Section */}
                <div className="flex-1 space-y-6">
                  <div>
                    <Label className="text-muted-foreground font-semibold tracking-wide text-xs uppercase mb-2 block">
                      Starting Location
                    </Label>
                    <Input
                      value={baseCoord}
                      onChange={(e) => setBaseCoord(e.target.value)}
                      placeholder="e.g. Ad3n5"
                      className="text-2xl font-mono h-14 bg-background border-2 focus:border-primary/50"
                      maxLength={5}
                    />
                  </div>

                  <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
                      <TabsTrigger value="add" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> Add
                      </TabsTrigger>
                      <TabsTrigger value="sub" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Minus className="w-4 h-4 mr-2" /> Subtract
                      </TabsTrigger>
                      <TabsTrigger value="diff" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <ArrowLeftRight className="w-4 h-4 mr-2" /> Difference
                      </TabsTrigger>
                    </TabsList>

                    <motion.div
                      key={mode}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label className="text-muted-foreground font-semibold tracking-wide text-xs uppercase mb-2 block">
                        {mode === "diff" ? "Target Location" : "Quantity to Adjust"}
                      </Label>
                      <div className="flex gap-4">
                        <Input
                          type={mode === "diff" ? "text" : "number"}
                          value={secondValue}
                          onChange={(e) => setSecondValue(e.target.value)}
                          placeholder={mode === "diff" ? "e.g. Be1a1" : "Amount"}
                          maxLength={mode === "diff" ? 5 : 10}
                          className="text-xl font-mono h-12 bg-background border-2 flex-1"
                        />
                      </div>
                    </motion.div>
                  </Tabs>

                  <div className="pt-4 flex gap-3">
                    <Button 
                      size="lg" 
                      className="flex-1 text-lg h-12 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                      onClick={handleCalculate}
                      disabled={createHistory.isPending}
                    >
                      {createHistory.isPending ? "Calculating..." : "Calculate"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-12 w-12 rounded-xl"
                      onClick={handleReset}
                    >
                      <RefreshCw className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Visualization Section */}
                <div className="w-full md:w-80 shrink-0 space-y-6">
                  <CoordinateDisplay 
                    value={baseCoord} 
                    label="Current Coordinate" 
                  />
                  
                  {mode === "diff" && secondValue && (
                    <CoordinateDisplay 
                      value={secondValue} 
                      label="Target Coordinate" 
                      className="bg-slate-100 text-slate-900 border border-slate-200 shadow-none"
                    />
                  )}
                </div>
              </div>

              {/* Result Area */}
              <div className="mt-8 pt-8 border-t border-dashed border-border/60">
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    Calculation Result
                  </span>
                  
                  {result ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl md:text-6xl font-black text-primary font-mono tracking-tight drop-shadow-sm"
                    >
                      {result}
                    </motion.div>
                  ) : error ? (
                    <span className="text-xl font-medium text-destructive">{error}</span>
                  ) : (
                    <span className="text-3xl text-muted-foreground/30 font-mono">--</span>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar History */}
        <div className="lg:col-span-4 h-full min-h-[500px]">
          <HistoryList />
        </div>
      </div>
    </Layout>
  );
}
