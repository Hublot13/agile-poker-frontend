import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { useSocket } from "../contexts/SocketContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const JoinRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode: urlRoomCode } = useParams();
  const { socket } = useSocket();
  const [, setUserSession] = useLocalStorage("poker-session", null);

  const [formData, setFormData] = useState({
    userName: "",
    roomCode: urlRoomCode || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlRoomCode) {
      setFormData((prev) => ({ ...prev, roomCode: urlRoomCode }));
    }
  }, [urlRoomCode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.userName.trim()) {
      newErrors.userName = "Name is required";
    } else if (formData.userName.trim().length < 2) {
      newErrors.userName = "Name must be at least 2 characters";
    }

    if (!formData.roomCode.trim()) {
      newErrors.roomCode = "Room code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !socket) return;

    setLoading(true);

    try {
      socket.emit(
        "join-room",
        {
          roomCode: formData.roomCode.trim().toUpperCase(),
          userName: formData.userName.trim(),
        },
        (response: any) => {
          setLoading(false);

          if (response.success) {
            // Save session for reconnection
            setUserSession({
              roomCode: formData.roomCode.trim().toUpperCase(),
              userName: formData.userName.trim(),
              isHost: false,
            });
            sessionStorage.setItem("join-response", JSON.stringify(response));
            localStorage.setItem("joinedOnce", "true");
            setTimeout(() => {
              navigate(`/room/${formData.roomCode.trim().toUpperCase()}`);
            }, 100);
          } else {
            setErrors({ submit: response.error || "Failed to join room" });
          }
        }
      );
    } catch (error) {
      setLoading(false);
      setErrors({ submit: "Failed to join room" });
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Join Planning Room
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Enter your details to join an existing session
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Name"
              type="text"
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
              error={errors.userName}
              placeholder="Enter your name"
              maxLength={50}
            />

            <Input
              label="Room Code"
              type="text"
              value={formData.roomCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  roomCode: e.target.value.toUpperCase(),
                })
              }
              error={errors.roomCode}
              placeholder="Enter room code"
              maxLength={10}
              style={{ textTransform: "uppercase" }}
            />

            {errors.submit && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {errors.submit}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={!socket}
              className="w-full"
            >
              Join Room
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};
