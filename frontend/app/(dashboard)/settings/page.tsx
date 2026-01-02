'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Camera, Loader2, Save, Trash2, User, Mail, 
  Building, MapPin, Globe, Shield, ChevronRight, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function ProfileSettingsPage() {
  const { user } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'STUDENT',
    bio: '',
    organization: '',
    location: '',
    website: '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success('Profile updated successfully!');
    setIsSaving(false);
  };

  const getInitials = (name: string) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';
  };

  return (
    <div className="flex h-screen bg-[#171717]/90 text-slate-200 font-sans selection:bg-teal-500/30">
      {/* 2. Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#171717]/90">
        <div className="p-8 max-w-5xl mx-auto w-full space-y-8 pb-20">
            
            {/* --- Profile Banner & Avatar --- */}
            <div className="relative group">
                {/* Banner Placeholder */}
                <div className="h-32 w-full bg-gradient-to-r from-teal-900/20 to-indigo-900/20 rounded-xl border border-white/5 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
                    <Button size="sm" variant="secondary" className="absolute right-4 top-4 bg-black/40 hover:bg-black/60 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-3 h-3 mr-2" /> Change Cover
                    </Button>
                </div>

                {/* Avatar Section */}
                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                    <div className="relative">
                        <Avatar className="w-24 h-24 border-4 border-[#171717] bg-[#151921] shadow-xl">
                            <AvatarFallback className="bg-[#151921] text-teal-500 text-2xl font-bold">
                                {getInitials(formData.name)}
                            </AvatarFallback>
                        </Avatar>
                        <button className="absolute bottom-0 right-0 p-1.5 bg-teal-600 text-white rounded-full border-4 border-[#171717] hover:bg-teal-500 transition-colors shadow-sm">
                            {}<Camera className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="mb-3 space-y-1">
                        <h1 className="text-2xl font-bold text-white">{formData.name || 'User Name'}</h1>
                        <p className="text-sm text-slate-500">{formData.role ? formData.role.charAt(0) + formData.role.slice(1).toLowerCase().replace('_', ' ') : 'Researcher'}</p>
                    </div>
                </div>
            </div>

            {/* Spacer for avatar overlap */}
            <div className="h-8" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COL: Core Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-[#151921] border-white/5 shadow-none">
                        <CardHeader className="pb-4 border-b border-white/5">
                            <CardTitle className="text-base text-slate-200">Personal Information</CardTitle>
                            <CardDescription className="text-slate-500 text-xs">This information will be displayed on your public researcher profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                        <Input 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="pl-9 bg-[#0B0E14] border-white/10 text-slate-200 focus-visible:ring-teal-500/50" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                        <Input 
                                            value={formData.email} 
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="pl-9 bg-[#0B0E14] border-white/10 text-slate-200 focus-visible:ring-teal-500/50" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase">Bio</Label>
                                <Textarea 
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    className="bg-[#0B0E14] border-white/10 text-slate-200 min-h-[120px] resize-none focus-visible:ring-teal-500/50"
                                    placeholder="Brief description of your research interests..."
                                />
                                <p className="text-[10px] text-slate-500 text-right">{formData.bio.length}/500 characters</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#151921] border-white/5 shadow-none">
                         <CardHeader className="pb-4 border-b border-white/5">
                            <CardTitle className="text-base text-slate-200">Academic Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase">Organization / University</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                        <Input 
                                            value={formData.organization}
                                            onChange={(e) => setFormData({...formData, organization: e.target.value})}
                                            className="pl-9 bg-[#0B0E14] border-white/10 text-slate-200 focus-visible:ring-teal-500/50"
                                            placeholder="e.g. MIT" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase">Location</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                        <Input 
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                            className="pl-9 bg-[#0B0E14] border-white/10 text-slate-200 focus-visible:ring-teal-500/50" 
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase">Website / Portfolio</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                    <Input 
                                        value={formData.website}
                                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                                        className="pl-9 bg-[#0B0E14] border-white/10 text-slate-200 focus-visible:ring-teal-500/50" 
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COL: Settings & Role */}
                <div className="space-y-6">
                    <Card className="bg-[#151921] border-white/5 shadow-none h-fit">
                        <CardHeader className="pb-4 border-b border-white/5">
                            <CardTitle className="text-base text-slate-200">Account Role</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                             <div className="bg-[#0B0E14] p-4 rounded-lg border border-white/10 flex items-start gap-3">
                                <Shield className="w-5 h-5 text-teal-500 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-slate-200">Current Permissions</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        You have <strong>{formData.role.toLowerCase()}</strong> access. Contact your lab administrator to upgrade your role.
                                    </p>
                                </div>
                             </div>

                             <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase">Primary Role</Label>
                                <Select 
                                    value={formData.role} 
                                    onValueChange={(val) => setFormData({...formData,
                                      // @ts-ignore
                                      role: val})}
                                >
                                    <SelectTrigger className="bg-[#0B0E14] border-white/10 text-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#151921] border-white/10 text-slate-200">
                                        <SelectItem value="STUDENT">Student Researcher</SelectItem>
                                        <SelectItem value="FACULTY">Faculty Member</SelectItem>
                                        <SelectItem value="LAB_MANAGER">Lab Manager</SelectItem>
                                        <SelectItem value="COLLABORATOR">External Collaborator</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </CardContent>
                    </Card>

                    <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 space-y-4">
                        <h4 className="text-sm font-medium text-red-400">Danger Zone</h4>
                        <p className="text-xs text-red-400/60 leading-relaxed">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button variant="destructive" size="sm" className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/30">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                        </Button>
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}