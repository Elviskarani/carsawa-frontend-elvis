'use client';

import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Mail, Lock, Phone, Loader2 } from 'lucide-react';
import { registerUser, loginUser, TokenManager } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  redirectToAccount?: boolean; // New prop to control redirect
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  redirectToAccount = false 
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    if (isSignUp) {
      if (!formData.fullName.trim()) {
        setError('Full name is required');
        return false;
      }
      if (!formData.phone.trim()) {
        setError('Phone number is required');
        return false;
      }
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
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
    setError(null);

    try {
      if (isSignUp) {
        // Sign up
        const userData = {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        };
        
        const response = await registerUser(userData);
        
        // Store token with remember me preference
        TokenManager.setToken(response.token, formData.rememberMe);
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
        
        console.log('User registered successfully:', response);
        
        // Show success message briefly before redirect
        setError(null);
        
        // Close modal first
        onClose();
        
        // Redirect to account page if specified
        if (redirectToAccount) {
          setTimeout(() => {
            window.location.href = '/account';
          }, 100);
        }
        
      } else {
        // Sign in
        const credentials = {
          email: formData.email,
          password: formData.password
        };
        
        const response = await loginUser(credentials);
        
        // Store token with remember me preference
        TokenManager.setToken(response.token, formData.rememberMe);
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
        
        console.log('User logged in successfully:', response);
        
        // Close modal first
        onClose();
        
        // Redirect to account page if specified
        if (redirectToAccount) {
          setTimeout(() => {
            window.location.href = '/account';
          }, 100);
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Parse error message
      let errorMessage = 'An error occurred. Please try again.';
      
      if (typeof error === 'string') {
        // Extract JSON from error string if it exists
        try {
          const match = error.match(/\{.*\}/);
          if (match) {
            const errorObj = JSON.parse(match[0]);
            errorMessage = errorObj.message || errorMessage;
          } else {
            errorMessage = error;
          }
        } catch {
          errorMessage = error;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      rememberMe: false
    });
    setError(null);
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      rememberMe: false
    });
    setError(null);
    setIsSignUp(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm" style={{backgroundColor: 'rgba(0, 0, 0, 0.70)'}}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Left side - Features */}
          <div className="bg-[#272D3C] text-white p-8 w-1/2 hidden md:block">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Largest Car Marketplace</h3>
                  <p className="text-blue-100">Buy used cars with trust and transparency</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Fast And Safe Selling</h3>
                  <p className="text-blue-100">We Handle the selling hustle free</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Personalized Experience</h3>
                  <p className="text-blue-100">Access your account, save favorites, and track your activities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full md:w-1/2 p-8 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X size={24} />
            </button>

            <div className="max-w-md mx-auto">
              {/* Progress indicator */}
              <div className="mb-8">
                <div className="w-16 h-1 bg-[#c1ff72] rounded"></div>
              </div>

              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {isSignUp 
                  ? 'Sign up to access your personalized car marketplace experience' 
                  : 'Sign in to your account to continue'
                }
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignUp && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter Full Name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                      required
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                    required
                  />
                </div>

                {isSignUp && (
                  <div className="relative">
                    <div className="flex">
                      <div className="flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50">
                        <img src="https://flagcdn.com/w20/ke.png" alt="KE" className="w-5 h-3 mr-2" />
                        <span className="text-sm text-gray-600">+254</span>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {!isSignUp && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="mr-2"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-600">Remember Me</span>
                    </label>
                    <a href="#" className="text-sm text-blue-600 hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                )}

                {isSignUp && (
                  <>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="mr-2"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-600">Remember Me</span>
                    </label>
                    
                    <p className="text-sm text-gray-600">
                      By clicking Sign Up Button, you agree to our{' '}
                      <a href="#" className="text-blue-600 hover:underline">Terms of Use</a>
                      {' '}and{' '}
                      <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </p>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </button>

                <p className="text-center text-sm text-gray-600">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-blue-600 hover:underline font-medium"
                    disabled={isLoading}
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;