import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, FileText } from "lucide-react";
import type { W2Document } from "@shared/types/pipeline";

interface W2ListProps {
  w2s: W2Document[];
  onAdd: () => void;
  onEdit: (doc: W2Document) => void;
  onDelete: (docId: string) => void;
  isDeleting: boolean;
}

function formatCurrency(val: number | null): string {
  if (val == null) return "--";
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function W2List({ w2s, onAdd, onEdit, onDelete, isDeleting }: W2ListProps) {
  const totalBox1 = w2s.reduce((sum, w) => sum + (w.box1_wages || 0), 0);
  const totalBox2 = w2s.reduce((sum, w) => sum + (w.box2_federal_withholding || 0), 0);
  const totalBox3 = w2s.reduce((sum, w) => sum + (w.box3_social_security_wages || 0), 0);
  const totalBox5 = w2s.reduce((sum, w) => sum + (w.box5_medicare_wages_tips || 0), 0);

  return (
    <div className="space-y-4" data-testid="w2-list">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">W-2 Forms ({w2s.length})</h3>
        <Button onClick={onAdd} size="sm" data-testid="button-add-w2">
          <Plus className="h-4 w-4 mr-1" /> Add W-2
        </Button>
      </div>

      {w2s.length === 0 ? (
        <Card data-testid="w2-empty-state">
          <CardContent className="py-8 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-3">No W-2 forms entered yet.</p>
            <Button onClick={onAdd} variant="outline" data-testid="button-add-w2-empty">
              <Plus className="h-4 w-4 mr-1" /> Add Your First W-2
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {w2s.map((w2) => (
            <Card key={w2.document_id} data-testid={`card-w2-${w2.document_id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{w2.employer_name || "Unknown Employer"}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(w2)}
                      data-testid={`button-edit-w2-${w2.document_id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this W-2?")) {
                          onDelete(w2.document_id);
                        }
                      }}
                      disabled={isDeleting}
                      data-testid={`button-delete-w2-${w2.document_id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block">EIN</span>
                    <span className="font-mono" data-testid={`text-ein-${w2.document_id}`}>{w2.employer_ein || "--"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Box 1 Wages</span>
                    <span className="font-mono" data-testid={`text-box1-${w2.document_id}`}>{formatCurrency(w2.box1_wages)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Box 2 Fed Withheld</span>
                    <span className="font-mono" data-testid={`text-box2-${w2.document_id}`}>{formatCurrency(w2.box2_federal_withholding)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Employee</span>
                    <span data-testid={`text-employee-${w2.document_id}`}>{w2.employee_name || "--"}</span>
                  </div>
                </div>
                {w2.state_and_local && w2.state_and_local.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    {w2.state_and_local.map((sl, idx) => (
                      sl.state && (
                        <div key={idx} className="flex gap-4 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px]">{sl.state}</Badge>
                          <span>State wages: {formatCurrency(sl.state_wages)}</span>
                          <span>State tax: {formatCurrency(sl.state_income_tax)}</span>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Card className="bg-muted/50" data-testid="w2-totals">
            <CardContent className="py-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm font-semibold">
                <div>
                  <span className="text-muted-foreground text-xs block">Total</span>
                  <span>{w2s.length} W-2{w2s.length !== 1 ? "s" : ""}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Total Wages (Box 1)</span>
                  <span className="font-mono" data-testid="text-total-box1">{formatCurrency(totalBox1)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Total Fed Withheld (Box 2)</span>
                  <span className="font-mono" data-testid="text-total-box2">{formatCurrency(totalBox2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Total SS Wages (Box 3)</span>
                  <span className="font-mono" data-testid="text-total-box3">{formatCurrency(totalBox3)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
