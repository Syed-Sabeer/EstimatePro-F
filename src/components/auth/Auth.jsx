import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { AUTH_CONFIG } from '@/lib/config';
import { authAPI } from '@/lib/api';

export function Auth() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpFullName, setSignUpFullName] = useState('');

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userData = {
        name: signUpFullName,
      email: signUpEmail,
      password: signUpPassword,
        role_id: AUTH_CONFIG.DEFAULT_ROLE_ID, // Default role_id for regular users
      };

      const response = await register(userData);
      
      toast({ 
        title: 'Success!', 
        description: 'Registration successful! Please check your email for verification.' 
      });
      
      // Clear form
      setSignUpEmail('');
      setSignUpPassword('');
      setSignUpFullName('');
      
      // Navigate to dashboard after successful registration
      navigate('/dashboard');
      
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error signing up', 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUnverifiedUser(null);
    
    try {
      const credentials = {
      email: loginEmail,
      password: loginPassword,
      };

      const response = await login(credentials);
      
      toast({ 
        title: 'Welcome back!', 
        description: 'Successfully logged in.' 
      });
      
      navigate('/dashboard');
      
    } catch (error) {
      if (error.status === 403 && error.message === 'Email not verified') {
        setUnverifiedUser(error.user);
        toast({ 
          variant: 'destructive', 
          title: 'Email not verified', 
          description: 'Please check your email and click the verification link to complete your account setup.' 
        });
      } else {
        toast({ 
          variant: 'destructive', 
          title: 'Error logging in', 
          description: error.message 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedUser) return;
    
    setResendingVerification(true);
    try {
      await authAPI.sendVerificationEmail();
      toast({ 
        title: 'Verification email sent!', 
        description: 'Please check your email for the verification link.' 
      });
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Failed to send verification email. Please try again.' 
      });
    } finally {
      setResendingVerification(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authAPI.forgotPassword(forgotPasswordEmail);
      toast({ 
        title: 'Password reset email sent!', 
        description: 'Please check your email for the password reset link.' 
      });
      
      // Clear form
      setForgotPasswordEmail('');
      
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="login" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
        <TabsTrigger value="forgot">Forgot Password</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Access your dashboard to manage your leads and estimates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              </div>
              
              {unverifiedUser && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Email Verification Required</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Your account is created but you need to verify your email address to continue.</p>
                      </div>
                      <div className="mt-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={handleResendVerification}
                          disabled={resendingVerification}
                          className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                        >
                          {resendingVerification ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resending...</>
                          ) : (
                            'Resend Verification Email'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create an account to start your free trial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input id="signup-name" placeholder="John Doe" value={signUpFullName} onChange={(e) => setSignUpFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="forgot">
        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input 
                  id="forgot-email" 
                  type="email" 
                  placeholder="" 
                  value={forgotPasswordEmail} 
                  onChange={(e) => setForgotPasswordEmail(e.target.value)} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}