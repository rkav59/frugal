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

interface BudgetItem {
  id: string;
  department: string;
  costCenter: string;
  budgetType: "OPEX" | "CAPEX";
  amount: number;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  submittedDate: string;
  reviewer?: string;
}

const budgetData: BudgetItem[] = [
  {
    id: "BUD-001",
    department: "IT",
    costCenter: "IT-001",
    budgetType: "CAPEX",
    amount: 125000,
    status: "Approved",
    submittedDate: "2024-01-15",
    reviewer: "Sarah Chen"
  },
  {
    id: "BUD-002",
    department: "Marketing",
    costCenter: "MKT-001",
    budgetType: "OPEX",
    amount: 85000,
    status: "Submitted",
    submittedDate: "2024-01-16",
  },
  {
    id: "BUD-003",
    department: "Operations",
    costCenter: "OPS-001",
    budgetType: "OPEX",
    amount: 65000,
    status: "Draft",
    submittedDate: "2024-01-17",
  },
  {
    id: "BUD-004",
    department: "HR",
    costCenter: "HR-001",
    budgetType: "OPEX",
    amount: 45000,
    status: "Rejected",
    submittedDate: "2024-01-14",
    reviewer: "Mike Johnson"
  }
];

function getStatusBadge(status: BudgetItem["status"]) {
  const variants = {
    Draft: "secondary",
    Submitted: "default",
    Approved: "success",
    Rejected: "destructive"
  } as const;

  return (
    <Badge variant={variants[status]}>
      {status}
    </Badge>
  );
}

export function BudgetTable() {
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
          {budgetData.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.department}</TableCell>
              <TableCell>{item.costCenter}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.budgetType}</Badge>
              </TableCell>
              <TableCell className="text-right font-mono">
                ${item.amount.toLocaleString()}
              </TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell>{item.submittedDate}</TableCell>
              <TableCell>{item.reviewer || "-"}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}