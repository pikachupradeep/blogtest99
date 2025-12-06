// components/forms/create-profile-form.tsx
'use client';

import { createProfile } from '@/actions/profile-actions';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
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
  FaExclamationTriangle
} from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';

// Define Zod schema for validation
const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF\-'.]+$/, 
      'Name must contain only letters, spaces, and valid special characters (accents, hyphens, apostrophes)'
    )
    .refine((val) => {
      const trimmed = val.trim();
      const words = trimmed.split(/\s+/);
      
      if (words.length < 2 && trimmed.length < 3) {
        return false;
      }
      
      return words.every(word => word.length >= 2);
    }, 'Please enter a proper full name (minimum 2 characters per word)')
    .transform(val => val.trim().replace(/\s+/g, ' ')),

  dob: z
    .string()
    .refine((val) => {
      if (!val) return false;
      const dob = new Date(val);
      const today = new Date();
      
      if (isNaN(dob.getTime())) return false;
      
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        return age - 1 >= 18;
      }
      
      return age >= 18;
    }, 'You must be at least 18 years old'),

  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim().length === 0) return true;
      
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleaned = val.replace(/[\s\-\(\)\.]/g, '');
      return phoneRegex.test(cleaned);
    }, 'Please enter a valid international phone number (e.g., +1234567890)'),

  role: z.enum(["reader", "writer"] as const),

  image: z
    .instanceof(File)
    .refine((file) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      return validTypes.includes(file.type);
    }, 'Only JPEG, PNG, WebP, and GIF images are allowed')
    .refine((file) => {
      return file.size <= 5 * 1024 * 1024;
    }, 'Image size must be less than 5MB')
});

