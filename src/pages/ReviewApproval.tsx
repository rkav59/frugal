import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, Eye, MessageSquare, Calendar, DollarSign, ArrowLeft } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function ReviewApproval() {
  const navigate = useNavigate();
  const { budgets, approveBudget, rejectBudget, loading } = useBudgets();
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [reviewComments, setReviewComments] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const pendingBudgets = budgets.filter(b => b.status === 'Submitted' || b.status === 'Under Review');
  const reviewedBudgets = budgets.filter(b => ['Approved', 'Rejected', 'Revision Required'].includes(b.status));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'Revision Required':
        return <MessageSquare className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Draft': 'secondary',
      'Submitted': 'default',
      'Under Review': 'default',
      'Approved': 'success',
      'Rejected': 'destructive',
      'Revision Required': 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  const handleApprove = async (budgetId: string) => {
    try {
      await approveBudget(budgetId, reviewComments);
      setReviewComments("");
      setSelectedBudget(null);
    } catch (error) {
      console.error('Error approving budget:', error);
    }
  };

  const handleReject = async (budgetId: string) => {
    try {
      await rejectBudget(budgetId, reviewComments);
      setReviewComments("");
      setSelectedBudget(null);
    } catch (error) {
      console.error('Error rejecting budget:', error);
    }
  };

  const BudgetDetailsDialog = ({ budget }: { budget: any }) => (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Budget Review: {budget.budget_id}
          {getStatusBadge(budget.status)}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Budget Overview */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium">{budget.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost Center:</span>
                <span className="font-medium">{budget.cost_center}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline">{budget.budget_type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period:</span>
                <span className="font-medium">
                  {budget.period_start && budget.period_end 
                    ? `${format(new Date(budget.period_start), "MMM dd")} - ${format(new Date(budget.period_end), "MMM dd, yyyy")}`
                    : "Not specified"
                  }
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-primary">
                  ${budget.amount.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">
                  {budget.submitted_at ? format(new Date(budget.submitted_at), "MMM dd, yyyy") : "Not submitted"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {format(new Date(budget.created_at), "MMM dd, yyyy")}
                </span>
              </div>
              {budget.reviewed_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviewed:</span>
                  <span className="font-medium">
                    {format(new Date(budget.reviewed_at), "MMM dd, yyyy")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Description and Justification */}
        {(budget.description || budget.justification) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {budget.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{budget.description}</p>
                </div>
              )}
              {budget.justification && (
                <div>
                  <h4 className="font-medium mb-2">Business Justification</h4>
                  <p className="text-muted-foreground">{budget.justification}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Review Comments */}
        {budget.review_comments && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{budget.review_comments}</p>
            </CardContent>
          </Card>
        )}

        {/* Review Actions */}
        {budget.status === 'Submitted' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Comments</label>
                <Textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add review comments (optional for approval, required for rejection)"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(budget.id)}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Budget
                </Button>
                <Button
                  onClick={() => handleReject(budget.id)}
                  variant="destructive"
                  className="flex-1"
                  disabled={!reviewComments.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Budget
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DialogContent>
  );

  const BudgetTable = ({ budgets: budgetList, showActions = false }: { budgets: any[], showActions?: boolean }) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Budget ID</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgetList.map((budget) => (
            <TableRow key={budget.id}>
              <TableCell className="font-medium">{budget.budget_id}</TableCell>
              <TableCell>{budget.department}</TableCell>
              <TableCell>
                <Badge variant="outline">{budget.budget_type}</Badge>
              </TableCell>
              <TableCell className="text-right font-mono">
                ${budget.amount.toLocaleString()}
              </TableCell>
              <TableCell>{getStatusBadge(budget.status)}</TableCell>
              <TableCell>
                {budget.submitted_at ? format(new Date(budget.submitted_at), "MMM dd, yyyy") : "-"}
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </DialogTrigger>
                  <BudgetDetailsDialog budget={budget} />
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Review & Approval</h1>
            <p className="text-muted-foreground">
              Review and approve budget submissions
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{pendingBudgets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">
                  {budgets.filter(b => b.status === 'Approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">
                  {budgets.filter(b => b.status === 'Rejected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  ${pendingBudgets.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Lists */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review ({pendingBudgets.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({reviewedBudgets.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Budget Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingBudgets.length > 0 ? (
                <BudgetTable budgets={pendingBudgets} showActions />
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Pending Reviews</h3>
                  <p className="text-muted-foreground">All budget submissions have been reviewed.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviewed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reviewed Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              {reviewedBudgets.length > 0 ? (
                <BudgetTable budgets={reviewedBudgets} />
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Reviewed Budgets</h3>
                  <p className="text-muted-foreground">No budgets have been reviewed yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}