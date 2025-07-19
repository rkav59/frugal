import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Shield, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBudgets } from "@/hooks/useBudgets";
import { useNavigate } from "react-router-dom";

interface Profile {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
  cost_center: string;
  created_at: string;
  updated_at: string;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const { departments } = useBudgets();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [userForm, setUserForm] = useState({
    full_name: "",
    email: "",
    role: "",
    department: "",
    cost_center: "",
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

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

  const resetForm = () => {
    setUserForm({
      full_name: "",
      email: "",
      role: "",
      department: "",
      cost_center: "",
    });
    setEditingProfile(null);
  };

  const handleSaveUser = async () => {
    try {
      if (editingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: userForm.full_name,
            role: userForm.role as any,
            department: userForm.department,
            cost_center: userForm.cost_center,
          })
          .eq('user_id', editingProfile.user_id);

        if (error) throw error;
        toast({ title: "Success", description: "User updated successfully" });
      } else {
        // For new users, you would typically need to create an auth user first
        // This is a simplified version that updates an existing profile
        toast({ 
          title: "Info", 
          description: "User creation requires admin privileges through Supabase Auth" 
        });
      }

      resetForm();
      setIsEditing(false);
      fetchProfiles();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: "Failed to save user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      toast({ title: "Success", description: "User deleted successfully" });
      fetchProfiles();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const startEditUser = (profile: Profile) => {
    setEditingProfile(profile);
    setUserForm({
      full_name: profile.full_name || "",
      email: profile.email,
      role: profile.role,
      department: profile.department || "",
      cost_center: profile.cost_center || "",
    });
    setIsEditing(true);
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      'admin': 'destructive',
      'finance_manager': 'default',
      'department_manager': 'secondary',
      'department_user': 'outline'
    } as const;

    const roleNames = {
      'admin': 'Admin',
      'finance_manager': 'Finance Manager',
      'department_manager': 'Department Manager',
      'department_user': 'User'
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'outline'}>
        {roleNames[role as keyof typeof roleNames] || role}
      </Badge>
    );
  };

  const UserForm = () => (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {editingProfile ? 'Edit User' : 'Add New User'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={userForm.full_name}
              onChange={(e) => setUserForm({...userForm, full_name: e.target.value})}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({...userForm, email: e.target.value})}
              placeholder="john.doe@company.com"
              disabled={!!editingProfile}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select 
              value={userForm.role} 
              onValueChange={(value) => setUserForm({...userForm, role: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="department_user">User</SelectItem>
                <SelectItem value="department_manager">Department Manager</SelectItem>
                <SelectItem value="finance_manager">Finance Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select 
              value={userForm.department} 
              onValueChange={(value) => setUserForm({...userForm, department: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost_center">Cost Center</Label>
          <Input
            id="cost_center"
            value={userForm.cost_center}
            onChange={(e) => setUserForm({...userForm, cost_center: e.target.value})}
            placeholder="e.g., IT-001"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsEditing(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveUser}
            disabled={!userForm.full_name || !userForm.email || !userForm.role}
          >
            {editingProfile ? 'Update' : 'Create'} User
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  // Calculate statistics
  const stats = {
    totalUsers: profiles.length,
    admins: profiles.filter(p => p.role === 'admin').length,
    managers: profiles.filter(p => ['finance_manager', 'department_manager'].includes(p.role)).length,
    activeUsers: profiles.filter(p => p.role === 'department_user').length,
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Managers</p>
                <p className="text-2xl font-bold">{stats.managers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Regular Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Accounts</CardTitle>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <UserForm />
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Cost Center</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.user_id}>
                    <TableCell className="font-medium">
                      {profile.full_name || 'No name set'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {profile.email}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(profile.role)}</TableCell>
                    <TableCell>{profile.department || "-"}</TableCell>
                    <TableCell>{profile.cost_center || "-"}</TableCell>
                    <TableCell>
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditUser(profile)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(profile.user_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}