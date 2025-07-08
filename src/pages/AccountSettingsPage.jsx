import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Edit, KeyRound, Building, User, Mail, Phone, Bell, CreditCard, XCircle, Upload, Calendar, MapPin, Camera } from 'lucide-react';

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
  const fileInputRef = useRef(null);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    business_name: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    bio: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    facebook_profile: '',
    instagram_profile: '',
    profile_picture: null
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log('Fetching profile for user ID:', user.id);
      const profileData = await profileAPI.getProfile();
      console.log('Fetched profile data:', profileData);
      
      if (profileData) {
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          business_name: profileData.business_name || '',
          phone_number: profileData.phone_number || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          zip_code: profileData.zip_code || '',
          country: profileData.country || '',
          bio: profileData.bio || '',
          date_of_birth: profileData.date_of_birth || '',
          gender: profileData.gender || '',
          marital_status: profileData.marital_status || '',
          facebook_profile: profileData.facebook_profile || '',
          instagram_profile: profileData.instagram_profile || '',
          profile_picture: profileData.profile_picture
        });
        
        console.log('Profile state updated with:', {
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          business_name: profileData.business_name || '',
          phone_number: profileData.phone_number || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          zip_code: profileData.zip_code || '',
          country: profileData.country || '',
          bio: profileData.bio || '',
          date_of_birth: profileData.date_of_birth || '',
          gender: profileData.gender || '',
          marital_status: profileData.marital_status || '',
          facebook_profile: profileData.facebook_profile || '',
          instagram_profile: profileData.instagram_profile || '',
          profile_picture: profileData.profile_picture
        });
        
        // Set profile picture preview if exists
        if (profileData.profile_picture) {
          setProfilePicturePreview(profileData.profile_picture);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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
      // Prepare profile data for Laravel API
      const profileData = {
        user_id: user.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        business_name: profile.business_name || '',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zip_code: profile.zip_code || '',
        country: profile.country || '',
        bio: profile.bio || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        marital_status: profile.marital_status || '',
        facebook_profile: profile.facebook_profile || '',
        instagram_profile: profile.instagram_profile || '',
      };

      console.log('User ID being sent:', user.id);
      console.log('Submitting profile data:', profileData);
      console.log('Profile picture file:', profilePictureFile);

      // Update profile using Laravel API
      const updatedProfile = await profileAPI.updateProfile(profileData, profilePictureFile);
      
      console.log('Received updated profile:', updatedProfile);

      // Refresh profile data from server to ensure we have the latest data
      console.log('Refreshing profile data from server...');
      await fetchProfile();

      // Clear profile picture file state
      if (profilePictureFile) {
        setProfilePictureFile(null);
      }
      
      toast({ title: 'Profile updated successfully!' });
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast({ variant: 'destructive', title: 'Error updating profile', description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e, setStateFunc) => {
    const { id, value } = e.target;
    setStateFunc(prev => ({...prev, [id]: value}));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePicturePreview(previewUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
                <CardDescription>Keep your personal and business details up to date.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setIsEditingProfile(!isEditingProfile)}>
                {isEditingProfile ? <XCircle className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                {isEditingProfile ? 'Cancel' : 'Edit Profile'}
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {profilePicturePreview ? (
                        <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    {isEditingProfile && (
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="absolute -bottom-2 -right-2 bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{profile.first_name} {profile.last_name}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-sm text-gray-500">{user?.role?.name} Account</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </div>

                {/* Personal Information */}
                <div>
                  <h4 className="text-md font-medium mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditingProfile ? (
                      <>
                        <div>
                          <Label htmlFor="first_name">First Name</Label>
                          <Input id="first_name" value={profile.first_name} onChange={(e) => handleInputChange(e, setProfile)} placeholder="John" />
                        </div>
                        <div>
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input id="last_name" value={profile.last_name} onChange={(e) => handleInputChange(e, setProfile)} placeholder="Doe" />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" value={user?.email} disabled className="bg-gray-50" />
                        </div>
                        <div>
                          <Label htmlFor="phone_number">Phone Number</Label>
                          <Input id="phone_number" value={profile.phone_number} onChange={(e) => handleInputChange(e, setProfile)} placeholder="+1 (555) 123-4567" />
                        </div>
                        {/* <div>
                          <Label htmlFor="date_of_birth">Date of Birth</Label>
                          <Input id="date_of_birth" type="date" value={profile.date_of_birth} onChange={(e) => handleInputChange(e, setProfile)} />
                        </div>
                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <Input id="gender" value={profile.gender} onChange={(e) => handleInputChange(e, setProfile)} placeholder="Male/Female/Other" />
                        </div> */}
                      </>
                    ) : (
                      <>
                        <InfoField icon={<User className="h-4 w-4 text-muted-foreground" />} label="First Name" value={profile.first_name} />
                        <InfoField icon={<User className="h-4 w-4 text-muted-foreground" />} label="Last Name" value={profile.last_name} />
                        <InfoField icon={<Mail className="h-4 w-4 text-muted-foreground" />} label="Email Address" value={user?.email} />
                        <InfoField icon={<Phone className="h-4 w-4 text-muted-foreground" />} label="Phone Number" value={profile.phone_number} />
                        {/* <InfoField icon={<Calendar className="h-4 w-4 text-muted-foreground" />} label="Date of Birth" value={profile.date_of_birth} />
                        <InfoField icon={<User className="h-4 w-4 text-muted-foreground" />} label="Gender" value={profile.gender} /> */}
                      </>
                    )}
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h4 className="text-md font-medium mb-4">Business Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isEditingProfile ? (
                    <>
                        <div className="md:col-span-2">
                          <Label htmlFor="business_name">Business Name</Label>
                          <Input id="business_name" value={profile.business_name} onChange={(e) => handleInputChange(e, setProfile)} placeholder="Builder Co. Construction" />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="bio">Business Website</Label>
                          <input 
                            id="bio" 
                            value={profile.bio} 
                            onChange={(e) => handleInputChange(e, setProfile)} 
                            placeholder="Enter URL"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            rows={3}
                          />
                        </div>
                    </>
                  ) : (
                    <>
                      <InfoField icon={<Building className="h-4 w-4 text-muted-foreground" />} label="Business Name" value={profile.business_name} />
                        <div className="md:col-span-2">
                          <InfoField icon={<User className="h-4 w-4 text-muted-foreground" />} label="Business Website" value={profile.bio} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                {/* <div>
                  <h4 className="text-md font-medium mb-4">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditingProfile ? (
                      <>
                        <div className="md:col-span-2">
                          <Label htmlFor="address">Street Address</Label>
                          <Input id="address" value={profile.address} onChange={(e) => handleInputChange(e, setProfile)} placeholder="123 Main Street" />
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input id="city" value={profile.city} onChange={(e) => handleInputChange(e, setProfile)} placeholder="New York" />
                        </div>
                        <div>
                          <Label htmlFor="state">State/Province</Label>
                          <Input id="state" value={profile.state} onChange={(e) => handleInputChange(e, setProfile)} placeholder="NY" />
                        </div>
                        <div>
                          <Label htmlFor="zip_code">ZIP/Postal Code</Label>
                          <Input id="zip_code" value={profile.zip_code} onChange={(e) => handleInputChange(e, setProfile)} placeholder="10001" />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input id="country" value={profile.country} onChange={(e) => handleInputChange(e, setProfile)} placeholder="USA" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="md:col-span-2">
                          <InfoField icon={<MapPin className="h-4 w-4 text-muted-foreground" />} label="Address" value={profile.address} />
                        </div>
                        <InfoField icon={<MapPin className="h-4 w-4 text-muted-foreground" />} label="City" value={profile.city} />
                        <InfoField icon={<MapPin className="h-4 w-4 text-muted-foreground" />} label="State" value={profile.state} />
                        <InfoField icon={<MapPin className="h-4 w-4 text-muted-foreground" />} label="ZIP Code" value={profile.zip_code} />
                        <InfoField icon={<MapPin className="h-4 w-4 text-muted-foreground" />} label="Country" value={profile.country} />
                      </>
                    )}
                  </div>
                </div> */}

                {/* Social Media */}
                {/* <div>
                  <h4 className="text-md font-medium mb-4">Social Media</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditingProfile ? (
                      <>
                        <div>
                          <Label htmlFor="facebook_profile">Facebook Profile</Label>
                          <Input id="facebook_profile" value={profile.facebook_profile} onChange={(e) => handleInputChange(e, setProfile)} placeholder="https://facebook.com/yourprofile" />
                        </div>
                        <div>
                          <Label htmlFor="instagram_profile">Instagram Profile</Label>
                          <Input id="instagram_profile" value={profile.instagram_profile} onChange={(e) => handleInputChange(e, setProfile)} placeholder="https://instagram.com/yourprofile" />
                        </div>
                      </>
                    ) : (
                      <>
                        <InfoField icon={<Phone className="h-4 w-4 text-muted-foreground" />} label="Facebook" value={profile.facebook_profile} />
                        <InfoField icon={<Phone className="h-4 w-4 text-muted-foreground" />} label="Instagram" value={profile.instagram_profile} />
                    </>
                  )}
                </div>
                </div> */}

                {isEditingProfile && (
                  <div className="pt-6 border-t">
                    <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600">
                      {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
             <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your password and security settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center">
                    <KeyRound className="h-5 w-5 text-orange-600 mr-2" />
                  <div>
                      <p className="text-sm font-medium text-gray-800">Password Protection</p>
                      <p className="text-xs text-muted-foreground">Last changed: Not available</p>
                    </div>
                  </div>
                  </div>
                <Button variant="outline" className="w-full justify-start" onClick={handleFeatureClick}>
                  <KeyRound className="mr-2 h-4 w-4"/> Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleFeatureClick}>
                  <Bell className="mr-2 h-4 w-4"/> Two-Factor Authentication
                  </Button>
              </CardContent>
          </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
                <CardDescription>Manage your subscription plan and billing information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-800">Current Plan: <span className="font-bold text-orange-600">Trial Period</span></p>
                  <p className="text-xs text-muted-foreground mt-1">90-day trial active</p>
                  <p className="text-xs text-muted-foreground mt-1">Price: $0.00/month</p>
                </div>
                <Button variant="outline" className="w-full justify-start" onClick={handleFeatureClick}>
                  <CreditCard className="mr-2 h-4 w-4"/> Upgrade Plan
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleFeatureClick}>
                  <Bell className="mr-2 h-4 w-4"/> Billing History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AccountSettingsPage;