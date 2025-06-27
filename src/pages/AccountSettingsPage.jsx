import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Edit, KeyRound, Building, User, Mail, Phone, Bell, CreditCard, XCircle } from 'lucide-react';

const InfoField = ({ icon, label, value }) => (
  <div>
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <div className="flex items-center mt-1">
      {icon}
      <p className="ml-3 text-sm">{value || 'Not set'}</p>
    </div>
  </div>
);

const AccountSettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState({ full_name: '', business_name: '', phone_number: '' });
  const [password, setPassword] = useState({ new_password: '', confirm_password: '' });
  const [subscription, setSubscription] = useState({ status: '', trial_ends_at: null });

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('builders').select('full_name, business_name, phone_number, subscription_status, trial_ends_at').eq('id', user.id).single();
      if (error) throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          business_name: data.business_name || '',
          phone_number: data.phone_number || '',
        });
        setSubscription({
            status: data.subscription_status,
            trial_ends_at: data.trial_ends_at
        });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error fetching profile', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.updateUser({
        data: { full_name: profile.full_name }
      });
      if(authError) throw authError;

      const { error: dbError } = await supabase.from('builders').update({
        full_name: profile.full_name,
        business_name: profile.business_name,
        phone_number: profile.phone_number,
      }).eq('id', user.id);
      if(dbError) throw dbError;
      
      toast({ title: 'Profile updated successfully!' });
      setIsEditingProfile(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error updating profile', description: error.message });
    } finally {
      setSaving(false);
    }
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (password.new_password !== password.confirm_password) {
      toast({ variant: 'destructive', title: 'Passwords do not match.' });
      return;
    }
    if (password.new_password.length < 6) {
      toast({ variant: 'destructive', title: 'Password must be at least 6 characters long.' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password.new_password });
      if (error) throw error;
      toast({ title: 'Password updated successfully!' });
      setPassword({ new_password: '', confirm_password: '' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error updating password', description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e, setStateFunc) => {
    const { id, value } = e.target;
    setStateFunc(prev => ({...prev, [id]: value}));
  };

  const handleFeatureClick = () => toast({ title: "🚧 Feature not implemented yet!" });

  if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;

  return (
    <>
      <Helmet><title>Account Settings - EstiMate Pro</title></Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your personal details, security settings, and subscription plan.</p>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Keep your business and contact details up to date.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setIsEditingProfile(!isEditingProfile)}>
                {isEditingProfile ? <XCircle className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                {isEditingProfile ? 'Cancel' : 'Edit Profile'}
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isEditingProfile ? (
                    <>
                      <div><Label htmlFor="business_name">Business Name</Label><Input id="business_name" value={profile.business_name} onChange={(e) => handleInputChange(e, setProfile)} placeholder="Builder Co. Construction" /></div>
                      <div><Label htmlFor="full_name">Your Name</Label><Input id="full_name" value={profile.full_name} onChange={(e) => handleInputChange(e, setProfile)} placeholder="John Builder" /></div>
                      <div><Label htmlFor="email">Email Address</Label><Input id="email" value={user.email} disabled /></div>
                      <div><Label htmlFor="phone_number">Phone Number</Label><Input id="phone_number" value={profile.phone_number} onChange={(e) => handleInputChange(e, setProfile)} placeholder="+1 (555) 123-4567" /></div>
                    </>
                  ) : (
                    <>
                      <InfoField icon={<Building className="h-4 w-4 text-muted-foreground" />} label="Business Name" value={profile.business_name} />
                      <InfoField icon={<User className="h-4 w-4 text-muted-foreground" />} label="Your Name" value={profile.full_name} />
                      <InfoField icon={<Mail className="h-4 w-4 text-muted-foreground" />} label="Email Address" value={user.email} />
                      <InfoField icon={<Phone className="h-4 w-4 text-muted-foreground" />} label="Phone Number" value={profile.phone_number} />
                    </>
                  )}
                </div>
                {isEditingProfile && (
                  <div className="mt-6">
                    <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password regularly to keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-sm">
                  <div>
                    <Label htmlFor="new_password">New Password</Label>
                    <div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" id="new_password" value={password.new_password} onChange={(e) => handleInputChange(e, setPassword)} className="pl-9" /></div>
                  </div>
                   <div>
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                     <div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" id="confirm_password" value={password.confirm_password} onChange={(e) => handleInputChange(e, setPassword)} className="pl-9" /></div>
                  </div>
                  <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />} Update Password
                  </Button>
                </form>
              </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader><CardTitle>Billing & Subscription</CardTitle><CardDescription>Manage your payment details and subscription plan.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-800">Current Plan: <span className="font-bold text-orange-600">{subscription.status === 'trial' ? 'Trial Period' : 'Pro Builder Monthly'}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {subscription.status === 'trial' ? `Trial ends on: ${new Date(subscription.trial_ends_at).toLocaleDateString()}` : `Next billing date: July 16, 2025`}
                  </p>
                   <p className="text-xs text-muted-foreground mt-1">Price: {subscription.status === 'trial' ? '$0.00/month' : '$49.00/month'}</p>
                </div>
                <Button variant="outline" className="w-full justify-start" onClick={handleFeatureClick}><CreditCard className="mr-2 h-4 w-4"/> Manage Payment Methods</Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={handleFeatureClick}><XCircle className="mr-2 h-4 w-4"/> Cancel Subscription</Button>
              </CardContent>
            </Card>

             <Card>
              <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Choose how you receive updates and alerts.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-between" onClick={handleFeatureClick}>Email Notifications for New Leads <span className="text-muted-foreground text-xs flex items-center"><Bell className="mr-1 h-3 w-3" />Configure</span></Button>
                  <Button variant="outline" className="w-full justify-between" onClick={handleFeatureClick}>SMS Alerts for Urgent Updates <span className="text-muted-foreground text-xs flex items-center"><Bell className="mr-1 h-3 w-3" />Configure</span></Button>
                  <Button variant="outline" className="w-full justify-between" onClick={handleFeatureClick}>In-App Project Update Summaries <span className="text-muted-foreground text-xs flex items-center"><Bell className="mr-1 h-3 w-3" />Configure</span></Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AccountSettingsPage;