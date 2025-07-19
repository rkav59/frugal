import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBudgets } from "@/hooks/useBudgets";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

function getStatusBadge(status: string) {
  const variants = {
    'Draft': "secondary",
    'Submitted': "default",
    'Under Review': "default", 
    'Approved': "success",
    'Rejected': "destructive",
    'Revision Required': "outline"
  } as const;

  return (
    <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
      {status}
    </Badge>
  );
}

export function BudgetTable() {
  const { budgets, loading } = useBudgets();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading budgets...</div>
      </div>
    );
  }

  const recentBudgets = budgets.slice(0, 10); // Show only recent 10 budgets

  const handleViewDetails = (budgetId: string) => {
    // Navigate to review page where details can be viewed
    navigate('/review-approval');
  };

  const handleEdit = (budgetId: string) => {
    // Navigate to budget input page with the budget ID for editing
    navigate(`/budget-input?edit=${budgetId}`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Budget ID</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Cost Center</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount (USD)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Reviewer</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentBudgets.length > 0 ? (
            recentBudgets.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{item.budget_id}</TableCell>
                <TableCell>{item.department}</TableCell>
                <TableCell>{item.cost_center}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.budget_type}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  ${item.amount.toLocaleString()}
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  {item.submitted_at ? format(new Date(item.submitted_at), "MMM dd, yyyy") : "-"}
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(item.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No budget submissions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}