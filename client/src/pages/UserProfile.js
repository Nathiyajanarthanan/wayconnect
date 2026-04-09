import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Globe, 
  Linkedin, 
  Github, 
  Twitter,
  UserPlus,
  UserMinus,
  MessageCircle,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Award,
  Code
} from 'lucide-react';
import axios from 'axios';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${userId}`);
      setProfileUser(response.data);
      
      // Check if current user is following this user
      const isCurrentlyFollowing = currentUser?.following?.includes(userId) || false;
      setIsFollowing(isCurrentlyFollowing);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await axios.post(`/api/users/follow/${userId}`);
      setIsFollowing(response.data.isFollowing);
      
      // Update the follower count in the profile
      setProfileUser(prev => ({
        ...prev,
        followers: response.data.isFollowing 
          ? [...(prev.followers || []), currentUser._id]
          : (prev.followers || []).filter(id => id !== currentUser._id)
      }));
    } catch (error) {
      console.error('Follow error:', error);
      alert('Error updating follow status: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The user profile you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/network')}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Back to Network
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === userId;
  const displayName = profileUser.userType === 'company' 
    ? profileUser.profile?.companyName 
    : `${profileUser.profile?.firstName || ''} ${profileUser.profile?.lastName || ''}`.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 relative">
            {profileUser.profile?.coverPhoto && (
              <img 
                src={profileUser.profile.coverPhoto} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
              {/* Profile Picture */}
              <div className="relative -mt-16 mb-4 md:mb-0">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-4xl overflow-hidden">
                  {profileUser.profile?.profilePicture ? (
                    <img 
                      src={profileUser.profile.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    displayName?.[0] || 'U'
                  )}
                </div>
              </div>

              {/* Name and Actions */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{displayName || 'User'}</h1>
                    <p className="text-lg text-gray-600 mt-1">
                      {profileUser.profile?.headline || `${profileUser.userType} on WayConnectX`}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      {profileUser.profile?.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin size={16} />
                          <span>{profileUser.profile.location}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isOwnProfile && (
                    <div className="flex space-x-3 mt-4 md:mt-0">
                      <button
                        onClick={handleFollow}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium ${
                          isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        }`}
                      >
                        {isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                        <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
                      </button>
                      <button 
                        onClick={() => navigate('/messages', { state: { selectedUser: profileUser } })}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        <MessageCircle size={16} />
                        <span>Message</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex space-x-6 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{profileUser.followers?.length || 0}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{profileUser.following?.length || 0}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{profileUser.profile?.projects?.length || 0}</div>
                    <div className="text-sm text-gray-600">Projects</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {profileUser.profile?.bio && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{profileUser.profile.bio}</p>
              </div>
            )}

            {/* Experience */}
            {profileUser.profile?.experience?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="mr-2" size={20} />
                  Experience
                </h2>
                <div className="space-y-4">
                  {profileUser.profile.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-purple-200 pl-4">
                      <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-purple-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {exp.startDate && new Date(exp.startDate).getFullYear()} - 
                        {exp.current ? ' Present' : (exp.endDate && new Date(exp.endDate).getFullYear())}
                      </p>
                      {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profileUser.profile?.education?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="mr-2" size={20} />
                  Education
                </h2>
                <div className="space-y-4">
                  {profileUser.profile.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-purple-200 pl-4">
                      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-purple-600">{edu.school}</p>
                      <p className="text-sm text-gray-500">
                        {edu.startYear} - {edu.endYear}
                      </p>
                      {edu.description && <p className="text-gray-700 mt-2">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {profileUser.profile?.projects?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Code className="mr-2" size={20} />
                  Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileUser.profile.projects.map((project, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                      {project.technologies && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span key={techIndex} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {project.url && (
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 text-sm mt-2 inline-block"
                        >
                          View Project →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Info</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-700">{profileUser.email}</span>
                </div>
                {profileUser.profile?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-700">{profileUser.profile.phone}</span>
                  </div>
                )}
                {profileUser.profile?.website && (
                  <div className="flex items-center space-x-3">
                    <Globe size={16} className="text-gray-400" />
                    <a 
                      href={profileUser.profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700"
                    >
                      {profileUser.profile.website}
                    </a>
                  </div>
                )}
                {profileUser.profile?.linkedin && (
                  <div className="flex items-center space-x-3">
                    <Linkedin size={16} className="text-blue-600" />
                    <a 
                      href={profileUser.profile.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {profileUser.profile?.github && (
                  <div className="flex items-center space-x-3">
                    <Github size={16} className="text-gray-700" />
                    <a 
                      href={profileUser.profile.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700"
                    >
                      GitHub Profile
                    </a>
                  </div>
                )}
                {profileUser.profile?.twitter && (
                  <div className="flex items-center space-x-3">
                    <Twitter size={16} className="text-blue-400" />
                    <a 
                      href={profileUser.profile.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Twitter Profile
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {profileUser.profile?.skills?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profileUser.profile.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {profileUser.profile?.languages?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages</h2>
                <div className="space-y-2">
                  {profileUser.profile.languages.map((language, index) => (
                    <div key={index} className="text-gray-700">{language}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {profileUser.profile?.certifications?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="mr-2" size={20} />
                  Certifications
                </h2>
                <div className="space-y-3">
                  {profileUser.profile.certifications.map((cert, index) => (
                    <div key={index}>
                      <h3 className="font-medium text-gray-900">{cert.name}</h3>
                      <p className="text-sm text-gray-600">{cert.issuer}</p>
                      {cert.date && (
                        <p className="text-xs text-gray-500">
                          {new Date(cert.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;