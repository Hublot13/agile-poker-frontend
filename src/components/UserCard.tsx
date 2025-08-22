import React, { useState, useRef, useEffect } from "react";
import { Crown, Check, Clock, MoreVertical } from "lucide-react";
import { User } from "../types";

interface UserCardProps {
  user: User;
  hasVoted?: boolean;
  vote?: string | number | null;
  showVote?: boolean;
  isCurrentUserHost?: boolean;
  onMakeHost?: (socketId: string) => void;
  onRemoveUser?: (socketId: string) => void;
}
export const UserCard: React.FC<UserCardProps> = ({
  user,
  hasVoted = false,
  vote = null,
  showVote = false,
  isCurrentUserHost = false,
  onMakeHost,
  onRemoveUser,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getVoteDisplay = () => {
    if (!showVote || vote === null || vote === undefined) return null;
    return (
      <div className="mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs font-semibold text-blue-800 dark:text-blue-200">
        {vote}
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm relative">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(user.name)}
          </div>
          {user.isHost && (
            <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.name}
            </p>
            {user.isHost && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                Host
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 mt-1">
            {hasVoted ? (
              <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                <Check className="w-3 h-3" />
                <span className="text-xs">Voted</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-gray-400">
                <Clock className="w-3 h-3" />
                <span className="text-xs">Waiting</span>
              </div>
            )}
          </div>

          {getVoteDisplay()}
        </div>

        {isCurrentUserHost && !user.isHost && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded shadow-lg z-50">
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => {
                    if (onMakeHost) onMakeHost(user.socketId);
                    setMenuOpen(false);
                  }}
                >
                  Make Host
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => {
                    if (onRemoveUser) onRemoveUser(user.socketId);
                    setMenuOpen(false);
                  }}
                >
                  Kick User
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
