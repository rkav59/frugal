import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, TrendingUp, DollarSign, BarChart3, PieChart } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useBudgets } from "@/hooks/useBudgets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from "recharts";

export default function Reports() {
  const { budgets, departments, loading } = useBudgets();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Filter budgets based on selections
  const filteredBudgets = budgets.filter(budget => {
    let matches = true;
    
    if (selectedDepartment !== "all") {
      matches = matches && budget.department === selectedDepartment;
    }
    
    if (selectedStatus !== "all") {
      matches = matches && budget.status === selectedStatus;
    }
    
    if (dateRange?.from && dateRange?.to) {
      const budgetDate = new Date(budget.created_at);
      matches = matches && budgetDate >= dateRange.from && budgetDate <= dateRange.to;
    }
    
    return matches;
  });

  // Calculate statistics
  const stats = {
    totalBudgets: filteredBudgets.length,
    totalAmount: filteredBudgets.reduce((sum, b) => sum + b.amount, 0),
    approvedAmount: filteredBudgets.filter(b => b.status === 'Approved').reduce((sum, b) => sum + b.amount, 0),
    pendingAmount: filteredBudgets.filter(b => ['Submitted', 'Under Review'].includes(b.status)).reduce((sum, b) => sum + b.amount, 0),
    rejectedAmount: filteredBudgets.filter(b => b.status === 'Rejected').reduce((sum, b) => sum + b.amount, 0),
  };

  // Budget by Department Chart Data
  const departmentData = departments.map(dept => {
    const deptBudgets = filteredBudgets.filter(b => b.department === dept.name);
    return {
      name: dept.name,
      total: deptBudgets.reduce((sum, b) => sum + b.amount, 0),
      count: deptBudgets.length,
      approved: deptBudgets.filter(b => b.status === 'Approved').reduce((sum, b) => sum + b.amount, 0),
      pending: deptBudgets.filter(b => ['Submitted', 'Under Review'].includes(b.status)).reduce((sum, b) => sum + b.amount, 0),
    };
  }).filter(d => d.total > 0);

  // Budget Status Pie Chart Data
  const statusData = [
    { name: 'Approved', value: stats.approvedAmount, color: '#22c55e' },
    { name: 'Pending', value: stats.pendingAmount, color: '#f59e0b' },
    { name: 'Rejected', value: stats.rejectedAmount, color: '#ef4444' },
    { name: 'Draft', value: filteredBudgets.filter(b => b.status === 'Draft').reduce((sum, b) => sum + b.amount, 0), color: '#6b7280' },
  ].filter(d => d.value > 0);

  // Budget Type Data
  const typeData = [
    {
      name: 'OPEX',
      amount: filteredBudgets.filter(b => b.budget_type === 'OPEX').reduce((sum, b) => sum + b.amount, 0),
      count: filteredBudgets.filter(b => b.budget_type === 'OPEX').length,
    },
    {
      name: 'CAPEX',
      amount: filteredBudgets.filter(b => b.budget_type === 'CAPEX').reduce((sum, b) => sum + b.amount, 0),
      count: filteredBudgets.filter(b => b.budget_type === 'CAPEX').length,
    },
  ].filter(d => d.amount > 0);

  // Monthly Trend Data
  const monthlyData = filteredBudgets.reduce((acc, budget) => {
    const month = format(new Date(budget.created_at), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = { month, total: 0, count: 0, approved: 0 };
    }
    acc[month].total += budget.amount;
    acc[month].count += 1;
    if (budget.status === 'Approved') {
      acc[month].approved += budget.amount;
    }
    return acc;
  }, {} as Record<string, { month: string; total: number; count: number; approved: number }>);

  const trendData = Object.values(monthlyData).sort((a, b) => 
    new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  const exportReport = () => {
    const csvContent = [
      ['Budget ID', 'Department', 'Type', 'Amount', 'Status', 'Submitted Date', 'Reviewed Date'].join(','),
      ...filteredBudgets.map(budget => [
        budget.budget_id,
        budget.department,
        budget.budget_type,
        budget.amount,
        budget.status,
        budget.submitted_at ? format(new Date(budget.submitted_at), 'yyyy-MM-dd') : '',
        budget.reviewed_at ? format(new Date(budget.reviewed_at), 'yyyy-MM-dd') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive budget analytics and reporting
          </p>
        </div>
        <Button onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setDateRange(undefined);
                  setSelectedDepartment("all");
                  setSelectedStatus("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budgets</p>
                <p className="text-2xl font-bold">{stats.totalBudgets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Amount</p>
                <p className="text-2xl font-bold text-success">${stats.approvedAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold">
                  {stats.totalAmount > 0 ? Math.round((stats.approvedAmount / stats.totalAmount) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  dataKey="value"
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Budget Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === 'total' ? 'Total Submitted' : 'Total Approved'
                  ]}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" name="total" />
                <Bar dataKey="approved" fill="hsl(var(--success))" name="approved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OPEX vs CAPEX</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Department Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Department</th>
                  <th className="text-right p-2">Total Budgets</th>
                  <th className="text-right p-2">Total Amount</th>
                  <th className="text-right p-2">Approved Amount</th>
                  <th className="text-right p-2">Pending Amount</th>
                  <th className="text-right p-2">Approval Rate</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map((dept) => (
                  <tr key={dept.name} className="border-b">
                    <td className="p-2 font-medium">{dept.name}</td>
                    <td className="p-2 text-right">{dept.count}</td>
                    <td className="p-2 text-right">${dept.total.toLocaleString()}</td>
                    <td className="p-2 text-right text-success">${dept.approved.toLocaleString()}</td>
                    <td className="p-2 text-right text-warning">${dept.pending.toLocaleString()}</td>
                    <td className="p-2 text-right">
                      {dept.total > 0 ? Math.round((dept.approved / dept.total) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}