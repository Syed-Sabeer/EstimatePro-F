import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { clientSurveyAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, Users, TrendingUp, ArrowUp, ArrowDown, Link as LinkIcon, 
  Wrench, PlusCircle, BarChart2, Bell, Loader2, Eye, Trash2, DollarSign, MoreHorizontal
} from 'lucide-react';
import { displayArea } from '@/lib/utils';

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

const RecentSurveysTable = ({ surveys, loading, onStatusUpdate, onDelete }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [updatingStatus, setUpdatingStatus] = useState({});
  
  const statusOptions = [
    'New', 
    'Contacted', 
    'Site Visit Done', 
    'Quote Sent', 
    'Quote Accepted', 
    'Quote Unsuccessful', 
    'Client Not Interested', 
    'Client Uncontactable'
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Site Visit Done': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Quote Sent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Quote Accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'Quote Unsuccessful': return 'bg-red-100 text-red-800 border-red-200';
      case 'Client Not Interested': return 'bg-red-100 text-red-800 border-red-200';
      case 'Client Uncontactable': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = async (surveyId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [surveyId]: true }));
    try {
      await onStatusUpdate(surveyId, newStatus);
      toast({ title: 'Status updated successfully!' });
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error updating status', 
        description: error.message 
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [surveyId]: false }));
    }
  };

  const handleDelete = async (surveyId) => {
    if (!confirm('Are you sure you want to delete this survey?')) return;
    
    try {
      await onDelete(surveyId);
      toast({ title: 'Survey deleted successfully!' });
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error deleting survey', 
        description: error.message 
      });
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
        <CardTitle>Recent Client Surveys</CardTitle>
      </CardHeader>
      <CardContent>
        {surveys.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Client</th>
                    <th className="hidden md:table-cell text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Phone</th>
                    <th className="hidden lg:table-cell text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Area</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {surveys.map((survey) => (
                    <tr key={survey.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap">
                        {new Date(survey.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">
                        {survey.client_name}
                      </td>
                      <td className="hidden md:table-cell py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {survey.client_phone}
                      </td>
                      <td className="hidden lg:table-cell py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {survey.total_area ? displayArea(survey.total_area) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Select
                          value={survey.status}
                          onValueChange={(value) => handleStatusChange(survey.id, value)}
                          disabled={updatingStatus[survey.id]}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              <Badge variant="outline" className={`${getStatusBadge(survey.status)} text-xs`}>
                                {survey.status}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/dashboard/survey-detail/${survey.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(survey.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-800">No client surveys yet!</h3>
            <p className="text-sm text-muted-foreground mt-1">Share your estimate link to get your first client survey.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
};

const DashboardPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    surveysCount: 0, 
    newSurveys: 0, 
    contactedSurveys: 0, 
    completedSurveys: 0 
  });
  const [recentSurveys, setRecentSurveys] = useState([]);
  const [estimateLink, setEstimateLink] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch client surveys
      const surveysData = await clientSurveyAPI.getClientSurveys();
      setRecentSurveys(surveysData || []);

      // Calculate stats from surveys
      const totalSurveys = surveysData?.length || 0;
      const newSurveys = surveysData?.filter(s => s.status === 'New').length || 0;
      const contactedSurveys = surveysData?.filter(s => s.status === 'Contacted').length || 0;
      const completedSurveys = surveysData?.filter(s => s.status === 'Quote Accepted').length || 0;

      setStats({
        surveysCount: totalSurveys,
        newSurveys,
        contactedSurveys,
        completedSurveys
      });

      // Generate estimate link based on user ID
      if (user.id) {
        const link = `${window.location.origin}/client-survey?builder=${user.id}`;
        setEstimateLink(link);
      }

    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error fetching dashboard data", 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStatusUpdate = async (surveyId, newStatus) => {
    await clientSurveyAPI.updateClientSurveyStatus(surveyId, newStatus);
    await fetchDashboardData(); // Refresh data
  };

  const handleDeleteSurvey = async (surveyId) => {
    await clientSurveyAPI.deleteClientSurvey(surveyId);
    await fetchDashboardData(); // Refresh data
  };

  const generateLink = async () => {
    if (estimateLink) {
        navigator.clipboard.writeText(estimateLink);
        toast({ title: "Link copied to clipboard!", description: estimateLink });
        return;
    }
  };

  const testEstimateTool = () => toast({ 
    title: '⚙️ Test Estimate Result', 
    description: 'Based on sample data: Floor area 20m², Wall area 45m², Total estimate range: $1,500 - $2,200.' 
  });
  
  const handleFeatureClick = () => toast({ title: "🚧 Feature not implemented yet!" });

  const statsCards = [
    { 
      title: 'Total Surveys', 
      value: stats.surveysCount, 
      change: null, 
      icon: <Users className="h-4 w-4 text-muted-foreground" />, 
      loading: loading 
    },
    { 
      title: 'New Surveys', 
      value: stats.newSurveys, 
      change: null, 
      icon: <FileText className="h-4 w-4 text-muted-foreground" />, 
      loading: loading 
    },
    { 
      title: 'Contacted', 
      value: stats.contactedSurveys, 
      change: null, 
      icon: <Bell className="h-4 w-4 text-muted-foreground" />, 
      loading: loading 
    },
    { 
      title: 'Quotes Accepted', 
      value: stats.completedSurveys, 
      change: null, 
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />, 
      loading: loading 
    },
  ];

  const userName = user?.name || user?.email || 'Builder';

  return (
    <>
      <Helmet>
        <title>Dashboard - EstiMate Pro</title>
        <meta name="description" content="Manage your client surveys and estimates." />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}!</h1>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {statsCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Client Survey Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share your client survey link to collect project information and generate estimates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={generateLink} 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Copy Survey Link
                </Button>
                <Button onClick={testEstimateTool} variant="outline">
                  <Wrench className="mr-2 h-4 w-4" />
                  Test Calculator
                </Button>
              </div>
              {estimateLink && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm break-words">
                  <p className="font-medium text-gray-800">Your Survey Link:</p>
                  <a 
                    href={estimateLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-orange-600 hover:underline"
                  >
                    {estimateLink}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button onClick={handleFeatureClick} variant="secondary" className="justify-start">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
              <Button onClick={handleFeatureClick} variant="secondary" className="justify-start">
                <BarChart2 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
        <RecentSurveysTable 
          surveys={recentSurveys} 
          loading={loading} 
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDeleteSurvey}
        />
      </motion.div>
    </>
  );
};

export default DashboardPage;