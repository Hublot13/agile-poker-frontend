import React from 'react';
import { Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Agile Poker
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Collaborate with your team to estimate user stories using planning poker.
            Create a room to get started or join an existing session.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6" hoverable onClick={() => navigate('/create')}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Create Room
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Start a new planning poker session and invite your team members
                </p>
              </div>
              <Button className="w-full">
                Create New Room
              </Button>
            </div>
          </Card>

          <Card className="p-6" hoverable onClick={() => navigate('/join')}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Join Room
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Enter a room code to join an existing planning session
                </p>
              </div>
              <Button variant="secondary" className="w-full">
                Join Existing Room
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            How it works
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                1
              </div>
              <p>Create or join a planning room</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                2
              </div>
              <p>Vote on story points together</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                3
              </div>
              <p>Reveal and discuss estimates</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};