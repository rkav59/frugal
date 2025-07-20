import { DashboardCard } from "@/components/DashboardCard";
import { BudgetTable } from "@/components/BudgetTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  PlusCircle,
  FileText,
  Users,
  AlertTriangle,
  Search,
  Filter,
  X
} from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableBudgetTable } from "@/components/SearchableBudgetTable";

export default function Dashboard() {
  const navigate = useNavigate();
  const { budgets, departments, loading } = useBudgets();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Filter budgets based on search and filters
  const filteredBudgets = useMemo(() => {
    return budgets.filter(budget => {
      const matchesSearch = searchQuery === "" || 
        budget.budget_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        budget.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        budget.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "" || budget.status === statusFilter;
      const matchesDepartment = departmentFilter === "" || budget.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [budgets, searchQuery, statusFilter, departmentFilter]);

  // Calculate real-time statistics
  const stats = useMemo(() => ({
    totalBudget: filteredBudgets.reduce((sum, b) => sum + b.amount, 0),
    pendingApproval: filteredBudgets.filter(b => ['Submitted', 'Under Review'].includes(b.status)).length,
    approvedBudgets: filteredBudgets.filter(b => b.status === 'Approved').length,
    activeDepartments: departments.filter(d => d.is_active).length,
    approvalRate: filteredBudgets.length > 0 ? (filteredBudgets.filter(b => b.status === 'Approved').length / filteredBudgets.length) * 100 : 0,
  }), [filteredBudgets, departments]);

  const uniqueStatuses = useMemo(() => [...new Set(budgets.map(b => b.status))], [budgets]);
  const uniqueDepartments = useMemo(() => [...new Set(budgets.map(b => b.department))], [budgets]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDepartmentFilter("");
  };

  const hasActiveFilters = searchQuery || statusFilter || departmentFilter;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 px-1 sm:px-2 lg:px-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground break-words leading-tight">
              Budget Dashboard
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base mt-1 leading-relaxed">
              Overview of budget submissions and approvals for {format(new Date(), 'yyyy')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
            <Button 
              variant="outline" 
              onClick={() => navigate('/reports')} 
              className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
            >
              <FileText className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
              <span className="truncate">Export Report</span>
            </Button>
            <Button 
              onClick={() => navigate('/budget-input')} 
              className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
            >
              <PlusCircle className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
              <span className="truncate">New Budget</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by budget ID, department, or description..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-2 lg:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="w-full sm:w-auto"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {statusFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter("")} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {departmentFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Department: {departmentFilter}
                    <button onClick={() => setDepartmentFilter("")} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
            
            {/* Results Summary */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredBudgets.length} of {budgets.length} budget{budgets.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

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
              {filteredBudgets.slice(0, 3).map((budget, index) => {
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
      <SearchableBudgetTable />
    </div>
  );
}