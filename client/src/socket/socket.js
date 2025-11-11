import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';
const token = localStorage.getItem('token');
console.log('Client token:', token ? 'present' : 'missing');
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  auth: { token }
});

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const connect = () => {
    if (!socket.connected) socket.connect();
  };

  const disconnect = () => socket.disconnect();

  const sendMessage = (message) => socket.emit('send_message', { message });

  const sendPrivateMessage = (toSocketId, message) => socket.emit('private_message', { toSocketId, message });

  const setTyping = (isTyping) => socket.emit('typing', isTyping);

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      console.log('✅ Connected to Airme Chat Server');
    };
    const onDisconnect = () => setIsConnected(false);
    const onConnectError = (err) => {
      console.error('Connection error:', err);
      alert('Failed to connect to server. Please check your authentication.');
    };

    const onReceiveMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const onPrivateMessage = (message) => {
      setMessages(prev => [...prev, { ...message, private: true }]);
    };

    const onUserList = (list) => setUsers(list);

    const onUserJoined = (user) => setMessages(prev => [...prev, { id: Date.now(), system: true, message: `${user.username} joined the chat`, timestamp: new Date().toISOString() }]);
    const onUserLeft = (user) => setMessages(prev => [...prev, { id: Date.now(), system: true, message: `${user.username} left the chat`, timestamp: new Date().toISOString() }]);
    const onTypingUsers = (list) => setTypingUsers(list || []);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
    };
  }, []);

  return { socket, isConnected, messages, users, typingUsers, connect, disconnect, sendMessage, sendPrivateMessage, setTyping };
};

export default socket;