export default function CreateProfileForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    phone: '',
    role: '' as 'reader' | 'writer' | ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simplified validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF\-'.]+$/.test(formData.name)) {
      newErrors.name = 'Name contains invalid characters';
    }

    // DOB validation
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dob);
      const today = new Date();
      
      if (isNaN(dob.getTime())) {
        newErrors.dob = 'Invalid date';
      } else {
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const calculatedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
        
        if (calculatedAge < 18) {
          newErrors.dob = 'You must be at least 18 years old';
        }
      }
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    } else if (formData.role !== 'reader' && formData.role !== 'writer') {
      newErrors.role = 'Invalid role selected';
    }

    // Phone validation for writers
    if (formData.role === 'writer') {
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Phone number is required for writers';
      } else {
        const cleaned = formData.phone.replace(/[\s\-\(\)\.]/g, '');
        if (!/^[\+]?[1-9][\d]{0,15}$/.test(cleaned)) {
          newErrors.phone = 'Please enter a valid international phone number';
        }
      }
    }

    // Image validation
    if (!image) {
      newErrors.image = 'Profile image is required';
    } else {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(image.type)) {
        newErrors.image = 'Only JPEG, PNG, WebP, and GIF images are allowed';
      }
      if (image.size > 5 * 1024 * 1024) {
        newErrors.image = 'Image size must be less than 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'role' && value === 'reader' && errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview('');
    }
    
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    setErrors(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors in the form' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('dob', formData.dob);
      data.append('role', formData.role);
      
      if (formData.role === 'writer') {
        data.append('phone', formData.phone.trim());
      }
      
      if (image) {
        data.append('img', image);
      }

      const result = await createProfile(data);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        
        if (result.redirectPath) {
          setTimeout(() => {
            router.push(result.redirectPath!);
          }, 1500);
        } else {
          const redirectPath = formData.role === 'writer' ? '/authDashboard/posts' : '/userDashboard/save';
          setTimeout(() => {
            router.push(redirectPath);
          }, 1500);
        }
        
        setFormData({ name: '', dob: '', phone: '', role: '' });
        setImage(null);
        setImagePreview('');
        setErrors({});
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = () => {
    if (!formData.dob) return null;
    
    const dob = new Date(formData.dob);
    const today = new Date();
    
    if (isNaN(dob.getTime())) return null;
    
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) 
      ? age - 1 
      : age;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4 transition-colors">
          <FaUserEdit className="text-2xl text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 transition-colors">
          Create Your Profile
        </h2>
        <p className="text-gray-600 dark:text-gray-300 transition-colors">
          Tell us about yourself and choose your role
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <label htmlFor="role" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors">
            <FaUserCircle className="text-blue-500 dark:text-blue-400 mr-2" />
            I want to be a *
          </label>
          <div className="relative">
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pl-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 appearance-none cursor-pointer transition-all ${
                errors.role 
                  ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              required
            >
              <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                Select your role
              </option>
              <option value="reader" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                📖 Reader - Browse and read content
              </option>
              <option value="writer" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                ✍️ Writer - Create and publish content
              </option>
            </select>
            <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <IoIosArrowDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
          {errors.role && (
            <div className="flex items-center mt-2 text-red-600 dark:text-red-400 transition-colors">
              <FaExclamationTriangle className="text-sm mr-2" />
              <span className="text-sm">{errors.role}</span>
            </div>
          )}
          {formData.role && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors">
              <p className="text-sm text-blue-700 dark:text-blue-300 transition-colors">
                {formData.role === 'reader' 
                  ? '🎯 As a Reader, you can explore and enjoy all the amazing content on our platform.' 
                  : '🎯 As a Writer, you can create, publish, and share your stories with the community.'}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors">
            <FaUserEdit className="text-blue-500 dark:text-blue-400 mr-2" />
            Full Name *
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pl-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all ${
                errors.name 
                  ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              placeholder="Enter your full name (e.g., John Smith)"
              required
            />
            <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
          {errors.name && (
            <div className="flex items-center mt-2 text-red-600 dark:text-red-400 transition-colors">
              <FaExclamationTriangle className="text-sm mr-2" />
              <span className="text-sm">{errors.name}</span>
            </div>
          )}
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formData.name.length}/50 characters
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Use your real, readable name
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="dob" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors">
              <FaCalendarAlt className="text-blue-500 dark:text-blue-400 mr-2" />
              Date of Birth *
            </label>
            {formData.dob && !errors.dob && (
              <span className="text-sm font-medium px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Age: {calculateAge()} years
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              max={(() => {
                const today = new Date();
                const minAgeDate = new Date();
                minAgeDate.setFullYear(today.getFullYear() - 18);
                return minAgeDate.toISOString().split('T')[0];
              })()}
              min="1900-01-01"
              className={`w-full px-4 py-3 pl-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all ${
                errors.dob 
                  ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              required
            />
            <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
          {errors.dob && (
            <div className="flex items-center mt-2 text-red-600 dark:text-red-400 transition-colors">
              <FaExclamationTriangle className="text-sm mr-2" />
              <span className="text-sm">{errors.dob}</span>
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center transition-colors">
            <FaCheckCircle className="text-green-500 dark:text-green-400 mr-1" />
            Must be 18 years or older to create a profile
          </p>
        </div>

        {formData.role === 'writer' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors">
              <FaPhone className="text-blue-500 dark:text-blue-400 mr-2" />
              Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pl-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all ${
                  errors.phone 
                    ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                placeholder="+1234567890 (international format)"
                required={formData.role === 'writer'}
              />
              <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
            {errors.phone && (
              <div className="flex items-center mt-2 text-red-600 dark:text-red-400 transition-colors">
                <FaExclamationTriangle className="text-sm mr-2" />
                <span className="text-sm">{errors.phone}</span>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center transition-colors">
              <FaCheckCircle className="text-green-500 dark:text-green-400 mr-1" />
              International format, no spaces or special characters
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors">
            <FaImage className="text-blue-500 dark:text-blue-400 mr-2" />
            Profile Image *
          </label>
          
          {imagePreview && (
            <div className="mb-4 text-center">
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 dark:border-blue-800 shadow-md transition-colors"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all shadow-lg"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 transition-colors">
                {image?.name} ({(image ? image.size / 1024 / 1024 : 0).toFixed(2)} MB)
              </p>
            </div>
          )}

          <div 
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              errors.image 
                ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' 
                : imagePreview 
                  ? 'border-green-300 dark:border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className="hidden"
              required
            />
            
            {!imagePreview ? (
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full transition-colors">
                  <FaCamera className="text-xl text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-200 font-medium transition-colors">
                    Click to upload your photo
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                    JPEG, PNG, WebP, GIF up to 5MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <FaCheckCircle className="text-2xl text-green-500 dark:text-green-400 mx-auto" />
                <p className="text-green-700 dark:text-green-300 font-medium transition-colors">
                  Image selected!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 transition-colors">
                  Click to change or drag a new image
                </p>
              </div>
            )}
          </div>

          {errors.image && (
            <div className="flex items-center mt-3 text-red-600 dark:text-red-400 transition-colors">
              <FaExclamationTriangle className="text-sm mr-2" />
              <span className="text-sm">{errors.image}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-700 dark:to-gray-800 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-gray-600 dark:hover:to-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Creating Your Profile...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <FaUserEdit className="mr-2" />
              Create Profile
            </span>
          )}
        </button>

        {message && (
          <div
            className={`p-4 rounded-xl border-2 transition-all ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center">
              {message.type === 'success' ? (
                <FaCheckCircle className="text-green-500 dark:text-green-400 text-lg mr-3" />
              ) : (
                <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-lg mr-3" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}
      </form>

      <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <h3 className="flex items-center text-sm font-semibold text-gray-800 dark:text-white mb-3 transition-colors">
          <FaCheckCircle className="text-blue-500 dark:text-blue-400 mr-2" />
          Form Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300 transition-colors">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 transition-colors"></div>
            <span>Name: 2-50 characters, readable full name</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 transition-colors"></div>
            <span>Age: Must be 18+ years old (verified by DOB)</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 transition-colors"></div>
            <span>Role: Choose between Reader or Writer</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 transition-colors"></div>
            <span>Phone: Required for writers only, international format</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 transition-colors"></div>
            <span>Image: Clear face photo, up to 5MB</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 transition-colors"></div>
            <span>Image types: JPEG, PNG, WebP, GIF allowed</span>
          </div>
        </div>
      </div>
    </div>
  );
}