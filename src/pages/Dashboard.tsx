import { DashboardCard } from "@/components/DashboardCard";
import { BudgetTable } from "@/components/BudgetTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  PlusCircle,
  FileText,
  Users,
  AlertTriangle
} from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { budgets, departments, loading } = useBudgets();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  // Calculate real-time statistics
  const stats = {
    totalBudget: budgets.reduce((sum, b) => sum + b.amount, 0),
    pendingApproval: budgets.filter(b => ['Submitted', 'Under Review'].includes(b.status)).length,
    approvedBudgets: budgets.filter(b => b.status === 'Approved').length,
    activeDepartments: departments.filter(d => d.is_active).length,
    approvalRate: budgets.length > 0 ? (budgets.filter(b => b.status === 'Approved').length / budgets.length) * 100 : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Budget Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Overview of budget submissions and approvals for {format(new Date(), 'yyyy')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => navigate('/reports')} className="w-full sm:w-auto">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={() => navigate('/budget-input')} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Budget
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Budget"
          value={`$${(stats.totalBudget / 1000000).toFixed(1)}M`}
          subtitle="Across all departments"
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 12.5, label: "from last quarter", isPositive: true }}
        />
        <DashboardCard
          title="Pending Approval"
          value={stats.pendingApproval.toString()}
          subtitle="Awaiting review"
          icon={<Clock className="h-4 w-4" />}
          trend={{ value: -5.2, label: "from last week", isPositive: false }}
        />
        <DashboardCard
          title="Approved Budgets"
          value={stats.approvedBudgets.toString()}
          subtitle="This quarter"
          icon={<CheckCircle className="h-4 w-4" />}
          trend={{ value: stats.approvalRate, label: "approval rate", isPositive: true }}
        />
        <DashboardCard
          title="Active Departments"
          value={stats.activeDepartments.toString()}
          subtitle="With submissions"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Quick Actions */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready to create a new budget?</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Submit your department budget request for approval and tracking
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={() => navigate('/budget-input')}
              className="shrink-0 w-full sm:w-auto"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Budget Request
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Budget by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">OPEX</span>
                <span className="text-sm text-muted-foreground">$1.2M</span>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div className="h-full bg-primary rounded-full" style={{ width: '60%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CAPEX</span>
                <span className="text-sm text-muted-foreground">$1.2M</span>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div className="h-full bg-accent rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgets.slice(0, 3).map((budget, index) => {
                const colors = ['bg-success', 'bg-primary', 'bg-warning'];
                const statuses = {
                  'Approved': 'approved',
                  'Submitted': 'submitted',
                  'Rejected': 'requires revision'
                };
                return (
                  <div key={budget.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 ${colors[index]} rounded-full mt-2`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Budget {budget.budget_id} {statuses[budget.status as keyof typeof statuses] || budget.status.toLowerCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {budget.department} Department • {format(new Date(budget.created_at), "MMM dd")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Budgets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Budget Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetTable />
        </CardContent>
      </Card>
    </div>
  );
}