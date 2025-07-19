import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, Settings as SettingsIcon, Bell, Shield, Palette, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const [settings, setSettings] = useState({
    // General Settings
    companyName: "Acme Corporation",
    fiscalYearStart: "01-01",
    defaultCurrency: "USD",
    
    // Notification Settings
    emailNotifications: true,
    budgetSubmissionAlerts: true,
    approvalDeadlineReminders: true,
    weeklyReports: false,
    
    // Security Settings
    requireTwoFactorAuth: false,
    sessionTimeout: "60",
    passwordExpiry: "90",
    
    // Budget Settings
    autoApprovalThreshold: "1000",
    budgetPeriodLength: "quarterly",
    allowDraftSaving: true,
    requireJustification: true,
    
    // Display Settings
    theme: "system",
    dateFormat: "MM/dd/yyyy",
    numberFormat: "en-US",
    timezone: "UTC-5",
  });

  const handleSaveSettings = () => {
    // In a real app, this would save to the database
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Configure system preferences and security settings
          </p>
        </div>
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleSettingChange('companyName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscalYearStart">Fiscal Year Start</Label>
              <Select
                value={settings.fiscalYearStart}
                onValueChange={(value) => handleSettingChange('fiscalYearStart', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01-01">January 1</SelectItem>
                  <SelectItem value="04-01">April 1</SelectItem>
                  <SelectItem value="07-01">July 1</SelectItem>
                  <SelectItem value="10-01">October 1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select
                value={settings.defaultCurrency}
                onValueChange={(value) => handleSettingChange('defaultCurrency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetPeriod">Budget Period Length</Label>
              <Select
                value={settings.budgetPeriodLength}
                onValueChange={(value) => handleSettingChange('budgetPeriodLength', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="budgetSubmissionAlerts">Budget Submission Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify when budgets are submitted</p>
              </div>
              <Switch
                id="budgetSubmissionAlerts"
                checked={settings.budgetSubmissionAlerts}
                onCheckedChange={(checked) => handleSettingChange('budgetSubmissionAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="approvalDeadlineReminders">Approval Deadline Reminders</Label>
                <p className="text-sm text-muted-foreground">Remind about pending approvals</p>
              </div>
              <Switch
                id="approvalDeadlineReminders"
                checked={settings.approvalDeadlineReminders}
                onCheckedChange={(checked) => handleSettingChange('approvalDeadlineReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weeklyReports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
              </div>
              <Switch
                id="weeklyReports"
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireTwoFactorAuth">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
              </div>
              <Switch
                id="requireTwoFactorAuth"
                checked={settings.requireTwoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange('requireTwoFactorAuth', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
              <Input
                id="passwordExpiry"
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => handleSettingChange('passwordExpiry', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Budget Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="autoApprovalThreshold">Auto-Approval Threshold ($)</Label>
              <Input
                id="autoApprovalThreshold"
                type="number"
                value={settings.autoApprovalThreshold}
                onChange={(e) => handleSettingChange('autoApprovalThreshold', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Budgets below this amount will be auto-approved
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowDraftSaving">Allow Draft Saving</Label>
                <p className="text-sm text-muted-foreground">Users can save incomplete budgets</p>
              </div>
              <Switch
                id="allowDraftSaving"
                checked={settings.allowDraftSaving}
                onCheckedChange={(checked) => handleSettingChange('allowDraftSaving', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireJustification">Require Justification</Label>
                <p className="text-sm text-muted-foreground">Business justification required for all budgets</p>
              </div>
              <Switch
                id="requireJustification"
                checked={settings.requireJustification}
                onCheckedChange={(checked) => handleSettingChange('requireJustification', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Display & Format
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => handleSettingChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value) => handleSettingChange('dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberFormat">Number Format</Label>
              <Select
                value={settings.numberFormat}
                onValueChange={(value) => handleSettingChange('numberFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">US (1,234.56)</SelectItem>
                  <SelectItem value="en-GB">UK (1,234.56)</SelectItem>
                  <SelectItem value="de-DE">German (1.234,56)</SelectItem>
                  <SelectItem value="fr-FR">French (1 234,56)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => handleSettingChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                  <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                  <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                  <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="UTC+0">UTC</SelectItem>
                  <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Application Version:</span>
              <span className="font-medium">v2.1.0</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database Version:</span>
              <span className="font-medium">PostgreSQL 15.3</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="font-medium">2024-01-19</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment:</span>
              <span className="font-medium">Production</span>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Export Configuration
              </Button>
              <Button variant="outline" className="w-full">
                Import Configuration
              </Button>
              <Button variant="destructive" className="w-full">
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}