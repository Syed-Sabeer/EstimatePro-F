import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/api';

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      toast({ 
        variant: 'destructive', 
        title: 'Invalid reset link', 
        description: 'The password reset link is invalid or has expired.' 
      });
      navigate('/auth?tab=login');
    }
  }, [token, email, navigate, toast]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (password !== passwordConfirmation) {
      toast({ 
        variant: 'destructive', 
        title: 'Passwords do not match', 
        description: 'Please make sure both password fields match.' 
      });
      return;
    }

    if (password.length < 6) {
      toast({ 
        variant: 'destructive', 
        title: 'Password too short', 
        description: 'Password must be at least 6 characters long.' 
      });
      return;
    }

    setLoading(true);
    
    try {
      const resetData = {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      };

      await authAPI.resetPassword(resetData);
      
      toast({ 
        title: 'Password reset successful!', 
        description: 'Your password has been reset. You can now log in with your new password.' 
      });
      
      navigate('/auth?tab=login');
      
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error resetting password', 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  disabled 
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter new password"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-confirmation">Confirm New Password</Label>
                <Input 
                  id="password-confirmation" 
                  type="password" 
                  value={passwordConfirmation} 
                  onChange={(e) => setPasswordConfirmation(e.target.value)} 
                  placeholder="Confirm new password"
                  required 
                />
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</> : 'Reset Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 