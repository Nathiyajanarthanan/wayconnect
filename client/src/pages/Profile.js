import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Edit3, MapPin, Link as LinkIcon, Mail, Phone, Plus, X, Save, Globe } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [editingSection, setEditingSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Separate state for each editing section
  const [aboutData, setAboutData] = useState({
    headline: '',
    bio: '',
    location: ''
  });
  const [contactData, setContactData] = useState({
    phone: '',
    website: '',
    linkedin: ''
  });
  const [skillsData, setSkillsData] = useState([]);

  // Initialize form data when user changes
  React.useEffect(() => {
    if (user?.profile) {
      setAboutData({
        headline: user.profile.headline || '',
        bio: user.profile.bio || '',
        location: user.profile.location || ''
      });
      setContactData({
        phone: user.profile.phone || '',
        website: user.profile.website || '',
        linkedin: user.profile.linkedin || ''
      });
      setSkillsData(user.profile.skills || []);
    }
  }, [user]);

  const handleImageUpload = async (file, type) => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const formData = new FormData();
    
    // Use the correct field name for the backend
    if (type === 'profile-picture') {
      formData.append('profile-picture', file);
    } else if (type === 'cover-photo') {
      formData.append('cover-photo', file);
    }

    try {
      setLoading(true);
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', type);
      
      const response = await api.post(`/api/users/upload/${type}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Upload response:', response.data);
      
      // Update user context
      setUser(response.data.user);
      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      alert('Upload failed: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updateData) => {
    try {
      setLoading(true);
      console.log('Updating profile with:', updateData);
      
      const response = await api.put('/api/users/profile', updateData);
      console.log('Profile update response:', response.data);
      
      setUser(response.data);
      setEditingSection(null);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert('Update failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = useCallback(() => {
    if (newSkill.trim() && !skillsData.includes(newSkill.trim())) {
      const updatedSkills = [...skillsData, newSkill.trim()];
      setSkillsData(updatedSkills);
      setNewSkill('');
    }
  }, [newSkill, skillsData]);

  const handleRemoveSkill = useCallback((skillToRemove) => {
    const updatedSkills = skillsData.filter(skill => skill !== skillToRemove);
    setSkillsData(updatedSkills);
  }, [skillsData]);

  // Memoized input handlers to prevent re-renders
  const handleAboutChange = useCallback((field, value) => {
    setAboutData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleContactChange = useCallback((field, value) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNewSkillChange = useCallback((value) => {
    setNewSkill(value);
  }, []);

  const ProfileSection = React.memo(({ title, children, onEdit, isEditing }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={onEdit}
          className="text-purple-600 hover:text-purple-700 flex items-center space-x-1"
        >
          <Edit3 size={16} />
          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>
      {children}
    </div>
  ));

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Cover Photo & Profile Picture */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-48 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400">
          {user?.profile?.coverPhoto && (
            <img 
              src={user.profile.coverPhoto} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all"
          >
            <Camera size={20} className="text-gray-700" />
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'cover-photo')}
            className="hidden"
          />
        </div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Profile Picture */}
          <div className="relative -mt-16 mb-4">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                {user?.profile?.profilePicture ? (
                  <img 
                    src={user.profile.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                    {user?.profile?.firstName?.[0] || user?.profile?.companyName?.[0] || 'U'}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Camera size={16} className="text-gray-700" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'profile-picture')}
                className="hidden"
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.userType === 'company' 
                ? user?.profile?.companyName || 'Company Name'
                : `${user?.profile?.firstName || 'First'} ${user?.profile?.lastName || 'Last'}`
              }
            </h1>
            <p className="text-lg text-gray-600">
              {user?.profile?.headline || 'Add your professional headline'}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {user?.profile?.location && (
                <div className="flex items-center space-x-1">
                  <MapPin size={16} />
                  <span>{user.profile.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <span>{user?.followers?.length || 0} connections</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <ProfileSection 
        title="About" 
        onEdit={() => setEditingSection(editingSection === 'about' ? null : 'about')}
        isEditing={editingSection === 'about'}
      >
        {editingSection === 'about' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                type="text"
                value={aboutData.headline}
                onChange={(e) => handleAboutChange('headline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Your professional headline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={aboutData.bio}
                onChange={(e) => handleAboutChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={aboutData.location}
                onChange={(e) => handleAboutChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="City, Country"
              />
            </div>
            <button
              onClick={() => handleProfileUpdate(aboutData)}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-700">{user?.profile?.bio || 'Add information about yourself'}</p>
          </div>
        )}
      </ProfileSection>

      {/* Contact Information */}
      <ProfileSection 
        title="Contact Information" 
        onEdit={() => setEditingSection(editingSection === 'contact' ? null : 'contact')}
        isEditing={editingSection === 'contact'}
      >
        {editingSection === 'contact' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-600">{user?.email}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={contactData.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={contactData.website}
                onChange={(e) => handleContactChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
              <input
                type="url"
                value={contactData.linkedin}
                onChange={(e) => handleContactChange('linkedin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={() => handleProfileUpdate(contactData)}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-700">{user?.email}</span>
            </div>
            {user?.profile?.phone && (
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-700">{user.profile.phone}</span>
              </div>
            )}
            {user?.profile?.website && (
              <div className="flex items-center space-x-3">
                <Globe size={16} className="text-gray-400" />
                <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                  {user.profile.website}
                </a>
              </div>
            )}
            {user?.profile?.linkedin && (
              <div className="flex items-center space-x-3">
                <LinkIcon size={16} className="text-gray-400" />
                <a href={user.profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                  LinkedIn Profile
                </a>
              </div>
            )}
          </div>
        )}
      </ProfileSection>

      {/* Skills Section */}
      <ProfileSection 
        title="Skills" 
        onEdit={() => setEditingSection(editingSection === 'skills' ? null : 'skills')}
        isEditing={editingSection === 'skills'}
      >
        {editingSection === 'skills' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {skillsData.map((skill, index) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => handleNewSkillChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add a skill (e.g., JavaScript, React, Node.js)"
              />
              <button
                onClick={handleAddSkill}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>
            
            <button
              onClick={() => handleProfileUpdate({ skills: skillsData })}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Skills'}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {user?.profile?.skills?.length > 0 ? (
              user.profile.skills.map((skill, index) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500">Add your skills to showcase your expertise</p>
            )}
          </div>
        )}
      </ProfileSection>
    </div>
  );
};

export default Profile;