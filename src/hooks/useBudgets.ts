import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Budget = Tables<'budgets'>;
export type BudgetInsert = TablesInsert<'budgets'>;
export type BudgetUpdate = TablesUpdate<'budgets'>;
export type BudgetLineItem = Tables<'budget_line_items'>;
export type Department = Tables<'departments'>;
export type CostCenter = Tables<'cost_centers'>;

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

  const createBudget = async (budgetData: BudgetInsert) => {
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

  const updateBudget = async (id: string, updates: BudgetUpdate) => {
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