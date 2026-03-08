import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Trash2, Loader2, ChevronRight } from "lucide-react";
import type { TaxReturn } from "@shared/schema";
import Layout from "@/components/layout";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: returns, isLoading } = useQuery<TaxReturn[]>({
    queryKey: ["/api/returns"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/returns", { taxYear: 2023 });
      return res.json();
    },
    onSuccess: (data: TaxReturn) => {
      queryClient.invalidateQueries({ queryKey: ["/api/returns"] });
      setLocation(`/returns/${data.id}`);
    },
    onError: () => {
      toast({ title: "Failed to create return", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/returns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/returns"] });
      toast({ title: "Return deleted" });
    },
  });

  return (
    <Layout maxWidth="5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-dashboard-heading">Tax Returns</h2>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-dashboard-subtitle">Manage your federal tax return filings</p>
        </div>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} data-testid="button-create-return">
          {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          New 2023 Return
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : returns?.length === 0 ? (
        <Card data-testid="empty-state">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tax returns yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create a new return to start entering your 2023 tax data.
            </p>
            <Button onClick={() => createMutation.mutate()} data-testid="button-create-return-empty">
              <Plus className="h-4 w-4 mr-2" /> Create 2023 Return
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {returns?.map((ret) => {
            const data = ret.returnData as any;
            const taxpayerName = data?.identity?.taxpayer?.name;
            const displayName = taxpayerName?.first_name
              ? `${taxpayerName.first_name} ${taxpayerName.last_name}`
              : "Not yet entered";
            const w2Count = data?.documents?.w2?.length || 0;

            return (
              <Card
                key={ret.id}
                className="cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => setLocation(`/returns/${ret.id}`)}
                data-testid={`card-return-${ret.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {ret.taxYear} Federal Tax Return
                        </CardTitle>
                        <CardDescription>
                          {displayName} &middot; {w2Count} W-2{w2Count !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={ret.status === "draft" ? "secondary" : "default"} data-testid={`badge-status-${ret.id}`}>
                        {ret.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this return?")) {
                            deleteMutation.mutate(ret.id);
                          }
                        }}
                        data-testid={`button-delete-return-${ret.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
