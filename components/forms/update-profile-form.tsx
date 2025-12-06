'use client';

import { getProfile, updateProfile } from '@/actions/profile-actions';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaPhone, 
  FaImage, 
  FaUserEdit, 
  FaUserCircle,
  FaCamera,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSave,
  FaEdit,
  FaTrash,
  FaLock
} from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';

// Define the Profile interface matching your Appwrite schema
interface Profile {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  name: string;
  dob: string;
  phone?: string;
  image?: string;
  role: string;
  author_id: string;
}

// Improved helper function to safely convert any data to Profile type
function mapToProfile(data: any): Profile | null {
  if (!data) return null;
  
  console.log('Mapping profile data:', data); // Debug log
  
  try {
    return {
      $id: data.$id || '',
      $collectionId: data.$collectionId || '',
      $databaseId: data.$databaseId || '',
      $createdAt: data.$createdAt || '',
      $updatedAt: data.$updatedAt || '',
      $permissions: data.$permissions || [],
      name: data.name || '',
      dob: data.dob || '',
      phone: data.phone || '',
      image: data.image || '',
      role: data.role || 'reader',
      author_id: data.author_id || '',
    };
  } catch (error) {
    console.error('Error mapping profile data:', error);
    return null;
  }
}

// Improved date formatting function
function formatDateForInput(dateString: string): string {
  if (!dateString) return '';
  
  try {
    // Handle different date formats
    let date: Date;
    
    if (dateString.includes('T')) {
      // ISO format
      date = new Date(dateString);
    } else {
      // Try parsing as simple date string
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return '';
    }
    
    // Format to YYYY-MM-DD for HTML date input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return '';
  }
}

// Helper function to format date for display
function formatDateForDisplay(dateString: string): string {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
}

