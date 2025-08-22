import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { useSocket } from "../contexts/SocketContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { DECKS, DeckType } from "../types";

export const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [, setUserSession] = useLocalStorage("poker-session", null);

  const [formData, setFormData] = useState({
    hostName: "",
    deckType: "fibonacci" as DeckType,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.hostName.trim()) {
      newErrors.hostName = "Name is required";
    } else if (formData.hostName.trim().length < 2) {
      newErrors.hostName = "Name must be at least 2 characters";
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
        "create-room",
        {
          hostName: formData.hostName.trim(),
          deckType: formData.deckType,
        },
        (response: any) => {
          setLoading(false);

          if (response.success) {
            // Save session for reconnection
            setUserSession({
              roomCode: response.roomCode,
              userName: formData.hostName.trim(),
              isHost: true,
            });
            sessionStorage.setItem("join-response", JSON.stringify(response));
            localStorage.setItem("joinedOnce", "true");

            setTimeout(() => {
              navigate(`/room/${response.roomCode}`);
            }, 100);
          } else {
            setErrors({ submit: response.error || "Failed to create room" });
          }
        }
      );
    } catch (error) {
      setLoading(false);
      setErrors({ submit: "Failed to create room" });
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
            Create Planning Room
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Set up a new planning poker session for your team
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Name"
              type="text"
              value={formData.hostName}
              onChange={(e) =>
                setFormData({ ...formData, hostName: e.target.value })
              }
              error={errors.hostName}
              placeholder="Enter your name"
              maxLength={50}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Estimation Deck
              </label>
              <div className="space-y-2">
                {Object.entries(DECKS).map(([key, deck]) => (
                  <label
                    key={key}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="deckType"
                      value={key}
                      checked={formData.deckType === key}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deckType: e.target.value as DeckType,
                        })
                      }
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {deck.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {deck.cards.slice(0, 6).join(", ")}...
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

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
              Create Room
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};
