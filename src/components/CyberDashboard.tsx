import { Button } from './ui/button';
import { decryptData } from '../utils/encryption';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Building, Phone, ArrowRight, Send, Shield, Clock, CheckCircle, RefreshCw } from 'lucide-react';

interface Request {
  id: string;
  phoneNumber: string;
  timestamp: string;
  status: 'pending' | 'forwarded' | 'completed';
  stationCode: string;
  crimeHistory?: string;
  result?: {
    subscriberName: string;
    address: string;
    provider: string;
    encrypted: boolean;
  };
}

interface CyberDashboardProps {
  onLogout: () => void;
}

export function CyberDashboard({ onLogout }: CyberDashboardProps) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch requests from Supabase
  const fetchRequests = async () => {
    setRefreshing(true);
    const { data, error } = await supabase.from('requests').select('*');

    if (error) {
      setRefreshing(false);
      // Optionally handle error (e.g., show toast)
      return;
    }

    const decryptedRequests = (data || []).map((req: any) => {
      let decryptedResult = req.result;
      if (req.result && req.result.encrypted) {
        decryptedResult = {
          ...req.result,
          subscriberName: decryptData(req.result.subscriberName),
          address: decryptData(req.result.address),
          provider: decryptData(req.result.provider)
        };
      }

      const decryptedCrimeHistory = req.crimeHistory ? decryptData(req.crimeHistory) : undefined;

      return {
        ...req,
        stationCode: decryptData(req.stationCode).replace(/^"|"$/g, ''),
        phoneNumber: decryptData(req.phoneNumber).replace(/^"|"$/g, ''),
        crimeHistory: decryptedCrimeHistory ? decryptedCrimeHistory.replace(/^"|"$/g, '') : undefined,
        result: decryptedResult
      };
    });

    setRequests(decryptedRequests);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Forward request handler
  const handleForwardRequest = async (requestId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('requests')
      .update({ status: 'forwarded' })
      .eq('id', requestId);
    setLoading(false);
    if (error) {
      // Optionally handle error (e.g., show toast)
      return;
    }
    // Refresh requests
    fetchRequests();
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const forwardedRequests = requests.filter(r => r.status === 'forwarded');
  const completedRequests = requests.filter(r => r.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'forwarded': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Building className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1>Cyber Cell Dashboard</h1>
              <p className="text-muted-foreground">Investigation Request Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchRequests} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-2xl">{pendingRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ArrowRight className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl">{forwardedRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Forwarded to ISP</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl">{completedRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                Pending Requests
              </CardTitle>
              <CardDescription>
                New requests from police stations requiring review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending requests
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{request.phoneNumber}</span>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>From: Station {request.stationCode}</div>
                        <div>Submitted: {request.timestamp}</div>
                      </div>

                      <Button
                        onClick={() => handleForwardRequest(request.id)}
                        className="w-full"
                        size="sm"
                        disabled={loading}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {loading ? 'Forwarding...' : 'Forward to ISP'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Requests */}
          <Card>
            <CardHeader>
              <CardTitle>All Requests</CardTitle>
              <CardDescription>
                Complete history of investigation requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No requests processed yet
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {requests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{request.phoneNumber}</span>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          <span className="capitalize">{request.status}</span>
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Station: {request.stationCode}</div>
                        <div>{request.timestamp}</div>
                      </div>

                      {request.result && (
                        <>
                          <Separator />
                          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                            <div className="flex items-center gap-2 mb-2 text-green-700">
                              <Shield className="w-3 h-3" />
                              <span>Encrypted Response Received</span>
                            </div>
                            <div className="text-green-800">
                              Provider: {request.result.provider}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}