import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Shield, Phone, Send, Clock, CheckCircle, AlertCircle, RefreshCw, LayoutDashboard, Globe } from 'lucide-react';
import { PhoneValidation } from './PhoneValidation';

import { encryptData, decryptData } from '../utils/encryption';

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

interface PoliceDashboardProps {
  stationCode: string;
  onLogout: () => void;
}

type View = 'dashboard' | 'validation';

export function PoliceDashboard({ stationCode, onLogout }: PoliceDashboardProps) {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch requests from Supabase on component mount
  useEffect(() => {
    fetchRequests();
  }, [stationCode]);

  const fetchRequests = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      // Fetch all requests and filter client-side since we need to decrypt to check stationCode
      // In a real app with RLS, the server would handle this auth/filtering
      const { data, error: fetchError } = await supabase
        .from('requests')
        .select('*')
        .order('timestamp', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const decryptedRequests = (data || []).map((req: any) => {
        // Decrypt station code and phone number
        const decryptedStationCode = decryptData(req.stationCode);
        const decryptedPhone = decryptData(req.phoneNumber);

        let decryptedResult = req.result;
        if (req.result && req.result.encrypted) {
          decryptedResult = {
            ...req.result,
            subscriberName: decryptData(req.result.subscriberName),
            address: decryptData(req.result.address),
            provider: decryptData(req.result.provider)
          };
        }

        return {
          ...req,
          stationCode: decryptedStationCode.replace(/^"|"$/g, ''), // Clean potential extra quotes from legacy data
          phoneNumber: decryptedPhone.replace(/^"|"$/g, ''),
          result: decryptedResult
        };
      }).filter(req => req.stationCode === stationCode);

      setRequests(decryptedRequests);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests. Please try refreshing.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const timestamp = new Date().toISOString();
      const encryptedPhone = encryptData(phoneNumber.trim());
      const encryptedStation = encryptData(stationCode);

      const { data, error: insertError } = await supabase
        .from('requests')
        .insert([
          {
            phoneNumber: encryptedPhone,
            timestamp,
            status: 'pending',
            stationCode: encryptedStation,
          },
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      if (data && data.length > 0) {
        // Manually constructing the new request object to avoid refetching immediately
        // and ensuring the UI shows the unencrypted data
        const newRequest: Request = {
          id: data[0].id,
          phoneNumber: phoneNumber.trim(),
          timestamp,
          status: 'pending',
          stationCode,
        };
        setRequests((prev) => [newRequest, ...prev]);
        setPhoneNumber('');
        setError(null);
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription to request updates
  useEffect(() => {
    const subscription = supabase
      .channel('request-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchRequests(); // Refresh data when changes occur
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [stationCode]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'forwarded': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'forwarded': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const filteredRequests = requests.filter(r =>
    r.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const forwardedRequests = requests.filter(r => r.status === 'forwarded');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Police Station Dashboard</h1>
              <p className="text-muted-foreground">Station Code: {stationCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
              onClick={() => setCurrentView('dashboard')}
              size="sm"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={currentView === 'validation' ? 'secondary' : 'ghost'}
              onClick={() => setCurrentView('validation')}
              size="sm"
            >
              <Globe className="w-4 h-4 mr-2" />
              Phone Validation
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Button
              variant="outline"
              onClick={fetchRequests}
              disabled={fetchLoading}
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${fetchLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {currentView === 'validation' ? (
          <PhoneValidation />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submit Request Form */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Submit Phone Investigation
                </CardTitle>
                <CardDescription>
                  Submit a phone number for investigation through cyber cell
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !phoneNumber.trim()}
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </form>

                {/* Quick Stats */}
                <div className="mt-6 space-y-3">
                  <Separator />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-yellow-50 rounded">
                      <div className="text-lg font-bold text-yellow-700">{pendingRequests.length}</div>
                      <div className="text-xs text-yellow-600">Pending</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-700">{forwardedRequests.length}</div>
                      <div className="text-xs text-blue-600">Forwarded</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-700">{completedRequests.length}</div>
                      <div className="text-xs text-green-600">Completed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Requests */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex flex-row items-center justify-between mb-4">
                  <div>
                    <CardTitle>Investigation Requests</CardTitle>
                    <CardDescription>
                      Track your submitted phone investigation requests
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    Total: {requests.length}
                  </Badge>
                </div>
                <div className="relative p-2">
                  {/* <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground p-2" /> */}
                  <Input
                    placeholder="Search phone numbers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 border border-gray-300 rounded-md"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {fetchLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">Loading requests...</p>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No requests submitted yet</p>
                    <p className="text-sm">Submit a phone number to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {filteredRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono font-medium">{request.phoneNumber}</span>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </Badge>
                        </div>

                        {/* <div className="text-sm text-muted-foreground">
                          <div>Submitted: {new Date(request.timestamp).toLocaleString()}</div>
                          <div>Request ID: {request.id.slice(0, 8)}...</div>
                        </div> */}

                        {request.status === 'pending' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-700">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Request submitted to cyber cell. Awaiting processing.</span>
                            </div>
                          </div>
                        )}

                        {request.status === 'forwarded' && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              <span>Request forwarded to ISP provider. Awaiting response.</span>
                            </div>
                          </div>
                        )}

                        {request.result && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">Investigation Complete</span>
                              </div>
                              <div className="bg-green-50 border border-green-200 rounded p-3 text-sm space-y-2">
                                <div><strong>Subscriber:</strong> {request.result.subscriberName}</div>
                                <div><strong>Address:</strong> {request.result.address}</div>
                                <div><strong>Provider:</strong> {request.result.provider}</div>
                                <div className="flex items-center gap-2 text-green-700 pt-2 border-t border-green-200">
                                  <Shield className="w-3 h-3" />
                                  <span className="text-xs">Data encrypted and securely transmitted</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {filteredRequests.length === 0 && searchQuery && (
                      <div className="text-center py-4 text-muted-foreground">
                        No requests found trying to match "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}