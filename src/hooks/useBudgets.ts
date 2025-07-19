import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Budget {
  id: string;
  budget_id: string;
  department: string;
  cost_center: string;
  budget_type: 'OPEX' | 'CAPEX';
  amount: number;
  currency: string;
  description?: string;
  justification?: string;
  period_start: string;
  period_end: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Revision Required';
  submitted_by?: string;
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_comments?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetLineItem {
  id: string;
  budget_id: string;
  category: string;
  subcategory?: string;
  description: string;
  quantity: number;
  unit_cost: number;
  total_amount: number;
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  head_of_department?: string;
  budget_limit?: number;
  is_active: boolean;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  department_id: string;
  description?: string;
  budget_limit?: number;
  is_active: boolean;
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [budgetsResponse, departmentsResponse, costCentersResponse] = await Promise.all([
        supabase.from('budgets').select('*').order('created_at', { ascending: false }),
        supabase.from('departments').select('*').eq('is_active', true),
        supabase.from('cost_centers').select('*').eq('is_active', true)
      ]);

      if (budgetsResponse.error) throw budgetsResponse.error;
      if (departmentsResponse.error) throw departmentsResponse.error;
      if (costCentersResponse.error) throw costCentersResponse.error;

      setBudgets(budgetsResponse.data || []);
      setDepartments(departmentsResponse.data || []);
      setCostCenters(costCentersResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch budget data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (budgetData: Partial<Budget>) => {
    try {
      const { data, error } = await supabase.from('budgets').insert({
        ...budgetData,
        submitted_by: user?.id,
        budget_id: `BUD-${Date.now().toString().slice(-6)}`
      }).select().single();

      if (error) throw error;

      setBudgets(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBudgets(prev => prev.map(budget => budget.id === id ? data : budget));
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      });
      throw error;
    }
  };

  const submitBudget = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({ 
          status: 'Submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBudgets(prev => prev.map(budget => budget.id === id ? data : budget));
      toast({
        title: "Success",
        description: "Budget submitted for review",
      });
      return data;
    } catch (error) {
      console.error('Error submitting budget:', error);
      toast({
        title: "Error",
        description: "Failed to submit budget",
        variant: "destructive",
      });
      throw error;
    }
  };

  const approveBudget = async (id: string, comments?: string) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({ 
          status: 'Approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          review_comments: comments
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBudgets(prev => prev.map(budget => budget.id === id ? data : budget));
      toast({
        title: "Success",
        description: "Budget approved successfully",
      });
      return data;
    } catch (error) {
      console.error('Error approving budget:', error);
      toast({
        title: "Error",
        description: "Failed to approve budget",
        variant: "destructive",
      });
      throw error;
    }
  };

  const rejectBudget = async (id: string, comments: string) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({ 
          status: 'Rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          review_comments: comments
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBudgets(prev => prev.map(budget => budget.id === id ? data : budget));
      toast({
        title: "Budget Rejected",
        description: "Budget has been rejected with feedback",
      });
      return data;
    } catch (error) {
      console.error('Error rejecting budget:', error);
      toast({
        title: "Error",
        description: "Failed to reject budget",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    budgets,
    departments,
    costCenters,
    loading,
    createBudget,
    updateBudget,
    submitBudget,
    approveBudget,
    rejectBudget,
    refreshData: fetchData
  };
}