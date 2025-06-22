// Consolidated CRM Components
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Phone,
  Clock,
  User,
  Search, 
  Plus, 
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { type GHLContact } from '@/lib/ghl';

// ==================== COMMUNICATION HUB ====================

interface Message {
  id: string;
  type: 'sms' | 'email' | 'call';
  direction: 'inbound' | 'outbound';
  contactName: string;
  content: string;
  timestamp: Date;
}

export function CommunicationHub({ siteId }: { siteId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    setMessages([
      {
        id: '1',
        type: 'sms',
        direction: 'inbound',
        contactName: 'John Doe',
        content: 'Hi, I\'m interested in your services',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: '2',
        type: 'sms',
        direction: 'outbound',
        contactName: 'John Doe',
        content: 'Thanks for reaching out! I\'d be happy to help.',
        timestamp: new Date(Date.now() - 3000000),
      },
      {
        id: '3',
        type: 'email',
        direction: 'outbound',
        contactName: 'Jane Smith',
        content: 'Following up on our conversation...',
        timestamp: new Date(Date.now() - 86400000),
      },
    ]);
    setLoading(false);
  }, []);

  const sendMessage = async (type: 'sms' | 'email') => {
    if (!messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    // Mock sending - replace with actual API call
    toast.success(`${type.toUpperCase()} sent successfully`);
    
    setMessageContent('');
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  if (loading) {
    return <div>Loading communications...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {Array.from(new Set(messages.map(m => m.contactName))).map((contactName) => {
              const lastMessage = messages
                .filter(m => m.contactName === contactName)
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
              
              return (
                <div
                  key={contactName}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedContact === contactName ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setSelectedContact(contactName)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {contactName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{contactName}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(lastMessage.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        {getMessageIcon(lastMessage.type)}
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedContact || 'Select a conversation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[500px]">
          {selectedContact ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages
                  .filter(m => m.contactName === selectedContact)
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.direction === 'outbound'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {getMessageIcon(message.type)}
                          <span className="text-xs opacity-70">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Message Input */}
              <div className="border-t pt-4">
                <Tabs defaultValue="sms" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="sms">SMS</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="sms" className="space-y-2">
                    <Textarea
                      placeholder="Type your SMS message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button onClick={() => sendMessage('sms')} className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Send SMS
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="email" className="space-y-2">
                    <Input placeholder="Subject" className="mb-2" />
                    <Textarea
                      placeholder="Type your email message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button onClick={() => sendMessage('email')} className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Send Email
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to view messages
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== CONTACTS LIST ====================

export function ContactsList({ siteId }: { siteId: string }) {
  const [contacts, setContacts] = useState<GHLContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, [searchTerm]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/crm/contacts?' + new URLSearchParams({
        siteId,
        search: searchTerm,
      }));
      
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      } else if (response.status === 401) {
        setError('GoHighLevel API not configured. Please add your GHL_API_KEY and GHL_LOCATION_ID to your environment variables.');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to fetch contacts');
      }
    } catch (error) {
      setError('Failed to connect to CRM');
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async (contact: GHLContact) => {
    // Implementation for SMS dialog
    toast.info('SMS sending interface would open here');
  };

  const handleSendEmail = async (contact: GHLContact) => {
    // Implementation for email dialog
    toast.info('Email composer would open here');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading contacts...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <div className="py-8">
                    <div className="text-red-600 font-medium mb-2">CRM Connection Error</div>
                    <div className="text-sm text-gray-600 max-w-md mx-auto">{error}</div>
                    {error.includes('GHL_API_KEY') && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-left max-w-md mx-auto">
                        <h4 className="font-medium text-yellow-900 mb-2">Setup Instructions:</h4>
                        <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                          <li>Get your API key from GoHighLevel Agency Settings</li>
                          <li>Copy your Location ID from the GHL dashboard</li>
                          <li>Add them to your .env.local file</li>
                          <li>Restart your development server</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.firstName} {contact.lastName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {contact.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {contact.tags?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{contact.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {contact.lastActivity ? 
                      new Date(contact.lastActivity).toLocaleDateString() : 
                      'No activity'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSendEmail(contact)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSendSMS(contact)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.location.href = `tel:${contact.phone}`}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ==================== PIPELINE VIEW ====================

interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
}

interface PipelineStage {
  id: string;
  name: string;
  order: number;
}

interface Opportunity {
  id: string;
  name: string;
  contactName: string;
  pipelineStageId: string;
  monetaryValue: number;
  status: string;
}

export function PipelineView({ siteId }: { siteId: string }) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API calls
    setPipelines([
      {
        id: '1',
        name: 'Sales Pipeline',
        stages: [
          { id: 's1', name: 'Lead', order: 1 },
          { id: 's2', name: 'Qualified', order: 2 },
          { id: 's3', name: 'Proposal', order: 3 },
          { id: 's4', name: 'Closed', order: 4 },
        ],
      },
    ]);

    setOpportunities([
      {
        id: 'o1',
        name: 'Website Redesign',
        contactName: 'John Doe',
        pipelineStageId: 's1',
        monetaryValue: 5000,
        status: 'open',
      },
      {
        id: 'o2',
        name: 'SEO Campaign',
        contactName: 'Jane Smith',
        pipelineStageId: 's2',
        monetaryValue: 3000,
        status: 'open',
      },
    ]);

    setLoading(false);
  }, []);

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter(opp => opp.pipelineStageId === stageId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return <div>Loading pipeline...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Deal
        </Button>
      </div>

      {pipelines.map((pipeline) => (
        <div key={pipeline.id}>
          <h3 className="text-lg font-semibold mb-4">{pipeline.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {pipeline.stages.map((stage) => {
              const stageOpportunities = getOpportunitiesByStage(stage.id);
              const totalValue = stageOpportunities.reduce(
                (sum, opp) => sum + opp.monetaryValue,
                0
              );

              return (
                <div key={stage.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{stage.name}</h4>
                    <Badge variant="secondary">
                      {stageOpportunities.length}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(totalValue)}
                  </div>
                  
                  <div className="space-y-2">
                    {stageOpportunities.map((opp) => (
                      <Card key={opp.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm">{opp.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <p className="text-xs text-muted-foreground">
                            {opp.contactName}
                          </p>
                          <div className="flex items-center mt-2">
                            <DollarSign className="h-3 w-3 mr-1" />
                            <span className="text-sm font-medium">
                              {formatCurrency(opp.monetaryValue)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Export all types and interfaces
export type { Message, Pipeline, PipelineStage, Opportunity };
