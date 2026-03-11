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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(/cyber_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <Card className="w-full max-w-md z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] border border-white/20 bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden text-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 shadow-inner border border-white/10 backdrop-blur-sm">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">{config.title}</CardTitle>
          <CardDescription className="text-white/80">{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm mb-2">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-white">Role</Label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="police" className="focus:bg-slate-800 focus:text-white">Police Station</SelectItem>
                  <SelectItem value="cyber" className="focus:bg-slate-800 focus:text-white">Cyber Cell</SelectItem>
                  <SelectItem value="isp" className="focus:bg-slate-800 focus:text-white">ISP Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.showStationCode && (
              <div className="space-y-2">
                <Label htmlFor="stationCode" className="text-white">Station Code</Label>
                <Input
                  id="stationCode"
                  type="text"
                  placeholder="Enter unique station code"
                  value={stationCode}
                  onChange={(e) => setStationCode(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
              />
            </div>

            <Button type="submit" className="w-full bg-black hover:bg-black text-white border-0 shadow-lg mt-4 h-11">
              Secure Login
            </Button>
          </form>

          {/* <div className="mt-8 p-4 bg-black/40 border border-white/10 rounded-lg backdrop-blur-md">
            <p className="text-sm font-medium text-white/90 mb-3 border-b border-white/10 pb-2">Demo Credentials:</p>
            <div className="text-xs space-y-2 text-white/70">
              <div className="flex justify-between items-center"><span className="text-white/50">Police</span> <span className="font-mono bg-black/30 px-2 py-0.5 rounded">PS001 / demo123</span></div>
              <div className="flex justify-between items-center"><span className="text-white/50">Cyber Cell</span> <span className="font-mono bg-black/30 px-2 py-0.5 rounded">cyber123</span></div>
              <div className="flex justify-between items-center"><span className="text-white/50">ISP</span> <span className="font-mono bg-black/30 px-2 py-0.5 rounded">isp123</span></div>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}