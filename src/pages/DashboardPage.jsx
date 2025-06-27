import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, Users, TrendingUp, ArrowUp, ArrowDown, Link as LinkIcon, 
  Wrench, PlusCircle, BarChart2, Bell, Loader2
} from 'lucide-react';

const StatCard = ({ title, value, change, changeType, icon, loading }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{value}</div>}
        {!loading && change !== null && (
          <p className="text-xs text-muted-foreground flex items-center">
            <span className={`mr-1 flex items-center ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'increase' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {change}%
            </span>
            vs last month
          </p>
        )}
      </CardContent>
    </Card>
);

const RecentLeadsTable = ({ leads, loading }) => {
  const { toast } = useToast();
  const getStatusBadge = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Follow-up Needed': return 'bg-red-100 text-red-800 border-red-200';
      case 'Closed - Won': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="col-span-1 lg:col-span-3 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Lead Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Client</th>
                    <th className="hidden md:table-cell text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Estimate</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">{lead.client_name}</td>
                      <td className="hidden md:table-cell py-3 px-4 text-muted-foreground whitespace-nowrap">{lead.client_phone}</td>
                      <td className="py-3 px-4 text-orange-600 font-medium whitespace-nowrap">{lead.estimate_range}</td>
                      <td className="py-3 px-4"><Badge variant="outline" className={`${getStatusBadge(lead.status)} whitespace-nowrap`}>{lead.status}</Badge></td>
                      <td className="py-3 px-4 text-right"><Button variant="ghost" size="sm" onClick={() => toast({ title: "🚧 Details view coming soon!" })}>Details</Button></td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-800">No leads yet!</h3>
            <p className="text-sm text-muted-foreground mt-1">Share your estimate link to get your first lead.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
};

const DashboardPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [builderProfile, setBuilderProfile] = useState(null);
  const [stats, setStats] = useState({ leadsCount: 0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [estimateLink, setEstimateLink] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase.from('builders').select('full_name').eq('id', user.id).single();
      if(profileError) throw profileError;
      setBuilderProfile(profileData);

      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const { count, error: leadsError } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('builder_id', user.id).gte('created_at', firstDayOfMonth);
      if(leadsError) throw leadsError;
      setStats({ leadsCount: count });

      const { data: recentLeadsData, error: recentLeadsError } = await supabase.from('leads').select('*').eq('builder_id', user.id).order('created_at', { ascending: false }).limit(5);
      if(recentLeadsError) throw recentLeadsError;
      setRecentLeads(recentLeadsData);

      const { data: linkData, error: linkError } = await supabase.from('estimate_links').select('link_token').eq('builder_id', user.id).single();
      if (linkData) {
        setEstimateLink(`${window.location.origin}/form/${linkData.link_token}`);
      }

    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching dashboard data", description: error.message });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const generateLink = async () => {
    if (estimateLink) {
        navigator.clipboard.writeText(estimateLink);
        toast({ title: "Link copied to clipboard!", description: estimateLink });
        return;
    }
    const token = `${builderProfile.full_name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;
    const { data, error } = await supabase.from('estimate_links').insert({ builder_id: user.id, link_token: token }).select().single();
    
    if (error) {
        toast({ variant: "destructive", title: "Error generating link", description: error.message });
    } else {
        const newLink = `${window.location.origin}/form/${data.link_token}`;
        setEstimateLink(newLink);
        navigator.clipboard.writeText(newLink);
        toast({ title: '✅ Link Generated & Copied!', description: newLink });
    }
  };

  const testEstimateTool = () => toast({ title: '⚙️ Test Estimate Result', description: 'Based on mock data: Base Estimate: $18,500, High Estimate: $24,975.' });
  const handleFeatureClick = () => toast({ title: "🚧 Feature not implemented yet!" });

  const statsCards = [
    { title: 'Total Leads This Month', value: stats.leadsCount, change: null, icon: <Users className="h-4 w-4 text-muted-foreground" />, loading: loading },
    { title: 'Estimates Generated', value: '--', change: null, icon: <FileText className="h-4 w-4 text-muted-foreground" />, loading: loading },
    { title: 'Pending Follow-ups', value: '--', change: null, icon: <Bell className="h-4 w-4 text-muted-foreground" />, loading: loading },
    { title: 'Conversion Rate', value: '--', change: null, icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />, loading: loading },
  ];

  const builderName = builderProfile?.full_name || user?.email;

  return (
    <>
      <Helmet><title>Dashboard - EstiMate Pro</title><meta name="description" content="Manage your leads and estimates." /></Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {builderName}!</h1>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">{statsCards.map((stat, index) => (<StatCard key={index} {...stat} />))}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader><CardTitle>Lead Generation Tools</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Generate a unique link to your estimate form or test your current pricing setup.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={generateLink} className="bg-orange-500 hover:bg-orange-600 text-white"><LinkIcon className="mr-2 h-4 w-4" /> {estimateLink ? 'Copy Link' : 'Generate Link'}</Button>
                <Button onClick={testEstimateTool} variant="outline"><Wrench className="mr-2 h-4 w-4" /> Test Tool</Button>
              </div>
              {estimateLink && (<div className="mt-4 p-3 bg-gray-100 rounded-md text-sm break-words"><p className="font-medium text-gray-800">Your Link:</p><a href={estimateLink} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">{estimateLink}</a></div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button onClick={handleFeatureClick} variant="secondary" className="justify-start"><PlusCircle className="mr-2 h-4 w-4" />Create New Project</Button>
              <Button onClick={handleFeatureClick} variant="secondary" className="justify-start"><BarChart2 className="mr-2 h-4 w-4" />View Analytics</Button>
            </CardContent>
          </Card>
        </div>
        <RecentLeadsTable leads={recentLeads} loading={loading} />
      </motion.div>
    </>
  );
};

export default DashboardPage;