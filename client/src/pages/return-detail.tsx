import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, User, FileText } from "lucide-react";
import type { TaxReturn } from "@shared/schema";
import type { ReturnData, W2Document } from "@shared/types/pipeline";
import { createEmptyIdentity } from "@shared/types/pipeline";
import W2Form from "@/components/w2-form";
import W2List from "@/components/w2-list";
import IdentityForm from "@/components/identity-form";
import Layout from "@/components/layout";

export default function ReturnDetailPage({ returnId }: { returnId: string }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const id = parseInt(returnId, 10);

  const [editingW2, setEditingW2] = useState<W2Document | null>(null);
  const [showW2Form, setShowW2Form] = useState(false);

  const { data: taxReturn, isLoading } = useQuery<TaxReturn>({
    queryKey: ["/api/returns", id],
  });

  const returnData = (taxReturn?.returnData as ReturnData) || null;
  const identity = returnData?.identity || createEmptyIdentity();
  const w2s = returnData?.documents?.w2 || [];

  const identityMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/returns/${id}/identity`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/returns", id] });
      toast({ title: "Taxpayer information saved" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    },
  });

  const addW2Mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/returns/${id}/w2`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/returns", id] });
      setShowW2Form(false);
      toast({ title: "W-2 added" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to save W-2", description: err.message, variant: "destructive" });
    },
  });

  const updateW2Mutation = useMutation({
    mutationFn: async ({ docId, data }: { docId: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/returns/${id}/w2/${docId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/returns", id] });
      setEditingW2(null);
      setShowW2Form(false);
      toast({ title: "W-2 updated" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update W-2", description: err.message, variant: "destructive" });
    },
  });

  const deleteW2Mutation = useMutation({
    mutationFn: async (docId: string) => {
      await apiRequest("DELETE", `/api/returns/${id}/w2/${docId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/returns", id] });
      toast({ title: "W-2 deleted" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to delete W-2", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!taxReturn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Return not found</p>
          <Button onClick={() => setLocation("/")} data-testid="link-back-dashboard">Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const taxpayerName = identity?.taxpayer?.name;
  const displayName = taxpayerName?.first_name
    ? `${taxpayerName.first_name} ${taxpayerName.last_name}`
    : "";
  const breadcrumbTitle = displayName
    ? `${taxReturn.taxYear} Return — ${displayName}`
    : `${taxReturn.taxYear} Return`;

  return (
    <Layout title={breadcrumbTitle}>
      <div className="mb-6" data-testid="return-detail-page">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/")}
          className="mb-3 -ml-2"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold" data-testid="text-return-title">
            {taxReturn.taxYear} Federal Tax Return
          </h2>
        </div>
        {displayName && (
          <p className="text-sm text-muted-foreground" data-testid="text-taxpayer-name">{displayName}</p>
        )}
      </div>

      <Tabs defaultValue="identity" className="space-y-4">
        <TabsList data-testid="tabs-return" className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="identity" data-testid="tab-identity" className="gap-2">
            <User className="h-4 w-4" />
            Taxpayer Info
          </TabsTrigger>
          <TabsTrigger value="w2" data-testid="tab-w2" className="gap-2">
            <FileText className="h-4 w-4" />
            W-2 Forms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="identity">
          <IdentityForm
            identity={identity}
            onSave={(data) => identityMutation.mutate(data)}
            isPending={identityMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="w2">
          {showW2Form ? (
            <W2Form
              initialData={editingW2}
              onSubmit={(data) => {
                if (editingW2) {
                  updateW2Mutation.mutate({ docId: editingW2.document_id, data });
                } else {
                  addW2Mutation.mutate(data);
                }
              }}
              onCancel={() => {
                setShowW2Form(false);
                setEditingW2(null);
              }}
              isPending={addW2Mutation.isPending || updateW2Mutation.isPending}
            />
          ) : (
            <W2List
              w2s={w2s}
              onAdd={() => {
                setEditingW2(null);
                setShowW2Form(true);
              }}
              onEdit={(doc) => {
                setEditingW2(doc);
                setShowW2Form(true);
              }}
              onDelete={(docId) => deleteW2Mutation.mutate(docId)}
              isDeleting={deleteW2Mutation.isPending}
            />
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
