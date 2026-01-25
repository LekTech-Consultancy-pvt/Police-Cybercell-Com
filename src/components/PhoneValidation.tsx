import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Phone, Globe, MapPin, Smartphone, Activity, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

// NOTE: Replace with your actual Abstract API key
const ABSTRACT_API_KEY = 'ff7d52fe02164d2d864234b83db06e5e';

interface ValidationResult {

    phone_validation: {
        is_valid: boolean;
    }


    number: {
        prefix: string;
        carrier: string;
        line: string;
    };
    country: {
        code: string;
        name: string;
        prefix: string;
    };
    location: string;
    type: string;
    carrier: string;
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
                `https://phoneintelligence.abstractapi.com
/
v1?api_key=${ABSTRACT_API_KEY}&phone=${phoneNumber}`
            );

            if (!response.ok) {
                throw new Error('Failed to validate phone number');
            }

            const data = await response.json();

            // Abstract API returns valid: true/false in the response
            setResult(data);
        } catch (err) {
            console.error('Validation error:', err);
            setError('Failed to validate phone number. Please check your API key and connection.');
        } finally {
            setLoading(false);
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
                        Validate phone numbers globally using Abstract API to check validity, line type, and carrier information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleValidate} className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="phone-validate" className="sr-only">Phone Number</Label>
                            <Input
                                id="phone-validate"
                                type="tel"
                                placeholder="+1 555 0123"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
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
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Validation Results</CardTitle>
                            <Badge variant={result.phone_validation.is_valid ? "default" : "destructive"} className={result.phone_validation.is_valid ? "bg-green-600" : "bg-red-600"}>
                                {result.phone_validation.is_valid ? (
                                    <><CheckCircle className="w-3 h-3 mr-1" /> Valid Number</>
                                ) : (
                                    <><AlertCircle className="w-3 h-3 mr-1" /> Invalid Number</>
                                )}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Country & Location</div>
                                        <div className="text-lg font-semibold">{result.country?.name || 'N/A'}</div>
                                        <div className="text-sm text-muted-foreground">{result.location || 'Location data unavailable'}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Line Type</div>
                                        <div className="text-lg font-semibold capitalize">{result.type || 'Unknown'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Carrier</div>
                                        <div className="text-lg font-semibold">{result.carrier || 'Unknown Carrier'}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">International Format</div>
                                        <div className="text-lg font-mono">{result.number?.prefix} {phoneNumber}</div>
                                        {/* Note: Ideally we use the full international format from API if available, 
                        but 'number' object structure depends on exact API response. 
                        Using user input for simplicity if API doesn't return formatted. 
                        Adjusting to assume API returns minimal needed. */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-auto">
                            <div className="text-muted-foreground mb-2">Raw API Response:</div>
                            <pre>{JSON.stringify(result, null, 2)}</pre>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
