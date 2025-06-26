import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { 
  Key, 
  Plus, 
  Copy, 
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
  Shield,
  Clock,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function APISettingsPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Mock API keys data
  const apiKeys = [
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk_live_abcd1234efgh5678ijkl9012mnop3456',
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'sk_test_qrst4567uvwx8901yzab2345cdef6789',
      lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      id: '3',
      name: 'Webhook Signing Secret',
      key: 'whsec_ghij7890klmn1234opqr5678stuv9012',
      lastUsed: null,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      status: 'inactive',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-gray-600 mt-2">
            Manage API keys for programmatic access to your account
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate New Key
        </Button>
      </div>

      {/* Security Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Keep your API keys secure!</strong> Never share them in public repositories or client-side code. 
          Treat them like passwords and rotate them regularly.
        </AlertDescription>
      </Alert>

      {/* API Keys Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Keys</p>
                <p className="text-2xl font-bold">
                  {apiKeys.filter(k => k.status === 'active').length}
                </p>
              </div>
              <Key className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">12,543</p>
              </div>
              <Shield className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Activity</p>
                <p className="text-2xl font-bold">2h ago</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            View and manage your API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {apiKey.key.substring(0, 7)}...{apiKey.key.substring(apiKey.key.length - 4)}
                      </code>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={apiKey.status === 'active' ? 'default' : 'secondary'}
                      className={apiKey.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {apiKey.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {apiKey.lastUsed 
                      ? `${Math.floor((Date.now() - apiKey.lastUsed.getTime()) / (1000 * 60 * 60))}h ago`
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {apiKey.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create New API Key */}
      <Card>
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            Generate a new API key for programmatic access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input 
                id="key-name" 
                placeholder="e.g., Production API Key"
                className="max-w-md"
              />
              <p className="text-sm text-gray-500">
                A descriptive name to help you identify this key
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Generate Key</Button>
              <Button type="button" variant="outline">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to use the SiteBango API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Base URL</h4>
            <code className="text-sm bg-gray-100 px-3 py-2 rounded block">
              https://api.suitebusiness.com/v1
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-2">Authentication</h4>
            <p className="text-sm text-gray-600 mb-2">
              Include your API key in the Authorization header:
            </p>
            <code className="text-sm bg-gray-100 px-3 py-2 rounded block">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-2">Available Endpoints</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• GET /sites - List all sites</li>
              <li>• POST /sites - Create a new site</li>
              <li>• GET /forms - List all forms</li>
              <li>• GET /submissions - Get form submissions</li>
              <li>• GET /analytics - Retrieve analytics data</li>
            </ul>
          </div>
          <Button variant="outline">
            View Full Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}