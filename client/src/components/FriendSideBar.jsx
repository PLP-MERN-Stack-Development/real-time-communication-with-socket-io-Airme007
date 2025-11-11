import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

export default function FriendsSidebar({ users, username, onSelectUser }) {
  const [search, setSearch] = useState("");

  // Filter users (excluding self)
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => u.username !== username)
      .filter((u) => u.username && u.username.toLowerCase().includes(search.toLowerCase()));
  }, [users, username, search]);

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white/60 backdrop-blur-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Contacts</h2>

      <Input
        placeholder="Search friends..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id || user.username}
              onClick={() => onSelectUser(user)}
              className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition"
            >
              <span
                className={`w-3 h-3 rounded-full ${
                  user.online ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span className="text-sm font-medium">
                {user.username}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 text-sm py-8">
            No friends online
          </div>
        )}
      </div>
    </div>
  );
}
