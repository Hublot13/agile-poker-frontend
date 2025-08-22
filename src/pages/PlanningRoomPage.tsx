import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Share2,
  Play,
  Eye,
  RotateCcw,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { VotingCard } from "../components/VotingCard";
import { UserCard } from "../components/UserCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useSocket } from "../contexts/SocketContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Room, RoomStats, User, DECKS } from "../types";
import { useNotification } from "../contexts/NotficationContext";

export const PlanningRoomPage: React.FC = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { notify } = useNotification();

  const [userSession] = useLocalStorage("poker-session", null);

  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [selectedVote, setSelectedVote] = useState<string | number | null>(
    null
  );
  const [userVotes, setUserVotes] = useState<Record<string, string | number>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (room && currentUser) {
      const updated = room.hostSocketId === currentUser.socketId;
      if (currentUser.isHost !== updated) {
        setCurrentUser({ ...currentUser, isHost: updated });
      }
    }
  }, [room?.hostSocketId, room, currentUser]);

  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("joinedOnce");
      sessionStorage.removeItem("join-response");
      if (socket) {
        socket.emit("leave-room");
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!socket || !roomCode || hasJoinedRef.current) return;

    // Try to rejoin with saved session
    const savedSession = userSession as {
      roomCode: string;
      userName: string;
      isHost: boolean;
    } | null;

    const alreadyJoined = localStorage.getItem("joinedOnce") === "true";
    const savedResponse = sessionStorage.getItem("join-response");

    if (alreadyJoined && savedResponse) {
      const response = JSON.parse(savedResponse);
      handleJoinResponse(response); // ✅ directly call it without emitting
      hasJoinedRef.current = true;
    } else if (savedSession && savedSession.roomCode === roomCode) {
      hasJoinedRef.current = true;
      socket.emit(
        "join-room",
        {
          roomCode,
          userName: savedSession.userName,
        },
        (response: any) => {
          handleJoinResponse(response);
          sessionStorage.setItem("join-response", JSON.stringify(response));
        }
      );
    } else {
      setError("No session found. Please join the room again.");
      setLoading(false);
    }
  }, [socket, roomCode, userSession]);

  useEffect(() => {
    if (!socket) return;

    // Socket event listeners
    socket.on("user-joined", (data) => {
      notify(
        `${data.user.name} ${
          data.isReconnection ? "reconnected" : "joined"
        } the room`
      );
      if (room) {
        const updatedUsers = room.users.filter(
          (u) => u.socketId !== data.user.socketId
        );
        updatedUsers.push(data.user);
        setRoom({ ...room, users: updatedUsers });
      }
    });

    socket.on("user-left", (data) => {
      notify(`${data.userName} left the room`);
      if (data.newHost) {
        notify(`${data.newHost} is now the host`);
      }
      setStats(data.stats);
      if (room) {
        const updatedUsers = room.users.filter((u) => u.name !== data.userName);
        setRoom({
          ...room,
          users: updatedUsers,
          hostSocketId: data.newHost
            ? updatedUsers.find((u) => u.name === data.newHost)?.socketId ||
              room.hostSocketId
            : room.hostSocketId,
        });
      }
    });

    socket.on("voting-started", (data) => {
      setRoom((prev) =>
        prev ? { ...prev, roundState: data.roundState } : null
      );
      setSelectedVote(null);
      setUserVotes({});
    });

    socket.on("vote-cast", (data) => {
      setStats(data.stats);
      setUserVotes((prev) => ({
        ...prev,
        [data.userName]: data.vote,
      }));
    });

    socket.on("votes-revealed", (data) => {
      notify("Votes have been revealed!");
      setRoom((prev) =>
        prev ? { ...prev, roundState: data.roundState } : null
      );
      setStats(data.stats);
      setUserVotes(data.votes || {});
    });

    socket.on("round-reset", (data) => {
      notify("Round has been reset");
      setRoom((prev) =>
        prev ? { ...prev, roundState: data.roundState } : null
      );
      setSelectedVote(null);
      setUserVotes({});
      setStats(null);
    });

    socket.on("room-updated", (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.newHostName) {
        notify(`${updatedRoom.newHostName} is now the host`);
      }
    });

    socket.on("removed", () => {
      notify("You were removed from the room");
      navigate("/");
    });

    return () => {
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("voting-started");
      socket.off("vote-cast");
      socket.off("votes-revealed");
      socket.off("round-reset");
      socket.off("room-updated");
      socket.off("removed");
    };
  }, [socket, room]);

  const handleJoinResponse = (response: any) => {
    setLoading(false);
    if (response.success) {
      setRoom(response.room);
      setCurrentUser(response.user);
      setStats(response.stats);
      if (response.userVote) {
        setSelectedVote(response.userVote);
      }
      if (response.stats?.votes) {
        setUserVotes(response.stats.votes);
      }
      if (response.isReconnection) {
        notify("Successfully reconnected to the room");
      }
    } else {
      setError(response.error);
    }
  };
  const handleLeaveRoom = () => {
    localStorage.removeItem("joinedOnce");
    sessionStorage.removeItem("join-response");
    if (socket) {
      socket.emit("leave-room", () => {
        navigate("/");
      });
    } else {
      navigate("/");
    }
  };

  const handleVote = (vote: string | number) => {
    if (!socket || room?.roundState !== "voting") return;

    setSelectedVote(vote);
    socket.emit("cast-vote", { vote }, (response: any) => {
      if (!response.success) {
        setSelectedVote(null);
        notify("Failed to cast vote");
      }
    });
  };

  const handleStartVoting = () => {
    if (!socket) return;
    socket.emit("start-voting", (response: any) => {
      if (!response.success) {
        notify("Failed to start voting");
      } else {
        notify("Voting Started");
        setStats(response.stats);
      }
    });
  };

  const handleRevealVotes = () => {
    if (!socket) return;
    socket.emit("reveal-votes", (response: any) => {
      if (!response.success) {
        notify("Failed to reveal votes");
      }
    });
  };

  const handleResetRound = () => {
    if (!socket) return;
    socket.emit("reset-round", (response: any) => {
      if (!response.success) {
        notify("Failed to reset round");
      }
    });
    handleStartVoting();
  };

  const handleMakeHost = (targetSocketId: string) => {
    if (!socket) return;

    socket.emit("make-host", { targetSocketId }, (response: any) => {
      if (!response.success) {
        notify("Failed to make host");
      }
    });
  };

  const onRemoveUser = (targetSocketId: string) => {
    if (!socket) return;

    socket.emit("remove-user", { targetSocketId }, (response: any) => {
      if (!response.success) {
        notify("Failed to kick user");
      }
    });
  };

  const copyRoomLink = async () => {
    const link = `${window.location.origin}/join/${roomCode}`;
    try {
      await navigator.clipboard.writeText(link);
      notify("Room link copied to clipboard!");
    } catch (error) {
      notify("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Joining room...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Unable to join room
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!room || !currentUser) return null;

  const deck = DECKS[room.deckType as keyof typeof DECKS];
  const isHost = currentUser.isHost;
  const canVote = room.roundState === "voting";
  const showVotes = room.roundState === "revealed";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Button variant="ghost" size="sm" onClick={handleLeaveRoom}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Leave
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Room {roomCode}
              </h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{room.users.length} users</span>
              </span>
              {stats && (
                <span>
                  {stats.votedUsers}/{stats.totalUsers} voted
                </span>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={copyRoomLink}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            {isHost && (
              <>
                {room.roundState === "idle" && (
                  <Button size="sm" onClick={handleStartVoting}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Voting
                  </Button>
                )}

                {room.roundState === "voting" && (
                  <Button size="sm" onClick={handleRevealVotes}>
                    <Eye className="w-4 h-4 mr-2" />
                    Reveal
                  </Button>
                )}

                {room.roundState === "revealed" && (
                  <Button size="sm" onClick={handleResetRound}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Round
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Voting Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {room.roundState === "idle" && "Waiting to start voting"}
                    {room.roundState === "voting" && "Voting in progress..."}
                    {room.roundState === "revealed" && "Votes revealed"}
                  </h3>
                  {stats?.average !== null && stats?.average !== undefined && (
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      Average: {stats.average}
                    </p>
                  )}
                </div>

                {room.roundState === "voting" && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats?.votedUsers || 0}/{stats?.totalUsers || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      votes cast
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Voting Cards */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {deck.name} Cards
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {deck.cards.map((card) => (
                  <VotingCard
                    key={card}
                    value={card}
                    selected={selectedVote === card}
                    disabled={!canVote}
                    onClick={() => handleVote(card)}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Users Panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Participants ({room.users.length})
            </h3>

            <div className="space-y-3">
              {room.users.map((user) => (
                <UserCard
                  key={user.socketId}
                  user={user}
                  hasVoted={user.name in userVotes}
                  vote={userVotes[user.name]}
                  showVote={showVotes}
                  isCurrentUserHost={isHost}
                  onMakeHost={handleMakeHost}
                  onRemoveUser={onRemoveUser}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
