'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    experimentUpdates: true,
    commentMentions: true,
    paperAdded: false,
    teamInvites: true,
    weeklyDigest: false,
    experimentReminders: true,
    collaboratorActivity: false,
    systemUpdates: true,
    securityAlerts: true,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success('Notification preferences saved!');
    setIsSaving(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Manage how you receive email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of your team's activity
              </p>
            </div>
            <Switch
              checked={notifications.weeklyDigest}
              onCheckedChange={() => handleToggle('weeklyDigest')}
              disabled={!notifications.emailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Notifications</CardTitle>
          <CardDescription>
            Get notified about activity in your teams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Experiment Updates</Label>
              <p className="text-sm text-muted-foreground">
                When experiments are updated or commented on
              </p>
            </div>
            <Switch
              checked={notifications.experimentUpdates}
              onCheckedChange={() => handleToggle('experimentUpdates')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Comment Mentions</Label>
              <p className="text-sm text-muted-foreground">
                When someone mentions you in a comment
              </p>
            </div>
            <Switch
              checked={notifications.commentMentions}
              onCheckedChange={() => handleToggle('commentMentions')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Paper Added</Label>
              <p className="text-sm text-muted-foreground">
                When new papers are added to your teams
              </p>
            </div>
            <Switch
              checked={notifications.paperAdded}
              onCheckedChange={() => handleToggle('paperAdded')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Collaborator Activity</Label>
              <p className="text-sm text-muted-foreground">
                When collaborators make changes
              </p>
            </div>
            <Switch
              checked={notifications.collaboratorActivity}
              onCheckedChange={() => handleToggle('collaboratorActivity')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Team Notifications</CardTitle>
          <CardDescription>
            Notifications about team membership and invites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Team Invites</Label>
              <p className="text-sm text-muted-foreground">
                When you're invited to join a team
              </p>
            </div>
            <Switch
              checked={notifications.teamInvites}
              onCheckedChange={() => handleToggle('teamInvites')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Experiment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Reminders for experiments you're working on
              </p>
            </div>
            <Switch
              checked={notifications.experimentReminders}
              onCheckedChange={() => handleToggle('experimentReminders')}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>System Notifications</CardTitle>
          <CardDescription>
            Important updates and security alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>System Updates</Label>
              <p className="text-sm text-muted-foreground">
                News about new features and improvements
              </p>
            </div>
            <Switch
              checked={notifications.systemUpdates}
              onCheckedChange={() => handleToggle('systemUpdates')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Important security notifications (recommended)
              </p>
            </div>
            <Switch
              checked={notifications.securityAlerts}
              onCheckedChange={() => handleToggle('securityAlerts')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Default</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
