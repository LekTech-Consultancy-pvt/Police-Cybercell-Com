import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Server, Phone, Shield, Send, Clock, CheckCircle, Lock } from 'lucide-react';

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

interface ISPDashboardProps {
  onLogout: () => void;
}

export function ISPDashboard({ onLogout }: ISPDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [subscriberName, setSubscriberName] = useState('');
  const [address, setAddress] = useState('');
  const [provider, setProvider] = useState('GlobalNet Communications');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('requests').select('*');
    setLoading(false);
    if (error) {
      console.error('Error fetching requests:', error);
      return;
    }
    setRequests(data || []);
  };

  const forwardedRequests = requests.filter(r => r.status === 'forwarded');
  const completedRequests = requests.filter(r => r.status === 'completed');

  const handleOpenDialog = (request: Request) => {
    setSelectedRequest(request);
    // Reset form fields when opening dialog
    setSubscriberName('');
    setAddress('');
    setProvider('GlobalNet Communications');
    setDialogOpen(true);
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequest || !subscriberName.trim() || !address.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('requests')
        .update({
          status: 'completed',
          result: {
            subscriberName: subscriberName.trim(),
            address: address.trim(),
            provider: provider.trim(),
            encrypted: true,
          },
        })
        .eq('id', selectedRequest.id);

      if (error) {
        throw error;
      }

      // Reset form and close dialog
      setSubscriberName('');
      setAddress('');
      setDialogOpen(false);
      setSelectedRequest(null);
      
      // Refresh requests
      await fetchRequests();
      
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Error submitting details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
              <Server className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ISP Provider Dashboard</h1>
              <p className="text-muted-foreground">GlobalNet Communications Portal</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{forwardedRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{completedRequests.length}</p>
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
                <Clock className="w-5 h-5 text-blue-600" />
                Requests Awaiting Response
              </CardTitle>
              <CardDescription>
                Investigation requests from cyber cell requiring subscriber details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {forwardedRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending requests
                </div>
              ) : (
                <div className="space-y-4">
                  {forwardedRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{request.phoneNumber}</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Station: {request.stationCode}</div>
                        <div>Received: {request.timestamp}</div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                        <div className="flex items-center gap-2 mb-2 text-blue-700">
                          <Shield className="w-3 h-3" />
                          <span>Subscriber Information Required</span>
                        </div>
                        <div className="space-y-1 text-blue-800">
                          <div><strong>Phone Number:</strong> {request.phoneNumber}</div>
                          <div><strong>Action:</strong> Please provide subscriber details for this number</div>
                        </div>
                      </div>

                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            onClick={() => handleOpenDialog(request)}
                            className="w-full"
                            size="sm"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Provide Encrypted Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Provide Subscriber Details</DialogTitle>
                            <DialogDescription>
                              Enter subscriber information for phone number: <strong>{selectedRequest?.phoneNumber}</strong>
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleSubmitDetails} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="subscriber">
                                Subscriber Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="subscriber"
                                value={subscriberName}
                                onChange={(e) => setSubscriberName(e.target.value)}
                                placeholder="Enter subscriber full name"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address">
                                Address <span className="text-red-500">*</span>
                              </Label>
                              <Textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Enter complete subscriber address"
                                required
                                rows={3}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="provider">
                                Service Provider <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="provider"
                                value={provider}
                                onChange={(e) => setProvider(e.target.value)}
                                placeholder="Enter provider name"
                                required
                              />
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                              <Shield className="w-4 h-4" />
                              <span>Data will be encrypted using AES-256 before transmission</span>
                            </div>
                            <Button 
                              type="submit" 
                              className="w-full" 
                              disabled={loading || !subscriberName.trim() || !address.trim() || !provider.trim()}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {loading ? 'Encrypting and Sending...' : 'Send Encrypted Response'}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Completed Requests</CardTitle>
              <CardDescription>
                History of processed investigation requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No completed requests yet
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {completedRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{request.phoneNumber}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
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
                              <span>Encrypted Data Sent</span>
                            </div>
                            <div className="text-green-800 space-y-1">
                              <div><strong>Subscriber:</strong> {request.result.subscriberName}</div>
                              <div><strong>Address:</strong> {request.result.address}</div>
                              <div><strong>Provider:</strong> {request.result.provider}</div>
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