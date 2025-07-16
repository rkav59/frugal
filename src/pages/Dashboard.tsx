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

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budget Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of budget submissions and approvals for Q1 2024
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Budget
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Budget"
          value="$2.4M"
          subtitle="Across all departments"
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 12.5, label: "from last quarter", isPositive: true }}
        />
        <DashboardCard
          title="Pending Approval"
          value="8"
          subtitle="Awaiting review"
          icon={<Clock className="h-4 w-4" />}
          trend={{ value: -5.2, label: "from last week", isPositive: false }}
        />
        <DashboardCard
          title="Approved Budgets"
          value="24"
          subtitle="This quarter"
          icon={<CheckCircle className="h-4 w-4" />}
          trend={{ value: 18.3, label: "approval rate", isPositive: true }}
        />
        <DashboardCard
          title="Active Departments"
          value="12"
          subtitle="With submissions"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

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
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Budget BUD-001 approved</p>
                  <p className="text-xs text-muted-foreground">IT Department • 2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New submission from Marketing</p>
                  <p className="text-xs text-muted-foreground">BUD-002 • 4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Budget requires revision</p>
                  <p className="text-xs text-muted-foreground">HR Department • 1 day ago</p>
                </div>
              </div>
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