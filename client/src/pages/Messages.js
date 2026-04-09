import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip,
  Smile,
  Users,
  MessageCircle,
  Check,
  CheckCheck,
  Mic,
  MicOff,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const selectedUserFromNav = location.state?.selectedUser;
  const [conversations, setConversations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' or 'following'
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudio, setPlayingAudio] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const recordingInterval = useRef(null);

  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/chat/conversations');
      // Filter out any malformed conversations
      const validConversations = (response.data || []).filter(conv => 
        conv && conv._id && conv.lastMessage
      );
      setConversations(validConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  };

  const fetchFollowing = async () => {
    try {
      console.log('=== FETCHING FOLLOWING ===');
      console.log('Current user:', user);
      console.log('Making request to /api/users/following');
      
      const response = await axios.get('/api/users/following');
      console.log('Following API response:', response);
      console.log('Following data:', response.data);
      console.log('Following count:', response.data?.length || 0);
      
      setConnections(response.data || []);
    } catch (error) {
      console.error('Error fetching following:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setConnections([]);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/chat/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData = {
        receiver: selectedConversation._id,
        content: newMessage.trim()
      };

      console.log('Sending message:', messageData);
      const response = await axios.post('/api/chat/send', messageData);
      console.log('Message sent to server:', response.data);
      
      // Add message to local state immediately
      setMessages(prev => [...prev, response.data]);
      
      // Emit message via socket with proper structure
      if (socketRef.current) {
        const socketData = {
          ...response.data,
          sender: response.data.sender,
          receiver: response.data.receiver
        };
        
        console.log('Emitting socket message:', socketData);
        socketRef.current.emit('send-message', socketData);
      }
      
      setNewMessage('');
      
      // Refresh conversations to update sidebar
      setTimeout(() => {
        fetchConversations();
      }, 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const startNewConversation = (follower) => {
    console.log('Starting new conversation with:', follower);
    setSelectedConversation(follower);
    setMessages([]); // Clear current messages
    setShowNewChat(false);
    setActiveTab('conversations'); // Switch to conversations tab
    fetchMessages(follower._id);
  };

  const selectConversation = (conversation) => {
    console.log('Selecting conversation:', conversation);
    const otherUser = conversation._id;
    setSelectedConversation(otherUser);
    setMessages([]); // Clear current messages
    fetchMessages(otherUser._id);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const getDisplayName = (user) => {
    if (!user || !user.profile) return 'Unknown User';
    
    if (user.userType === 'company') {
      return user.profile?.companyName || 'Company';
    }
    return `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'User';
  };

  const commonEmojis = ['😀', '😂', '😍', '🥰', '😊', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏', '🙏', '💪', '🤝', '✨'];

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleVoiceCall = () => {
    alert(`Voice call to ${getDisplayName(selectedConversation)} - Feature coming soon!`);
  };

  const handleVideoCall = () => {
    alert(`Video call to ${getDisplayName(selectedConversation)} - Feature coming soon!`);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(recordingInterval.current);
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || !selectedConversation) return;

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-message.wav');
      formData.append('receiver', selectedConversation._id);
      formData.append('messageType', 'voice');

      const response = await axios.post('/api/chat/send-voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessages(prev => [...prev, response.data]);
      
      if (socketRef.current) {
        socketRef.current.emit('send-message', response.data);
      }
      
      setAudioBlob(null);
      setRecordingTime(0);
      fetchConversations();
    } catch (error) {
      console.error('Error sending voice message:', error);
      setError('Failed to send voice message');
      setTimeout(() => setError(''), 3000);
    }
  };

  const cancelVoiceMessage = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const playAudio = (audioUrl, messageId) => {
    if (playingAudio === messageId) {
      setPlayingAudio(null);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.play();
    setPlayingAudio(messageId);
    
    audio.onended = () => setPlayingAudio(null);
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!user || !user._id) return;

    try {
      console.log('Initializing socket connection for user:', user._id);
      const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      socketRef.current = io(SOCKET_URL);
      
      // Join user's personal room
      socketRef.current.emit('join-room', user._id);
      console.log('Joined room:', user._id);
      
      // Listen for new messages
      socketRef.current.on('receive-message', (messageData) => {
        console.log('Received message via socket:', messageData);
        
        // Add message to current conversation if it matches
        if (selectedConversation && 
            (messageData.sender._id === selectedConversation._id || 
             messageData.receiver._id === selectedConversation._id)) {
          console.log('Adding message to current conversation');
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg._id === messageData._id);
            if (exists) return prev;
            return [...prev, messageData];
          });
        }
        
        // Always refresh conversations to update the sidebar
        console.log('Refreshing conversations after receiving message');
        fetchConversations();
      });

      // Listen for socket connection events
      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

    } catch (error) {
      console.error('Socket initialization error:', error);
    }

    // Initial data fetch
    fetchConversations();
    fetchFollowing();

    // Handle navigation from other pages
    if (selectedUserFromNav) {
      console.log('Setting conversation from navigation:', selectedUserFromNav);
      setSelectedConversation(selectedUserFromNav);
      fetchMessages(selectedUserFromNav._id);
    }

    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket');
        socketRef.current.disconnect();
      }
    };
  }, [user, selectedUserFromNav]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const filteredFollowing = connections
    .filter(follower => follower && follower.profile) // Filter out null followers
    .filter(follower =>
      getDisplayName(follower).toLowerCase().includes(modalSearchQuery.toLowerCase())
    );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <button
              onClick={() => {
                setShowNewChat(true);
                setModalSearchQuery(''); // Reset search when opening modal
              }}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-full"
            >
              <MessageCircle size={20} />
            </button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={activeTab === 'conversations' ? "Search conversations..." : "Search following..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'conversations'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chats ({conversations.length})
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'following'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Following ({connections.length})
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'conversations' ? (
            // Conversations List
            conversations.length > 0 ? (
              conversations
                .filter(conversation => conversation && conversation._id) // Filter out null conversations
                .filter(conversation => 
                  getDisplayName(conversation._id).toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((conversation) => (
                <div
                  key={conversation._id._id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?._id === conversation._id._id ? 'bg-purple-50 border-r-2 border-r-purple-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                      {conversation._id?.profile?.profilePicture ? (
                        <img 
                          src={conversation._id.profile.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getDisplayName(conversation._id)?.[0] || 'U'
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {getDisplayName(conversation._id)}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessage?.createdAt ? formatTime(conversation.lastMessage.createdAt) : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage?.content || 'No message'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No conversations yet</p>
                <p className="text-sm">Start messaging your following!</p>
              </div>
            )
          ) : (
            // Following List
            connections.length > 0 ? (
              connections
                .filter(follower => follower && follower.profile) // Filter out null followers
                .filter(follower =>
                  getDisplayName(follower).toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((follower) => (
                <div
                  key={follower._id}
                  onClick={() => startNewConversation(follower)}
                  className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                      {follower.profile?.profilePicture ? (
                        <img 
                          src={follower.profile.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getDisplayName(follower)[0]
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {getDisplayName(follower)}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {follower.profile?.headline || follower.userType}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">Available</span>
                      </div>
                    </div>
                    
                    <div className="text-purple-600">
                      <MessageCircle size={16} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No following yet</p>
                <p className="text-sm">Follow people in the Network page first</p>
                <button
                  onClick={() => window.location.href = '/network'}
                  className="mt-3 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 text-sm"
                >
                  Go to Network
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    {selectedConversation.profile?.profilePicture ? (
                      <img 
                        src={selectedConversation.profile.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getDisplayName(selectedConversation)[0]
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {getDisplayName(selectedConversation)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.profile?.headline || 'Available'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleVoiceCall}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                  >
                    <Phone size={20} />
                  </button>
                  <button 
                    onClick={handleVideoCall}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                  >
                    <Video size={20} />
                  </button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                messages
                  .filter(message => message && message.sender && message._id) // Filter out malformed messages
                  .map((message, index) => {
                  const isOwn = message.sender?._id === user._id;
                  const showDate = index === 0 || 
                    formatDate(message.createdAt) !== formatDate(messages[index - 1]?.createdAt);
                  
                  return (
                    <div key={message._id}>
                      {showDate && (
                        <div className="text-center text-xs text-gray-500 my-4">
                          {formatDate(message.createdAt)}
                        </div>
                      )}
                      
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          {message.messageType === 'voice' ? (
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => playAudio(message.fileUrl, message._id)}
                                className={`p-2 rounded-full ${
                                  isOwn ? 'bg-purple-400 hover:bg-purple-300' : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                              >
                                {playingAudio === message._id ? (
                                  <Pause size={16} className={isOwn ? 'text-white' : 'text-gray-700'} />
                                ) : (
                                  <Play size={16} className={isOwn ? 'text-white' : 'text-gray-700'} />
                                )}
                              </button>
                              <div className="flex-1">
                                <div className={`h-2 rounded-full ${isOwn ? 'bg-purple-300' : 'bg-gray-400'}`}>
                                  <div className={`h-full w-1/3 rounded-full ${isOwn ? 'bg-white' : 'bg-gray-600'}`}></div>
                                </div>
                                <span className={`text-xs ${isOwn ? 'text-purple-200' : 'text-gray-600'}`}>
                                  Voice message
                                </span>
                              </div>
                              <Volume2 size={14} className={isOwn ? 'text-purple-200' : 'text-gray-500'} />
                            </div>
                          ) : (
                            <p>{message.content || 'Message content unavailable'}</p>
                          )}
                          <div className={`flex items-center justify-end space-x-1 mt-1 ${
                            isOwn ? 'text-purple-200' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">{message.createdAt ? formatTime(message.createdAt) : ''}</span>
                            {isOwn && (
                              message.isRead ? 
                                <CheckCheck size={14} className="text-blue-300" /> : 
                                <Check size={14} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {error && (
                <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              {/* Voice Recording UI */}
              {(isRecording || audioBlob) && (
                <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isRecording ? (
                        <>
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-red-600 font-medium">Recording...</span>
                          <span className="text-gray-600">{formatRecordingTime(recordingTime)}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="text-purple-600" size={20} />
                          <span className="text-purple-600 font-medium">Voice message ready</span>
                          <span className="text-gray-600">{formatRecordingTime(recordingTime)}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isRecording ? (
                        <button
                          onClick={stopRecording}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          <MicOff size={16} />
                        </button>
                      ) : audioBlob ? (
                        <>
                          <button
                            onClick={sendVoiceMessage}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"
                          >
                            <Send size={16} />
                            <span>Send</span>
                          </button>
                          <button
                            onClick={cancelVoiceMessage}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={sendMessage} className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  <Paperclip size={20} />
                </button>
                
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 rounded-full transition-colors ${
                    isRecording 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Mic size={20} />
                </button>
                
                <div className="flex-1 relative emoji-picker-container">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isRecording || audioBlob}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                  >
                    <Smile size={18} />
                  </button>
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute right-0 bottom-full mb-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10">
                      <div className="grid grid-cols-5 gap-2 w-48">
                        {commonEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addEmoji(emoji)}
                            className="text-xl hover:bg-gray-100 rounded p-1 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isRecording || audioBlob}
                  className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h2>
              <p className="text-gray-500 mb-4">Choose from your existing conversations or start a new one</p>
              <button
                onClick={() => {
                  setShowNewChat(true);
                  setModalSearchQuery(''); // Reset search when opening modal
                }}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">New Message</h3>
                <button
                  onClick={() => {
                    setShowNewChat(false);
                    setModalSearchQuery(''); // Reset search when closing modal
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search following..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                {filteredFollowing.length > 0 ? (
                  filteredFollowing.map((follower) => (
                    <div
                      key={follower._id}
                      onClick={() => startNewConversation(follower)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                        {follower.profile?.profilePicture ? (
                          <img 
                            src={follower.profile.profilePicture} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getDisplayName(follower)[0]
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {getDisplayName(follower)}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {follower.profile?.headline || follower.userType}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={32} className="mx-auto mb-2 text-gray-300" />
                    <p>No following found</p>
                    <p className="text-sm">Follow people first to start messaging</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;