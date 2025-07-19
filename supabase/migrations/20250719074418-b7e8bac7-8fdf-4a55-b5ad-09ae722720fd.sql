-- Budgets table for budget submissions
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  cost_center TEXT NOT NULL,
  budget_type TEXT NOT NULL CHECK (budget_type IN ('OPEX', 'CAPEX')),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  justification TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Revision Required')),
  submitted_by UUID REFERENCES public.profiles(user_id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(user_id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Budget line items for detailed breakdown
CREATE TABLE public.budget_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_cost DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Departments management
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  head_of_department UUID REFERENCES public.profiles(user_id),
  budget_limit DECIMAL(15,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cost Centers
CREATE TABLE public.cost_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id),
  description TEXT,
  budget_limit DECIMAL(15,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Approval workflows
CREATE TABLE public.approval_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES public.profiles(user_id),
  level INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Budget history for audit trail
CREATE TABLE public.budget_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.profiles(user_id),
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_history ENABLE ROW LEVEL SECURITY;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT role::TEXT FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Create function to get user department
CREATE OR REPLACE FUNCTION public.get_user_department(user_uuid UUID)
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT department FROM public.profiles WHERE user_id = user_uuid;
$$;

-- RLS Policies for budgets
CREATE POLICY "Users can view their department budgets" 
ON public.budgets 
FOR SELECT 
USING (
  public.get_user_role(auth.uid()) = 'admin' OR 
  public.get_user_role(auth.uid()) = 'finance_manager' OR
  department = public.get_user_department(auth.uid()) OR
  submitted_by = auth.uid()
);

CREATE POLICY "Users can create budgets for their department" 
ON public.budgets 
FOR INSERT 
WITH CHECK (
  department = public.get_user_department(auth.uid()) AND
  submitted_by = auth.uid()
);

CREATE POLICY "Users can update their own draft budgets" 
ON public.budgets 
FOR UPDATE 
USING (
  submitted_by = auth.uid() AND status = 'Draft'
);

CREATE POLICY "Managers and admins can update budgets" 
ON public.budgets 
FOR UPDATE 
USING (
  public.get_user_role(auth.uid()) IN ('admin', 'finance_manager', 'department_manager')
);

-- RLS Policies for budget line items
CREATE POLICY "Users can view line items of accessible budgets" 
ON public.budget_line_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.budgets b 
    WHERE b.id = budget_line_items.budget_id AND
    (public.get_user_role(auth.uid()) = 'admin' OR 
     public.get_user_role(auth.uid()) = 'finance_manager' OR
     b.department = public.get_user_department(auth.uid()) OR
     b.submitted_by = auth.uid())
  )
);

CREATE POLICY "Users can manage line items of their budgets" 
ON public.budget_line_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.budgets b 
    WHERE b.id = budget_line_items.budget_id AND b.submitted_by = auth.uid()
  )
);

-- RLS Policies for departments
CREATE POLICY "All authenticated users can view departments" 
ON public.departments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage departments" 
ON public.departments 
FOR ALL 
USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for cost centers
CREATE POLICY "All authenticated users can view cost centers" 
ON public.cost_centers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage cost centers" 
ON public.cost_centers 
FOR ALL 
USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for approval workflows
CREATE POLICY "Users can view approval workflows for accessible budgets" 
ON public.approval_workflows 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.budgets b 
    WHERE b.id = approval_workflows.budget_id AND
    (public.get_user_role(auth.uid()) = 'admin' OR 
     public.get_user_role(auth.uid()) = 'finance_manager' OR
     b.department = public.get_user_department(auth.uid()) OR
     b.submitted_by = auth.uid())
  ) OR approver_id = auth.uid()
);

CREATE POLICY "Approvers can update their approval decisions" 
ON public.approval_workflows 
FOR UPDATE 
USING (approver_id = auth.uid());

-- RLS Policies for budget history
CREATE POLICY "Users can view history of accessible budgets" 
ON public.budget_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.budgets b 
    WHERE b.id = budget_history.budget_id AND
    (public.get_user_role(auth.uid()) = 'admin' OR 
     public.get_user_role(auth.uid()) = 'finance_manager' OR
     b.department = public.get_user_department(auth.uid()) OR
     b.submitted_by = auth.uid())
  )
);

-- Triggers for updated_at columns
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_line_items_updated_at
  BEFORE UPDATE ON public.budget_line_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cost_centers_updated_at
  BEFORE UPDATE ON public.cost_centers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create budget history entries
CREATE OR REPLACE FUNCTION public.create_budget_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.budget_history (budget_id, action, changed_by, old_values, new_values)
    VALUES (
      NEW.id,
      'UPDATE',
      auth.uid(),
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.budget_history (budget_id, action, changed_by, new_values)
    VALUES (
      NEW.id,
      'CREATE',
      auth.uid(),
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for budget history
CREATE TRIGGER budget_history_trigger
  AFTER INSERT OR UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.create_budget_history();

-- Insert sample departments and cost centers
INSERT INTO public.departments (name, code, description, is_active) VALUES
('Information Technology', 'IT', 'Technology infrastructure and development', true),
('Marketing', 'MKT', 'Marketing and brand management', true),
('Operations', 'OPS', 'Day-to-day operations management', true),
('Human Resources', 'HR', 'Human resources and talent management', true),
('Finance', 'FIN', 'Financial planning and accounting', true),
('Research & Development', 'RND', 'Product research and development', true);

INSERT INTO public.cost_centers (code, name, department_id, description, is_active) VALUES
('IT-001', 'Infrastructure', (SELECT id FROM public.departments WHERE code = 'IT'), 'IT Infrastructure costs', true),
('IT-002', 'Software Development', (SELECT id FROM public.departments WHERE code = 'IT'), 'Software development costs', true),
('MKT-001', 'Digital Marketing', (SELECT id FROM public.departments WHERE code = 'MKT'), 'Digital marketing campaigns', true),
('MKT-002', 'Brand Management', (SELECT id FROM public.departments WHERE code = 'MKT'), 'Brand and marketing materials', true),
('OPS-001', 'Facility Management', (SELECT id FROM public.departments WHERE code = 'OPS'), 'Office and facility costs', true),
('HR-001', 'Recruitment', (SELECT id FROM public.departments WHERE code = 'HR'), 'Recruitment and hiring costs', true),
('FIN-001', 'Accounting', (SELECT id FROM public.departments WHERE code = 'FIN'), 'Accounting and audit costs', true),
('RND-001', 'Product Development', (SELECT id FROM public.departments WHERE code = 'RND'), 'New product development', true);