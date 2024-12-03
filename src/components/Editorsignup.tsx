import React, { useState } from 'react';
import { AlertCircle, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SignupFormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const EditorSignup: React.FC = () => {
  const [signupData, setSignupData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (signupData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(signupData.mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/editor/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setSuccess(true);
      // Optionally redirect to login page after successful signup
      // navigate('/editor/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription className="text-green-600">
              Account created successfully! You can now login with your credentials.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md font-poppins">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create Editor Account</CardTitle>
        <CardDescription className="text-center text-gray-500">
          Enter your details to create an editor account
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-gray-700 block">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={signupData.firstName}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="John"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-gray-700 block">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={signupData.lastName}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700 block">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                required
                value={signupData.mobileNumber}
                onChange={handleChange}
                className="pl-10"
                placeholder="1234567890"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={signupData.email}
                onChange={handleChange}
                className="pl-10"
                placeholder="editor@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={signupData.password}
                onChange={handleChange}
                className="pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 block">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={signupData.confirmPassword}
                onChange={handleChange}
                className="pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditorSignup;