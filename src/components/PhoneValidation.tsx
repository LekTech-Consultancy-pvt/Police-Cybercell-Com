import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

import {
    Phone, Globe, MapPin, Smartphone, Activity, CheckCircle,
    AlertCircle, RefreshCw, Shield, AlertTriangle, Hash
} from 'lucide-react';

// NOTE: Replace with your actual Abstract API key
const ABSTRACT_API_KEY = 'ff7d52fe02164d2d864234b83db06e5e';

interface ValidationResult {
    phone_number: string;
    phone_format: {
        international: string;
        national: string;
    };
    phone_carrier: {
        name: string;
        line_type: string;
        mcc: string;
        mnc: string;
    };
    phone_location: {
        country_name: string;
        country_code: string;
        country_prefix: string;
        region: string;
        city: string;
        timezone: string;
    };
    phone_messaging: {
        sms_domain: string;
        sms_email: string;
    };
    phone_validation: {
        is_valid: boolean;
        line_status: string;
        is_voip: boolean;
        minimum_age: string | null;
    };
    phone_registration: {
        name: string | null;
        type: string | null;
    };
    phone_risk: {
        risk_level: string;
        is_disposable: boolean;
        is_abuse_detected: boolean;
    };
    phone_breaches: {
        total_breaches: number | null;
        date_first_breached: string | null;
        date_last_breached: string | null;
        breached_domains: string[];
    };
}

export function PhoneValidation() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber.trim()) {
            setError('Please enter a phone number');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(
                `https://phoneintelligence.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&phone=${phoneNumber}`
            );

            if (!response.ok) {
                throw new Error('Failed to validate phone number');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error('Validation error:', err);
            setError('Failed to validate phone number. Please check your API key and connection.');
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'low': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Phone Number Validator
                    </CardTitle>
                    <CardDescription>
                        Validate phone numbers globally to check validity, line type, risk score, and carrier information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleValidate} className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="phone-validate" className="sr-only">Phone Number</Label>
                            <Input
                                id="phone-validate"
                                type="tel"
                                placeholder="+91 9xxx xxx xx77"
                                value={phoneNumber}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setPhoneNumber(value && !value.startsWith('+91') ? `+91${value}` : value);
                                }}
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" disabled={loading || !phoneNumber.trim()}>
                            {loading ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Activity className="w-4 h-4 mr-2" />
                            )}
                            {loading ? 'Validating...' : 'Validate'}
                        </Button>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5">
                    {/* Status Header */}
                    <Card className={`border-l-4 ${result.phone_validation.is_valid ? 'border-l-green-500' : 'border-l-red-500'}`}>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        {result.phone_format.international || result.phone_number}
                                        {result.phone_validation.is_valid ? (
                                            <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Valid</Badge>
                                        ) : (
                                            <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Invalid</Badge>
                                        )}
                                    </h3>
                                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                                        <MapPin className="w-3 h-3" />
                                        {result.phone_location.city}, {result.phone_location.country_name}
                                    </p>
                                </div>
                                <div className={`px-4 py-2 rounded-lg font-medium capitalize text-sm ${getRiskColor(result.phone_risk.risk_level)}`}>
                                    Risk Level: {result.phone_risk.risk_level}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Location Details */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-500" />
                                    Location Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Country</div>
                                    <div className="font-medium text-right">{result.phone_location.country_name} ({result.phone_location.country_code})</div>
                                    <div className="text-muted-foreground">Region/City</div>
                                    <div className="font-medium text-right">{result.phone_location.region}, {result.phone_location.city}</div>
                                    <div className="text-muted-foreground">Timezone</div>
                                    <div className="font-medium text-right">{result.phone_location.timezone}</div>
                                    <div className="text-muted-foreground">Dial Code</div>
                                    <div className="font-medium text-right">{result.phone_location.country_prefix}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Carrier Info */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-purple-500" />
                                    Carrier Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Carrier</div>
                                    <div className="font-medium text-right">{result.phone_carrier.name || 'Unknown'}</div>
                                    <div className="text-muted-foreground">Line Type</div>
                                    <div className="font-medium text-right capitalize">{result.phone_carrier.line_type || 'Unknown'}</div>
                                    <div className="text-muted-foreground">Line Status</div>
                                    <div className="font-medium text-right capitalize">{result.phone_validation.line_status || 'Unknown'}</div>
                                    <div className="text-muted-foreground">Mobile Code</div>
                                    <div className="font-medium text-right">{result.phone_carrier.mcc}-{result.phone_carrier.mnc}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Risk & Security */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-orange-500" />
                                    Risk & Security
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-muted rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground mb-1">Disposable</div>
                                        <div className={`font-semibold ${result.phone_risk.is_disposable ? 'text-red-600' : 'text-green-600'}`}>
                                            {result.phone_risk.is_disposable ? 'Yes' : 'No'}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground mb-1">VOIP</div>
                                        <div className={`font-semibold ${result.phone_validation.is_voip ? 'text-orange-600' : 'text-green-600'}`}>
                                            {result.phone_validation.is_voip ? 'Yes' : 'No'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm border-t pt-3 mt-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-muted-foreground">Abuse Detected</span>
                                        <span className={`font-medium ${result.phone_risk.is_abuse_detected ? 'text-red-600' : 'text-green-600'}`}>
                                            {result.phone_risk.is_abuse_detected ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Formats & Technical */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-gray-500" />
                                    Formats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-muted-foreground">International Format</div>
                                        <div className="font-mono text-sm bg-muted p-1.5 rounded mt-1 select-all">{result.phone_format.international}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">National Format</div>
                                        <div className="font-mono text-sm bg-muted p-1.5 rounded mt-1 select-all">{result.phone_format.national}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registration / Breaches if any */}
                    {(result.phone_breaches.total_breaches || result.phone_registration.name) && (
                        <Card className="border-red-200 bg-red-50/10">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    Additional Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {result.phone_registration.name && (
                                    <div className="mb-4">
                                        <div className="text-sm text-muted-foreground">Registered Name</div>
                                        <div className="font-semibold">{result.phone_registration.name}</div>
                                    </div>
                                )}
                                {result.phone_breaches.total_breaches && result.phone_breaches.total_breaches > 0 && (
                                    <div>
                                        <div className="text-sm font-semibold text-red-700 mb-2">
                                            Found in similar data breaches ({result.phone_breaches.total_breaches})
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {result.phone_breaches.breached_domains.map((domain, i) => (
                                                <Badge key={i} variant="outline" className="border-red-200 text-red-700 bg-red-50">
                                                    {domain}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
