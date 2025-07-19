import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, Save, Send, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useBudgets, BudgetLineItem } from "@/hooks/useBudgets";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function BudgetInput() {
  const navigate = useNavigate();
  const { departments, costCenters, createBudget, updateBudget, submitBudget } = useBudgets();
  const [formData, setFormData] = useState({
    department: "",
    cost_center: "",
    budget_type: "",
    amount: "",
    description: "",
    justification: "",
    period_start: null as Date | null,
    period_end: null as Date | null,
  });

  const [lineItems, setLineItems] = useState<Partial<BudgetLineItem>[]>([
    { category: "", description: "", quantity: 1, unit_cost: 0, total_amount: 0 }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null);

  const filteredCostCenters = costCenters.filter(cc => 
    formData.department ? departments.find(d => d.name === formData.department)?.id === cc.department_id : true
  );

  const addLineItem = () => {
    setLineItems([...lineItems, { category: "", description: "", quantity: 1, unit_cost: 0, total_amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_cost') {
      const quantity = field === 'quantity' ? value : updated[index].quantity || 0;
      const unitCost = field === 'unit_cost' ? value : updated[index].unit_cost || 0;
      updated[index].total_amount = quantity * unitCost;
    }
    
    setLineItems(updated);
  };

  const calculateTotalAmount = () => {
    return lineItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
  };

  useEffect(() => {
    const total = calculateTotalAmount();
    setFormData(prev => ({ ...prev, amount: total.toString() }));
  }, [lineItems]);

  const saveDraft = async () => {
    try {
      setIsSubmitting(true);
      
      if (!formData.department || !formData.cost_center || !formData.budget_type) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const budgetData = {
        department: formData.department,
        cost_center: formData.cost_center,
        budget_type: formData.budget_type as 'OPEX' | 'CAPEX',
        amount: parseFloat(formData.amount) || 0,
        description: formData.description,
        justification: formData.justification,
        period_start: formData.period_start?.toISOString().split('T')[0],
        period_end: formData.period_end?.toISOString().split('T')[0],
        status: 'Draft' as const,
      };

      if (currentBudgetId) {
        await updateBudget(currentBudgetId, budgetData);
      } else {
        const newBudget = await createBudget({
          ...budgetData,
          budget_id: '', // Will be set by createBudget function
        });
        setCurrentBudgetId(newBudget.id);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitForReview = async () => {
    try {
      setIsSubmitting(true);
      
      if (!currentBudgetId) {
        await saveDraft();
        if (!currentBudgetId) return;
      }

      await submitBudget(currentBudgetId);
      
      // Reset form
      setFormData({
        department: "",
        cost_center: "",
        budget_type: "",
        amount: "",
        description: "",
        justification: "",
        period_start: null,
        period_end: null,
      });
      setLineItems([{ category: "", description: "", quantity: 1, unit_cost: 0, total_amount: 0 }]);
      setCurrentBudgetId(null);
    } catch (error) {
      console.error('Error submitting budget:', error);
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold text-foreground">Budget Input</h1>
            <p className="text-muted-foreground">
              Create and submit budget requests for approval
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Budget Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value, cost_center: ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost_center">Cost Center *</Label>
                  <Select value={formData.cost_center} onValueChange={(value) => setFormData({...formData, cost_center: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cost center" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCostCenters.map((cc) => (
                        <SelectItem key={cc.id} value={cc.code}>
                          {cc.code} - {cc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget_type">Budget Type *</Label>
                  <Select value={formData.budget_type} onValueChange={(value) => setFormData({...formData, budget_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEX">OPEX (Operating Expenses)</SelectItem>
                      <SelectItem value="CAPEX">CAPEX (Capital Expenses)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Total Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Period Start</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.period_start && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.period_start ? (
                          format(formData.period_start, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.period_start}
                        onSelect={(date) => setFormData({...formData, period_start: date})}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Period End</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.period_end && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.period_end ? (
                          format(formData.period_end, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.period_end}
                        onSelect={(date) => setFormData({...formData, period_end: date})}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the budget request"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification">Business Justification</Label>
                <Textarea
                  id="justification"
                  value={formData.justification}
                  onChange={(e) => setFormData({...formData, justification: e.target.value})}
                  placeholder="Explain the business need and expected outcomes"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Budget Line Items
                <Button onClick={addLineItem} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {lineItems.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input
                          value={item.category || ""}
                          onChange={(e) => updateLineItem(index, 'category', e.target.value)}
                          placeholder="e.g., Software, Hardware, Services"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subcategory</Label>
                        <Input
                          value={item.subcategory || ""}
                          onChange={(e) => updateLineItem(index, 'subcategory', e.target.value)}
                          placeholder="Optional subcategory"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={item.description || ""}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Detailed description of the item"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit Cost ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_cost || 0}
                          onChange={(e) => updateLineItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total ($)</Label>
                        <Input
                          value={`$${(item.total_amount || 0).toLocaleString()}`}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={item.notes || ""}
                        onChange={(e) => updateLineItem(index, 'notes', e.target.value)}
                        placeholder="Additional notes or specifications"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium">{formData.department || "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost Center:</span>
                <span className="font-medium">{formData.cost_center || "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{formData.budget_type || "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period:</span>
                <span className="font-medium text-right">
                  {formData.period_start && formData.period_end 
                    ? `${format(formData.period_start, "MMM dd")} - ${format(formData.period_end, "MMM dd, yyyy")}`
                    : "Not set"
                  }
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${calculateTotalAmount().toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <Button
                  onClick={saveDraft}
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  onClick={submitForReview}
                  className="w-full"
                  disabled={isSubmitting || !formData.department || !formData.cost_center || !formData.budget_type}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}