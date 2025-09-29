import { useState } from 'react';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Shield, Building, Server } from 'lucide-react';
import { supabase } from '../supabaseClient';

export type UserRole = 'police' | 'cyber' | 'isp';

interface LoginFormProps {
  onLogin: (role: UserRole, stationCode?: string) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [role, setRole] = useState<UserRole>('police');
  const [stationCode, setStationCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let email;
    // For demo, use stationCode as email for police, or role@demo.com for others
    if (role === 'police') {
      email = stationCode + '@police.demo';
    } else {
      email = role + '@demo.com';
    }
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      setError(loginError.message);
      return;
    }
    onLogin(role, stationCode);
  };

  const roleConfig = {
    police: {
      icon: Shield,
      title: 'Police Station Login',
      description: 'Enter your unique station code and credentials',
      showStationCode: true
    },
    cyber: {
      icon: Building,
      title: 'Cyber Cell Login',
      description: 'Access cyber crime investigation portal',
      showStationCode: false
    },
    isp: {
      icon: Server,
      title: 'ISP Provider Login',
      description: 'Internet Service Provider access portal',
      showStationCode: false
    }
  };

  const config = roleConfig[role];
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <IconComponent className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm mb-2">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="police">Police Station</SelectItem>
                  <SelectItem value="cyber">Cyber Cell</SelectItem>
                  <SelectItem value="isp">ISP Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.showStationCode && (
              <div className="space-y-2">
                <Label htmlFor="stationCode">Station Code</Label>
                <Input
                  id="stationCode"
                  type="text"
                  placeholder="Enter unique station code"
                  value={stationCode}
                  onChange={(e) => setStationCode(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Demo Credentials:</p>
            <div className="text-xs space-y-1">
              <div>Police: Station Code "PS001", Password: "demo123"</div>
              <div>Cyber Cell: Password "cyber123"</div>
              <div>ISP: Password "isp123"</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}