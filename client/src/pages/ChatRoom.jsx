import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../socket/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import FriendsSidebar from '@/components/FriendSideBar';

export default function ChatRoom({ username, onLogout }) {
  const { connect, disconnect, messages, users, typingUsers, sendMessage, setTyping, isConnected } = useSocket();
  const [text, setText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMobileContacts, setShowMobileContacts] = useState(false);
  const scroller = useRef();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  useEffect(() => {
    scroller.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
    setTyping(false);
  };

  const logout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    onLogout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <FriendsSidebar
        users={users.map((u) => ({
          username: u,
          online: true,
        }))}
        username={username}
        onSelectUser={(u) => setSelectedUser(u)}
      />

      {/* Chat Section */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="fixed top-0 left-0 md:left-64 right-0 z-40 flex items-center justify-between p-4 bg-white shadow">
          <div className="flex items-center gap-2">
            {/* Mobile Contacts Button */}
            <div className="md:hidden relative">
              <button
                onClick={() => setShowMobileContacts(!showMobileContacts)}
                className="bg-blue-500 text-white p-2 rounded-lg shadow hover:bg-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>

              {/* Mobile Contacts Dropdown */}
              {showMobileContacts && (
                <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64 max-h-80 overflow-y-auto z-50">
                  <h3 className="text-lg font-semibold mb-3">Contacts</h3>
                  {users.filter(u => u !== username).length > 0 ? (
                    users.filter(u => u !== username).map((user) => (
                      <div
                        key={user}
                        onClick={() => {
                          setSelectedUser({ username: user, online: true });
                          setShowMobileContacts(false);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                      >
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">{user}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-4">
                      No friends online
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">Airme Chat</h2>
              <p className="text-sm text-gray-500">
                {selectedUser
                  ? `Chatting with ${selectedUser.username}`
                  : `Hello ${username}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">Online: {users.length}</div>
            <button
              onClick={logout}
              className="bg-red-400 text-white p-2 rounded hover:bg-red-500 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50 pt-20">
          {!isConnected && (
            <div className="text-center text-gray-500 mb-4">
              Connecting to server...
            </div>
          )}
          <div className="max-w-2xl mx-auto">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`mb-3 ${
                  m.system ? 'text-center text-gray-500 italic' : ''
                }`}
              >
                {!m.system && (
                  <div className="text-xs text-gray-400">
                    {m.username} •{' '}
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </div>
                )}
                {m.system ? (
                  <div className="text-center text-gray-500 italic">
                    {m.message}
                  </div>
                ) : (
                  <Card
                    className={`w-fit ${
                      m.username === username
                        ? 'ml-auto bg-blue-500 text-white'
                        : 'bg-white'
                    }`}
                  >
                    <CardContent className="p-3">{m.message}</CardContent>
                  </Card>
                )}
              </div>
            ))}
            <div ref={scroller} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white">
          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-500 mb-2">
              {typingUsers.join(', ')} typing...
            </div>
          )}
          <form onSubmit={submit} className="max-w-2xl mx-auto flex gap-2">
            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setTyping(true);
              }}
              className="flex-1 border rounded-xl p-3"
              placeholder={
                selectedUser
                  ? `Message ${selectedUser.username}...`
                  : 'Type a message...'
              }
            />
            <button className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition-colors">
              <svg
                className="w-5 h-5 transform rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}