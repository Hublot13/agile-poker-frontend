import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConnectionStatus } from './components/ConnectionStatus';
import { HomePage } from './pages/HomePage';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { JoinRoomPage } from './pages/JoinRoomPage';
import { PlanningRoomPage } from './pages/PlanningRoomPage';
import { NotificationProvider } from './contexts/NotficationContext';

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <ConnectionStatus />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/create" element={<CreateRoomPage />} />
                <Route path="/join" element={<JoinRoomPage />} />
                <Route path="/join/:roomCode" element={<JoinRoomPage />} />
                <Route path="/room/:roomCode" element={<PlanningRoomPage />} />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
