import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Building2, Users, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBudgets } from "@/hooks/useBudgets";

interface Profile {
  user_id: string;
  full_name: string;
  email: string;
}

export default function DepartmentManagement() {
  const { departments, costCenters, refreshData } = useBudgets();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [isAddingCostCenter, setIsAddingCostCenter] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingCostCenter, setEditingCostCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    code: "",
    description: "",
    head_of_department: "",
    budget_limit: "",
  });

  const [costCenterForm, setCostCenterForm] = useState({
    code: "",
    name: "",
    department_id: "",
    description: "",
    budget_limit: "",
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetDepartmentForm = () => {
    setDepartmentForm({
      name: "",
      code: "",
      description: "",
      head_of_department: "",
      budget_limit: "",
    });
    setEditingDepartment(null);
  };

  const resetCostCenterForm = () => {
    setCostCenterForm({
      code: "",
      name: "",
      department_id: "",
      description: "",
      budget_limit: "",
    });
    setEditingCostCenter(null);
  };

  const handleSaveDepartment = async () => {
    try {
      const departmentData = {
        name: departmentForm.name,
        code: departmentForm.code,
        description: departmentForm.description || null,
        head_of_department: departmentForm.head_of_department || null,
        budget_limit: departmentForm.budget_limit ? parseFloat(departmentForm.budget_limit) : null,
      };

      if (editingDepartment) {
        const { error } = await supabase
          .from('departments')
          .update(departmentData)
          .eq('id', editingDepartment.id);

        if (error) throw error;
        toast({ title: "Success", description: "Department updated successfully" });
      } else {
        const { error } = await supabase
          .from('departments')
          .insert(departmentData);

        if (error) throw error;
        toast({ title: "Success", description: "Department created successfully" });
      }

      resetDepartmentForm();
      setIsAddingDepartment(false);
      refreshData();
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        title: "Error",
        description: "Failed to save department",
        variant: "destructive",
      });
    }
  };

  const handleSaveCostCenter = async () => {
    try {
      const costCenterData = {
        code: costCenterForm.code,
        name: costCenterForm.name,
        department_id: costCenterForm.department_id,
        description: costCenterForm.description || null,
        budget_limit: costCenterForm.budget_limit ? parseFloat(costCenterForm.budget_limit) : null,
      };

      if (editingCostCenter) {
        const { error } = await supabase
          .from('cost_centers')
          .update(costCenterData)
          .eq('id', editingCostCenter.id);

        if (error) throw error;
        toast({ title: "Success", description: "Cost center updated successfully" });
      } else {
        const { error } = await supabase
          .from('cost_centers')
          .insert(costCenterData);

        if (error) throw error;
        toast({ title: "Success", description: "Cost center created successfully" });
      }

      resetCostCenterForm();
      setIsAddingCostCenter(false);
      refreshData();
    } catch (error) {
      console.error('Error saving cost center:', error);
      toast({
        title: "Error",
        description: "Failed to save cost center",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Department deleted successfully" });
      refreshData();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCostCenter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cost center?')) return;

    try {
      const { error } = await supabase
        .from('cost_centers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Cost center deleted successfully" });
      refreshData();
    } catch (error) {
      console.error('Error deleting cost center:', error);
      toast({
        title: "Error",
        description: "Failed to delete cost center",
        variant: "destructive",
      });
    }
  };

  const startEditDepartment = (department: any) => {
    setEditingDepartment(department);
    setDepartmentForm({
      name: department.name,
      code: department.code,
      description: department.description || "",
      head_of_department: department.head_of_department || "",
      budget_limit: department.budget_limit?.toString() || "",
    });
    setIsAddingDepartment(true);
  };

  const startEditCostCenter = (costCenter: any) => {
    setEditingCostCenter(costCenter);
    setCostCenterForm({
      code: costCenter.code,
      name: costCenter.name,
      department_id: costCenter.department_id,
      description: costCenter.description || "",
      budget_limit: costCenter.budget_limit?.toString() || "",
    });
    setIsAddingCostCenter(true);
  };

  const DepartmentForm = () => (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {editingDepartment ? 'Edit Department' : 'Add New Department'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dept-name">Department Name *</Label>
            <Input
              id="dept-name"
              value={departmentForm.name}
              onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
              placeholder="e.g., Information Technology"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept-code">Department Code *</Label>
            <Input
              id="dept-code"
              value={departmentForm.code}
              onChange={(e) => setDepartmentForm({...departmentForm, code: e.target.value.toUpperCase()})}
              placeholder="e.g., IT"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dept-description">Description</Label>
          <Textarea
            id="dept-description"
            value={departmentForm.description}
            onChange={(e) => setDepartmentForm({...departmentForm, description: e.target.value})}
            placeholder="Department description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dept-head">Department Head</Label>
            <Select 
              value={departmentForm.head_of_department} 
              onValueChange={(value) => setDepartmentForm({...departmentForm, head_of_department: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department head" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map(profile => (
                  <SelectItem key={profile.user_id} value={profile.user_id}>
                    {profile.full_name} ({profile.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept-budget">Budget Limit ($)</Label>
            <Input
              id="dept-budget"
              type="number"
              step="0.01"
              min="0"
              value={departmentForm.budget_limit}
              onChange={(e) => setDepartmentForm({...departmentForm, budget_limit: e.target.value})}
              placeholder="Optional budget limit"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsAddingDepartment(false);
              resetDepartmentForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveDepartment}
            disabled={!departmentForm.name || !departmentForm.code}
          >
            {editingDepartment ? 'Update' : 'Create'} Department
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  const CostCenterForm = () => (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {editingCostCenter ? 'Edit Cost Center' : 'Add New Cost Center'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cc-code">Cost Center Code *</Label>
            <Input
              id="cc-code"
              value={costCenterForm.code}
              onChange={(e) => setCostCenterForm({...costCenterForm, code: e.target.value.toUpperCase()})}
              placeholder="e.g., IT-001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-name">Cost Center Name *</Label>
            <Input
              id="cc-name"
              value={costCenterForm.name}
              onChange={(e) => setCostCenterForm({...costCenterForm, name: e.target.value})}
              placeholder="e.g., Infrastructure"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cc-department">Department *</Label>
          <Select 
            value={costCenterForm.department_id} 
            onValueChange={(value) => setCostCenterForm({...costCenterForm, department_id: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cc-description">Description</Label>
          <Textarea
            id="cc-description"
            value={costCenterForm.description}
            onChange={(e) => setCostCenterForm({...costCenterForm, description: e.target.value})}
            placeholder="Cost center description"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cc-budget">Budget Limit ($)</Label>
          <Input
            id="cc-budget"
            type="number"
            step="0.01"
            min="0"
            value={costCenterForm.budget_limit}
            onChange={(e) => setCostCenterForm({...costCenterForm, budget_limit: e.target.value})}
            placeholder="Optional budget limit"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsAddingCostCenter(false);
              resetCostCenterForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCostCenter}
            disabled={!costCenterForm.code || !costCenterForm.name || !costCenterForm.department_id}
          >
            {editingCostCenter ? 'Update' : 'Create'} Cost Center
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Department Management</h1>
          <p className="text-muted-foreground">
            Manage departments and cost centers
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost Centers</p>
                <p className="text-2xl font-bold">{costCenters.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{profiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Departments</CardTitle>
          <Dialog open={isAddingDepartment} onOpenChange={setIsAddingDepartment}>
            <DialogTrigger asChild>
              <Button onClick={() => resetDepartmentForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DepartmentForm />
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Department Head</TableHead>
                  <TableHead>Budget Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => {
                  const head = profiles.find(p => p.user_id === department.head_of_department);
                  return (
                    <TableRow key={department.id}>
                      <TableCell className="font-medium">{department.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{department.code}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {department.description || "-"}
                      </TableCell>
                      <TableCell>{head ? head.full_name : "-"}</TableCell>
                      <TableCell>
                        {department.budget_limit ? `$${department.budget_limit.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={department.is_active ? "success" : "secondary"}>
                          {department.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditDepartment(department)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDepartment(department.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cost Centers Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cost Centers</CardTitle>
          <Dialog open={isAddingCostCenter} onOpenChange={setIsAddingCostCenter}>
            <DialogTrigger asChild>
              <Button onClick={() => resetCostCenterForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Cost Center
              </Button>
            </DialogTrigger>
            <CostCenterForm />
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Budget Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costCenters.map((costCenter) => {
                  const department = departments.find(d => d.id === costCenter.department_id);
                  return (
                    <TableRow key={costCenter.id}>
                      <TableCell>
                        <Badge variant="outline">{costCenter.code}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{costCenter.name}</TableCell>
                      <TableCell>{department?.name || "Unknown"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {costCenter.description || "-"}
                      </TableCell>
                      <TableCell>
                        {costCenter.budget_limit ? `$${costCenter.budget_limit.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={costCenter.is_active ? "success" : "secondary"}>
                          {costCenter.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditCostCenter(costCenter)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCostCenter(costCenter.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}