"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Loader2, AlertCircle } from 'lucide-react';
import { getUserProfile, updateUserProfile, logoutUser, TokenManager, isAuthenticated } from '../services/api';
import type { User as UserType, UpdateProfileData } from '../services/api';
import FavoritesGrid from '@/app/components/FavouritesGrid';
import AuthModal from '@/app/components/Authmodal';
import UserListingsGrid from '@/app/components/UserListingGrid';

const EditProfilePage = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites'>('listings');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    bio: ''
  });

  // Also update the useEffect to handle authentication properly
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!isAuthenticated()) {
          // Don't set error here, let the component render the auth prompt
          setIsLoading(false);
          return;
        }

        const userData = await getUserProfile();
        setUser(userData);
        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          email: userData.email || '',
          bio: '' // Add bio to your User interface if needed
        });
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        // Check if error is due to invalid token
        if (error.includes('401') || error.includes('unauthorized') || error.includes('token')) {
          // Token might be expired, clear it and prompt for login
          TokenManager.removeToken();
          setUser(null);
        } else {
          setError('Failed to load profile data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear messages when user starts editing
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updateData: UpdateProfileData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email
      };

      const updatedUser = await updateUserProfile(updateData);
      setUser(updatedUser);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        bio: ''
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleUploadPicture = () => {
    console.log('Upload new picture');
    // Implement image upload logic
  };

  const handleRemovePicture = () => {
    console.log('Remove picture');
    // Implement remove picture logic
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Redirect to home page or login page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout by clearing token
      TokenManager.removeToken();
      window.location.href = '/';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state - not authenticated
  if (!isAuthenticated() || !user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Please log in to view your profile</p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-[#272d3c] text-white rounded-md hover:bg-[#1f242f] transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            // Refresh the page to fetch user data
            window.location.reload();
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto md:max-w-3xl lg:max-w-4xl xl:max-w-6xl bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="border-b pb-4 mb-6">
          <div className="w-12 h-1 bg-blue-600 mb-4"></div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEditing ? 'Edit Profile' : 'My Profile'}
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
          {isEditing && (
            <div className="flex gap-3 ml-auto">
              <button
                onClick={handleUploadPicture}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Upload New Picture
              </button>
              <button
                onClick={handleRemovePicture}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Personal Details Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h2>

          <div className="space-y-4">
            {/* Name Field */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                placeholder="Full Name"
              />
            </div>

            {/* Phone Field */}
            <div className="flex">
              <div className="flex items-center px-3 border border-gray-200 border-r-0 rounded-l-md bg-gray-50">
                <img src="https://flagcdn.com/w20/ke.png" alt="KE" className="w-5 h-3 mr-2" />
                <span className="text-sm text-gray-600">+254</span>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone.replace('+254', '')}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: '+254' + e.target.value }))}
                disabled={!isEditing}
                className={`flex-1 px-4 py-3 border border-gray-200 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                placeholder="Phone Number"
              />
            </div>

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                placeholder="Email Address"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons - Only show when editing */}
        {isEditing && (
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Tabs Section */}
        <div className="mb-8">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('listings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'listings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Listings
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'favorites'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Favourites
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'listings' && (
              <div>
                <UserListingsGrid />
              </div>
            )}
            {activeTab === 'favorites' && (
              <div>
                <FavoritesGrid />
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;