export default function UpdateProfileForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    phone: '',
    role: 'reader'
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [removeImage, setRemoveImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setMessage(null);
      
      console.log('Loading profile...'); // Debug log
      
      const result = await getProfile();
      
      console.log('Profile API Response:', result); // Debug log
      
      if (result.success) {
        if (result.data) {
          // Use the safe mapping function instead of direct type assertion
          const profileData = mapToProfile(result.data);
          console.log('Mapped Profile Data:', profileData); // Debug log
          
          if (profileData) {
            setProfile(profileData);
            
            // Format the date for the input field
            const formattedDob = formatDateForInput(profileData.dob);
            console.log('Formatted DOB for input:', formattedDob, 'Original DOB:', profileData.dob); // Debug log
            
            setFormData({
              name: profileData.name || '',
              dob: formattedDob,
              phone: profileData.phone || '',
              role: profileData.role || 'reader'
            });
            
            if (profileData.image) {
              setImagePreview(profileData.image);
            }
            
            console.log('Form data set:', { // Debug log
              name: profileData.name,
              dob: formattedDob,
              role: profileData.role,
              phone: profileData.phone
            });
          } else {
            setMessage({ type: 'error', text: 'Failed to process profile data' });
          }
        } else {
          console.log('No profile data found - user needs to create profile');
          setMessage({ type: 'error', text: 'No profile found. Please create a profile first.' });
        }
      } else {
        console.error('Profile API error:', result.message);
        setMessage({ type: 'error', text: result.message || 'Failed to load profile' });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred while loading profile' });
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate >= today) {
        newErrors.dob = 'Date of birth must be in the past';
      }
    }

    if (formData.role === 'writer' && !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required for writers';
    } else if (formData.role === 'writer' && formData.phone.trim()) {
      const phoneRegex = /^\+?[\d\s-()]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Image is optional for updates, only validate if new image is being uploaded
    if (image && image.size > 5 * 1024 * 1024) {
      newErrors.image = 'Image must be less than 5MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Don't allow role changes
    if (name === 'role') {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setImage(file);
      setRemoveImage(false);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      if (!profile?.image) {
        setImagePreview('');
      }
    }
    
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeCurrentImage = () => {
    setImage(null);
    setImagePreview('');
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const restoreOriginalImage = () => {
    if (profile?.image) {
      setImagePreview(profile.image);
      setRemoveImage(false);
      setImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors in the form' });
      return;
    }

    if (!profile) {
      setMessage({ type: 'error', text: 'No profile found to update' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('dob', formData.dob);
      data.append('role', formData.role); // Keep the existing role
      
      if (formData.role === 'writer') {
        data.append('phone', formData.phone.trim());
      } else {
        // Clear phone if switching from writer to reader (shouldn't happen with disabled role)
        data.append('phone', '');
      }
      
      if (image) {
        data.append('img', image);
      }
      
      if (removeImage) {
        data.append('removeImage', 'true');
      }

      console.log('Submitting form data:', { // Debug log
        name: formData.name,
        dob: formData.dob,
        role: formData.role,
        phone: formData.phone,
        hasImage: !!image,
        removeImage
      });

      const result = await updateProfile(profile.$id, data);

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Profile updated successfully! Redirecting to profile page...' 
        });
        
        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
        
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to original profile data
  const handleReset = () => {
    if (profile) {
      const formattedDob = formatDateForInput(profile.dob);
      
      setFormData({
        name: profile.name || '',
        dob: formattedDob,
        phone: profile.phone || '',
        role: profile.role || 'reader'
      });
      setImage(null);
      setImagePreview(profile.image || '');
      setRemoveImage(false);
      setErrors({});
      setMessage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-green-100 dark:border-green-900 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-4">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-red-100 dark:border-red-900 p-8 text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Profile Found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">You need to create a profile first.</p>
          <button
            onClick={() => window.location.href = '/authDashboard/profile/create'}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-green-100 dark:border-gray-800">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
          <FaUserEdit className="text-2xl text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Update Your Profile</h2>
        <p className="text-gray-600 dark:text-gray-300">Make changes to your profile information</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Role Selection - DISABLED */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <label htmlFor="role" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <FaLock className="text-green-500 mr-2" />
            Your Role (Cannot be changed)
          </label>
          <div className="relative">
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              disabled
              className="w-full px-4 py-3 pl-11 border border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 rounded-xl cursor-not-allowed text-gray-500 dark:text-gray-400"
            >
              <option value="reader">📖 Reader - Browse and read content</option>
              <option value="writer">✍️ Writer - Create and publish content</option>
            </select>
            <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <FaLock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              🔒 Your role cannot be changed after profile creation. 
              {formData.role === 'reader' 
                ? ' As a Reader, you can explore and enjoy all the amazing content on our platform.' 
                : ' As a Writer, you can create, publish, and share your stories with the community.'}
            </p>
          </div>
        </div>

        {/* Name Field */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <FaUserEdit className="text-green-500 mr-2" />
            Full Name *
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pl-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.name 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900 dark:border-red-700' 
                  : 'border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500'
              } text-gray-900 dark:text-white`}
              placeholder="Enter your full name"
              required
            />
            <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {errors.name && (
            <div className="flex items-center mt-2 text-red-600 dark:text-red-400">
              <FaExclamationTriangle className="text-sm mr-2" />
              <span className="text-sm">{errors.name}</span>
            </div>
          )}
        </div>

        {/* Date of Birth Field */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <label htmlFor="dob" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <FaCalendarAlt className="text-green-500 mr-2" />
            Date of Birth *
          </label>
          <div className="relative">
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pl-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.dob 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900 dark:border-red-700' 
                  : 'border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500'
              } text-gray-900 dark:text-white`}
              required
            />
            <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {errors.dob && (
            <div className="flex items-center mt-2 text-red-600 dark:text-red-400">
              <FaExclamationTriangle className="text-sm mr-2" />
              <span className="text-sm">{errors.dob}</span>
            </div>
          )}
          {formData.dob && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Selected: {new Date(formData.dob).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Phone Field - Only for Writers */}
        {formData.role === 'writer' && (
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <FaPhone className="text-green-500 mr-2" />
              Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pl-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                  errors.phone 
                    ? 'border-red-300 bg-red-50 dark:bg-red-900 dark:border-red-700' 
                    : 'border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500'
                } text-gray-900 dark:text-white`}
                placeholder="+1 (555) 123-4567"
                required
              />
              <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {errors.phone && (
              <div className="flex items-center mt-2 text-red-600 dark:text-red-400">
                <FaExclamationTriangle className="text-sm mr-2" />
                <span className="text-sm">{errors.phone}</span>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <FaCheckCircle className="text-green-500 mr-1" />
              Required for writer verification and communication
            </p>
          </div>
        )}

        {/* Image Upload Field with Preview */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <FaImage className="text-green-500 mr-2" />
            Profile Image
          </label>
          
          {/* Current Image Preview */}
          {(imagePreview || profile.image) && !removeImage && (
            <div className="mb-4 text-center">
              <div className="relative inline-block">
                <img 
                  src={imagePreview || profile.image} 
                  alt="Profile preview" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-200 dark:border-green-800 shadow-md"
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <button
                    type="button"
                    onClick={removeCurrentImage}
                    className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                    title="Remove image"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-500 text-white rounded-full cursor-pointer p-2 hover:bg-blue-600 transition-colors shadow-lg"
                    title="Change image"
                  >
                    <FaEdit className="text-xs" />
                  </button>
                </div>
                {image && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                    <FaCheckCircle className="text-xs" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {image ? `New image: ${image.name} (${(image.size / 1024 / 1024).toFixed(2)} MB)` : 'Current profile image'}
              </p>
            </div>
          )}

          {/* Removed Image State */}
          {removeImage && (
            <div className="mb-4 text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <FaExclamationTriangle className="text-yellow-500 text-xl mx-auto mb-2" />
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">Profile image will be removed</p>
              <button
                type="button"
                onClick={restoreOriginalImage}
                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 text-sm mt-2 underline"
              >
                Restore original image
              </button>
            </div>
          )}

          {/* Upload Area - Show when no image or image removed */}
          {(!imagePreview && !profile.image) || removeImage ? (
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                errors.image 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full">
                  <FaCamera className="text-xl text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Click to upload your photo</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    PNG, JPG, WebP up to 5MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm flex items-center justify-center mx-auto"
              >
                <FaEdit className="mr-2" />
                Change Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          )}

          {errors.image && (
            <div className="flex items-center mt-3 text-red-600 dark:text-red-400">
              <FaExclamationTriangle className="text-sm mr-2" />
              <span className="text-sm">{errors.image}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 cursor-pointer dark:bg-gray-800 text-white py-4 px-6 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Updating Profile...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaSave className="mr-2" />
                Update Profile
              </span>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="px-6 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 transition-colors font-medium"
          >
            Reset
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-4 rounded-xl border-2 ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center">
              {message.type === 'success' ? (
                <FaCheckCircle className="text-green-500 text-lg mr-3" />
              ) : (
                <FaExclamationTriangle className="text-red-500 text-lg mr-3" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}