import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { BotSettings } from '@/components/admin/BotSettings';
import { BotDebugger } from '@/components/admin/BotDebugger';
import { ContactInfo } from '@/components/admin/ContactInfo';
import { 
  Users, 
  CreditCard, 
  GraduationCap, 
  MessageSquare, 
  TrendingUp, 
  Download,
  Send,
  Settings,
  BarChart3,
  User,
  DollarSign
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalPayments: number;
  activeSubscriptions: number;
  totalEnrollments: number;
  totalRevenue: number;
  todayUsers: number;
}

interface User {
  id: string;
  telegram_id: string;
  first_name: string;
  last_name: string;
  username: string;
  is_vip: boolean;
  created_at: string;
  subscription_expires_at: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  subscription_plans: {
    name: string;
  };
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPayments: 0,
    activeSubscriptions: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    todayUsers: 0
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const [usersResponse, paymentsResponse, subscriptionsResponse, enrollmentsResponse] = await Promise.all([
        supabase.from('bot_users').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('id', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('education_enrollments').select('id', { count: 'exact', head: true })
      ]);

      if (usersResponse.error) throw usersResponse.error;
      if (paymentsResponse.error) throw paymentsResponse.error;
      if (subscriptionsResponse.error) throw subscriptionsResponse.error;
      if (enrollmentsResponse.error) throw enrollmentsResponse.error;

      // Calculate revenue
      const { data: paymentsData, error: paymentsDataError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      if (paymentsDataError) throw paymentsDataError;
      const totalRevenue = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      // Get today's users
      const today = new Date().toISOString().split('T')[0];
      const { count: todayUsersCount, error: todayUsersError } = await supabase
        .from('bot_users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today);
      if (todayUsersError) throw todayUsersError;

      setStats({
        totalUsers: usersResponse.count || 0,
        totalPayments: paymentsResponse.count || 0,
        activeSubscriptions: subscriptionsResponse.count || 0,
        totalEnrollments: enrollmentsResponse.count || 0,
        totalRevenue,
        todayUsers: todayUsersCount || 0
      });

      // Fetch detailed data
      const { data: usersData, error: usersDataError } = await supabase
        .from('bot_users')
        .select('id, telegram_id, first_name, last_name, username, is_vip, created_at, subscription_expires_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (usersDataError) throw usersDataError;

      const { data: paymentsData2, error: paymentsData2Error } = await supabase
        .from('payments')
        .select('id, amount, currency, status, payment_method, created_at, subscription_plans(name)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (paymentsData2Error) throw paymentsData2Error;

      setUsers(usersData || []);
      setPayments(paymentsData2 || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (tableName: string) => {
    try {
      let data: unknown[] = [];
      
      // Type-safe table queries
      switch (tableName) {
        case 'bot_users': {
          const { data: users } = await supabase.from('bot_users').select('*');
          data = users || [];
          break;
        }
        case 'payments': {
          const { data: payments } = await supabase.from('payments').select('*');
          data = payments || [];
          break;
        }
        case 'user_subscriptions': {
          const { data: subscriptions } = await supabase.from('user_subscriptions').select('*');
          data = subscriptions || [];
          break;
        }
        case 'education_enrollments': {
          const { data: enrollments } = await supabase.from('education_enrollments').select('*');
          data = enrollments || [];
          break;
        }
        case 'promotions': {
          const { data: promotions } = await supabase.from('promotions').select('*');
          data = promotions || [];
          break;
        }
        case 'daily_analytics': {
          const { data: analytics } = await supabase.from('daily_analytics').select('*');
          data = analytics || [];
          break;
        }
        case 'contact_links': {
          const { data: contacts } = await supabase.from('contact_links').select('*');
          data = contacts || [];
          break;
        }
        default:
          throw new Error('Invalid table name');
      }

      // Convert to CSV
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
          Object.values(row).map(val => 
            typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
          ).join(',')
        );
        const csv = [headers, ...rows].join('\n');

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tableName}_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    
    setBroadcasting(true);
    try {
      // Call the actual Telegram bot broadcast function
      const { data, error } = await supabase.functions.invoke('telegram-bot', {
        body: {
          action: 'broadcast',
          message: broadcastMessage,
          target_audience: 'all'
        }
      });

      if (error) {
        throw error;
      }

      setBroadcastMessage('');
      alert(`Broadcast sent successfully to ${data?.recipients || 0} users!`);
    } catch (error) {
      console.error('Broadcast error:', error);
      alert('Failed to send broadcast: ' + (error.message || 'Unknown error'));
    } finally {
      setBroadcasting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={fetchDashboardData} variant="outline">
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.todayUsers} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPayments} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              VIP members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Education Enrollments</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Total enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="bot-debug" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bot-debug">🔧 Bot Debug</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="settings">Bot Settings</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>

        <TabsContent value="bot-debug" className="space-y-4">
          <BotDebugger />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest registered bot users</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{user.username || 'no_username'} • ID: {user.telegram_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.is_vip && <Badge variant="secondary">VIP</Badge>}
                        <Badge variant="outline">
                          {new Date(user.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          ${payment.amount} {payment.currency}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.subscription_plans?.name} • {payment.payment_method}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={payment.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {payment.status}
                        </Badge>
                        <Badge variant="outline">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast Message</CardTitle>
              <CardDescription>Send messages to all bot users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full h-32 p-3 border rounded-lg resize-none"
                placeholder="Enter your broadcast message..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button 
                  onClick={sendBroadcast} 
                  disabled={!broadcastMessage.trim() || broadcasting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {broadcasting ? 'Sending...' : 'Send Broadcast'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setBroadcastMessage('')}
                >
                  Clear
                </Button>
              </div>
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  This will send the message to all {stats.totalUsers} registered users.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <BotSettings />
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <ContactInfo />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'bot_users', title: 'Bot Users', description: 'All registered users' },
              { name: 'payments', title: 'Payments', description: 'Payment transactions' },
              { name: 'user_subscriptions', title: 'Subscriptions', description: 'User subscriptions' },
              { name: 'education_enrollments', title: 'Enrollments', description: 'Education enrollments' },
              { name: 'promotions', title: 'Promotions', description: 'Promotion codes' },
              { name: 'daily_analytics', title: 'Analytics', description: 'Daily analytics data' },
              { name: 'contact_links', title: 'Contact Links', description: 'Bot contact information' }
            ].map((table) => (
              <Card key={table.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{table.title}</CardTitle>
                  <CardDescription>{table.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => exportData(table.name)}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};