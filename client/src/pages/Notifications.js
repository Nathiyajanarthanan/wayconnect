import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Check, X, User, Briefcase, MessageCircle, Heart, Award, Settings, Filter } from 'lucide-react';
import axios from 'axios';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      type: 'connection',
      title: 'New Connection Request',
      message: 'Sarah Johnson wants to connect with you',
      time: '2 hours ago',
      read: false,
      avatar: null,
      actionable: true
    },
    {
      id: 2,
      type: 'project',
      title: 'Project Application',
      message: 'You have a new application for "React Developer Needed"',
      time: '4 hours ago',
      read: false,
      avatar: null,
      actionable: true
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message',
      message: 'Mike Chen sent you a message about the web development project',
      time: '1 day ago',
      read: true,
      avatar: null,
      actionable: false
    },
    {
      id: 4,
      type: 'like',
      title: 'Post Liked',
      message: 'TechStart Inc. liked your post about React best practices',
      time: '2 days ago',
      read: true,
      avatar: null,
      actionable: false
    },
    {
      id: 5,
      type: 'achievement',
      title: 'Profile Milestone',
      message: 'Congratulations! You\'ve reached 100 connections',
      time: '3 days ago',
      read: true,
      avatar: null,
      actionable: false
    },
    {
      id: 6,
      type: 'project',
      title: 'Project Completed',
      message: 'Your project "E-commerce Website" has been marked as completed',
      time: '1 week ago',
      read: true,
      avatar: null,
      actionable: false
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection':
        return <User className="text-blue-500" size={20} />;
      case 'project':
        return <Briefcase className="text-purple-500" size={20} />;
      case 'message':
        return <MessageCircle className="text-green-500" size={20} />;
      case 'like':
        return <Heart className="text-red-500" size={20} />;
      case 'achievement':
        return <Award className="text-yellow-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const handleAction = (notification, action) => {
    if (action === 'accept') {
      alert(`Accepted ${notification.title}`);
    } else if (action === 'decline') {
      alert(`Declined ${notification.title}`);
    }
    markAsRead(notification.id);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Bell className="mr-3" size={32} />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-3 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600">Stay updated with your Way Connect activity</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              <Check size={16} />
              <span>Mark all read</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'connection', label: 'Connections', count: notifications.filter(n => n.type === 'connection').length },
            { id: 'project', label: 'Projects', count: notifications.filter(n => n.type === 'project').length },
            { id: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length }
          ].map(filterOption => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                filter === filterOption.id
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{filterOption.label}</span>
              {filterOption.count > 0 && (
                <span className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {filterOption.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
                !notification.read ? 'border-l-4 border-l-purple-500 bg-purple-50' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {notification.actionable && (
                        <>
                          <button
                            onClick={() => handleAction(notification, 'accept')}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm hover:bg-green-200"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleAction(notification, 'decline')}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm hover:bg-red-200"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete notification"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You're all caught up! New notifications will appear here."
                : `No ${filter} notifications at the moment.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="mr-2" size={20} />
          Notification Preferences
        </h2>
        
        <div className="space-y-4">
          {[
            { id: 'connections', label: 'Connection requests and updates', enabled: true },
            { id: 'projects', label: 'Project applications and updates', enabled: true },
            { id: 'messages', label: 'New messages', enabled: true },
            { id: 'likes', label: 'Likes and reactions', enabled: false },
            { id: 'achievements', label: 'Achievements and milestones', enabled: true },
            { id: 'email', label: 'Email notifications', enabled: false }
          ].map(setting => (
            <div key={setting.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{setting.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={setting.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;