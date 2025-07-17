
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Search, Bold, Italic, Link, List, ListOrdered, X } from 'lucide-react';
import { IAdminProfile } from '@/models/AdminProfile';

interface INotification {
  id: string;
  title: string;
  description: string;
  details?: string;
  time: string;
  read: boolean;
  type: string;
  expanded?: boolean;
  sender?: string;
  priority?: 'low' | 'medium' | 'high';
  actions?: { label: string; onClick: string }[];
  createdAt: Date;
}

interface IPasswordHistory {
  password: string;
  changedAt: Date;
  changedByIp: string;
  userAgent: string;
}

const SettingsContent = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [selectedNotification, setSelectedNotification] = useState<INotification | null>(null);
  const [formData, setFormData] = useState<Omit<Partial<IAdminProfile>, 'bio'> & { bio: string; searchQuery: string }>({
    username: '',
    website: '',
    bio: '',
    showJobTitle: true,
    email: '',
    companyName: '',
    adminName: '',
    profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    searchQuery: ''
  });

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/admin/profile');
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          ...data,
          searchQuery: prev.searchQuery // Keep the search query
        }));
        
        // Update notifications if they exist in the response
        if (data.notifications) {
          setNotifications(data.notifications);
        }
        
        // Update password history if it exists in the response
        if (data.passwordHistory) {
          setPasswordHistory(data.passwordHistory);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Add this effect to fetch admin profile data when component mounts
  useEffect(() => {
    fetchProfile();
  }, []);

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [passwordHistory, setPasswordHistory] = useState<IPasswordHistory[]>([]);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 3;

  // Handle notification actions
  const toggleNotification = async (id: string, event?: React.MouseEvent) => {
    // If the click was on a button, don't open the modal
    if (event && (event.target as HTMLElement).closest('button')) {
      return;
    }

    const notification = notifications.find(n => n.id === id);
    if (notification) {
      setSelectedNotification(notification);
      
      // Mark as read in the UI immediately for better UX
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
      
      // Update the notification as read in the backend
      try {
        await fetch('/api/admin/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notification: { id, read: true }
          })
        });
      } catch (error) {
        console.error('Failed to update notification status:', error);
      }
    }
  };

  const deleteNotification = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the parent click
    
    // Optimistic UI update
    const newNotifications = notifications.filter(n => n.id !== id);
    setNotifications(newNotifications);
    
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
    
    // Update the backend
    try {
      await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification: { id, _delete: true }
        })
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Revert on error
      setNotifications(notifications);
    }
  };

  const markAllAsRead = async () => {
    // Update UI immediately for better UX
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    
    // Update the backend
    try {
      await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const closeNotificationModal = () => {
    setSelectedNotification(null);
  };

  // Pagination logic
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    link: false,
    list: false,
    orderedList: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    'My Details',
    'Profile',
    'Password',
    'Notifications',
  ];

  // State for loading and feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordSuccess('');
      return;
    }

    // Basic password validation
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      setPasswordSuccess('');
      return;
    }

    setIsSubmitting(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      // Update the password history from the response
      if (data.data?.passwordHistory) {
        setPasswordHistory(data.data.passwordHistory);
      }

      // Clear the form on success
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setPasswordSuccess('Password updated successfully!');
    } catch (error) {
      console.error('Failed to update password:', error);
      setPasswordError(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      console.log('Submitting form data:', formData);
      
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.companyName || '',
          adminName: formData.adminName || '',
          email: formData.email || '',
          username: formData.username || '',
          website: formData.website || '',
          bio: formData.bio || '',
          profileImage: formData.profileImage || '',
          showJobTitle: formData.showJobTitle !== undefined ? formData.showJobTitle : true,
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update the form with the returned data to ensure consistency
      setFormData(prev => ({
        ...prev,
        ...data.data, // The updated profile data from the server
        searchQuery: prev.searchQuery, // Preserve search query
      }));

      setSubmitStatus({
        type: 'success',
        message: 'Profile updated successfully!',
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred while updating the profile',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'My Details':
        return (
          <div className="space-y-6">
            <div className="p-2 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">My Details</h2>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and information.</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formData.adminName || 'Not provided'}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formData.email || 'Not provided'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Company</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formData.companyName || 'Not provided'}
                    </dd>
                  </div>
                
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Website</dt>
                    <dd className="mt-1 text-sm text-blue-600 hover:text-blue-500 sm:mt-0 sm:col-span-2">
                      {formData.website ? (
                        <a href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline">
                          {formData.website}
                        </a>
                      ) : 'Not provided'}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Bio</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                      {formData.bio || 'Not provided'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        );
      case 'Profile':
        return (
          <>
            <div className="p-2 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div className="grid grid-cols-3 gap-6 items-center">
                <label className="text-sm font-medium text-gray-700">Company Name</label>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Admin Name */}
              <div className="grid grid-cols-3 gap-6 items-center">
                <label className="text-sm font-medium text-gray-700">Your Name</label>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="grid grid-cols-3 gap-6 items-center">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <div className="col-span-2">
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      example.com/
                    </span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Alternative Contact Email */}
              <div className="grid grid-cols-3 gap-6 items-start">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-500 mt-1">Enter your email</p>
                </div>
                <div className="col-span-2">
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@example.com"
                      className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Website */}
              <div className="grid grid-cols-3 gap-6 items-center">
                <label className="text-sm font-medium text-gray-700">Website</label>
                <div className="col-span-2">
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      https://
                    </span>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="example.com"
                      className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Job Title */}
              {/* <div className="grid grid-cols-3 gap-6 items-center">
                <label className="text-sm font-medium text-gray-700">Job Title</label>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g., Project Manager"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div> */}

              {/* Photo */}
              <div className="grid grid-cols-3 gap-6 items-start">
                <div>
                  <label className="text-sm font-medium text-gray-700">Your photo</label>
                  <p className="text-sm text-gray-500 mt-1">This will be displayed on your profile.</p>
                </div>
                <div className="col-span-2 flex items-center space-x-4">
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setFormData({ ...formData, profileImage: '' })}
                      disabled={!formData.profileImage}
                      className={`text-sm ${formData.profileImage ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 cursor-not-allowed'}`}
                    >
                      Delete
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, profileImage: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="grid grid-cols-3 gap-6 items-start">
                <div>
                  <label className="text-sm font-medium text-gray-700">Your bio</label>
                  <p className="text-sm text-gray-500 mt-1">Write a short introduction.</p>
                </div>
                <div className="col-span-2">
                  <div className="border border-gray-300 rounded-lg">
                    <div className="flex items-center space-x-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
                      <select className="text-sm border-none bg-transparent focus:outline-none">
                        <option>Normal text</option>
                      </select>
                      <div className="flex items-center space-x-1 ml-4">
                        <button
                          onClick={() => setFormatting({ ...formatting, bold: !formatting.bold })}
                          className={`p-1 rounded ${formatting.bold ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        >
                          <Bold className={`w-4 h-4 ${formatting.bold ? 'text-gray-900' : 'text-gray-500'}`} />
                        </button>
                        <button
                          onClick={() => setFormatting({ ...formatting, italic: !formatting.italic })}
                          className={`p-1 rounded ${formatting.italic ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        >
                          <Italic className={`w-4 h-4 ${formatting.italic ? 'text-gray-900' : 'text-gray-500'}`} />
                        </button>
                        <button
                          onClick={() => setFormatting({ ...formatting, link: !formatting.link })}
                          className={`p-1 rounded ${formatting.link ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        >
                          <Link className={`w-4 h-4 ${formatting.link ? 'text-gray-900' : 'text-gray-500'}`} />
                        </button>
                        <button
                          onClick={() => setFormatting({ ...formatting, list: !formatting.list, orderedList: false })}
                          className={`p-1 rounded ${formatting.list ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        >
                          <List className={`w-4 h-4 ${formatting.list ? 'text-gray-900' : 'text-gray-500'}`} />
                        </button>
                        <button
                          onClick={() => setFormatting({ ...formatting, orderedList: !formatting.orderedList, list: false })}
                          className={`p-1 rounded ${formatting.orderedList ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        >
                          <ListOrdered className={`w-4 h-4 ${formatting.orderedList ? 'text-gray-900' : 'text-gray-500'}`} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full p-3 border-none resize-none focus:outline-none"
                      rows={4}
                      style={{
                        fontWeight: formatting.bold ? 'bold' : 'normal',
                        fontStyle: formatting.italic ? 'italic' : 'normal',
                        textDecoration: formatting.link ? 'underline' : 'none'
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{2000 - formData.bio.length} characters left</p>
                </div>
              </div>
              <div className="pt-5 border-t border-gray-200">
                {/* Status Message */}
                {submitStatus.type && (
                  <div className={`mb-4 p-3 rounded-md ${
                    submitStatus.type === 'success' 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}>
                    <p className="text-sm">{submitStatus.message}</p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={() => {
                      // Reset form to initial values
                      fetchProfile();
                      setSubmitStatus({ type: null, message: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      isSubmitting 
                        ? 'bg-green-400' 
                        : 'bg-green-600 hover:bg-green-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : 'Save changes'}
                  </button>
                </div>
              </div>
            </form>
          </>
        );
      case 'Password':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <p className="mt-1 text-sm text-gray-500">Update your password associated with your account.</p>
              </div>

              <div className="col-span-3 sm:col-span-2">
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Current password</label>
                <input
                  type="password"
                  name="current-password"
                  id="current-password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div className="col-span-3 sm:col-span-2">
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New password</label>
                <input
                  type="password"
                  name="new-password"
                  id="new-password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters long and include a number and special character.
                </p>
              </div>

              <div className="col-span-3 sm:col-span-2">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm new password</label>
                <input
                  type="password"
                  name="confirm-password"
                  id="confirm-password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              {passwordError && (
                <div className="col-span-3">
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{passwordError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {passwordSuccess && (
                <div className="col-span-3">
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{passwordSuccess}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-span-3 pt-2">
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update password'}
                </button>
              </div>

              {passwordHistory.length > 0 && (
                <div className="col-span-3 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Password History</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-3">
                      {passwordHistory.map((record, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Changed {new Date(record.changedAt).toLocaleString()}</span>
                            <span className="text-gray-500 text-xs">
                              {record.changedByIp} • {record.userAgent.split(' ')[0]}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'Notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                <p className="mt-1 text-sm text-gray-500">Manage your notification preferences</p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Mark all as read
                </button>
                {/* <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Notification settings
                </button>*/}
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {currentNotifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`${!notification.read ? 'bg-green-50' : 'bg-white'} hover:bg-gray-50 cursor-pointer transition-colors duration-150`}
                    onClick={(e) => toggleNotification(notification.id, e)}
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          {!notification.read && (
                            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-green-500 mr-2"></span>
                          )}
                          <p className={`text-sm font-medium truncate ${!notification.read ? 'text-gray-900' : 'text-gray-500'}`}>
                            {notification.title}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {notification.priority || 'Low'}
                          </span>
                          <button
                            type="button"
                            className="ml-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                            onClick={(e) => deleteNotification(notification.id, e)}
                          >
                            <span className="sr-only">Delete</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 ml-4">
                        <p className="text-sm text-gray-600">{notification.description}</p>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <span>{notification.time}</span>
                          <span className="mx-1">•</span>
                          <span className="capitalize">{notification.type}</span>
                          {notification.sender && (
                            <>
                              <span className="mx-1">•</span>
                              <span>From: {notification.sender}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {notifications.length > 0 && (
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <button
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstNotification + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastNotification, notifications.length)}
                        </span>{' '}
                        of <span className="font-medium">{notifications.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${currentPage === 1 ? 'border-gray-200 bg-gray-50 text-gray-300' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                          <button
                            key={number}
                            onClick={() => setCurrentPage(number)}
                            className={`relative inline-flex items-center px-4 py-2 border ${currentPage === number
                              ? 'z-10 bg-green-50 border-green-500 text-green-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
                          >
                            {number}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${currentPage === totalPages ? 'border-gray-200 bg-gray-50 text-gray-300' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">{activeTab} Settings</h3>
            <p className="mt-1 text-sm text-gray-500">This section is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search settings"
              value={formData.searchQuery}
              onChange={(e) => setFormData({ ...formData, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {formData.searchQuery && (
              <button
                onClick={() => setFormData({ ...formData, searchQuery: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab}
              {tab === 'Team' && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  48
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 p-8 ">
        <div className="w-12/12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 space-y-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;