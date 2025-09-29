import { useState, useEffect } from 'react';
import { LoginForm, type UserRole } from './components/LoginForm';
import { PoliceDashboard } from './components/PoliceDashboard';
import { CyberDashboard } from './components/CyberDashboard';
import { ISPDashboard } from './components/ISPDashboard';

interface Request {
  id: string;
  phoneNumber: string;
  timestamp: string;
  status: 'pending' | 'forwarded' | 'completed';
  stationCode: string;
  result?: {
    subscriberName: string;
    address: string;
    provider: string;
    encrypted: boolean;
  };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    role: UserRole;
    stationCode?: string;
  } | null>(null);
  const handleLogin = (role: UserRole, stationCode?: string) => {
    setCurrentUser({ role, stationCode });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  switch (currentUser.role) {
    case 'police':
      return (
        <PoliceDashboard
          stationCode={currentUser.stationCode!}
          onLogout={handleLogout}
        />
      );
    case 'cyber':
      return (
        <CyberDashboard
          onLogout={handleLogout}
        />
      );
    case 'isp':
      return (
        <ISPDashboard
          onLogout={handleLogout}
        />
      );
    default:
      return <LoginForm onLogin={handleLogin} />;
  }
}