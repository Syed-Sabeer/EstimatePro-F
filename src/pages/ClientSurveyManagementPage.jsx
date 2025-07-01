import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Eye, Trash2, Search, Filter, Download, Plus,
  Loader2, CalendarDays, User, Phone, Home, TrendingUp
} from 'lucide-react';
import { displayArea } from '@/lib/utils';

const ClientSurveyManagementPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState({});

  const statusOptions = ['New', 'Contacted', 'Site Visit Done', 'Quote Sent', 'Quote Accepted', 'Quote Unsuccessful', 'Client Not Interested', 'Client Uncontactable'];

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await clientSurveyAPI.getClientSurveys();
      setSurveys(data || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading surveys',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (surveyId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [surveyId]: true }));
    try {
      await clientSurveyAPI.updateClientSurveyStatus(surveyId, newStatus);
      setSurveys(prev => prev.map(survey => 
        survey.id === surveyId ? { ...survey, status: newStatus } : survey
      ));
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
    if (!confirm('Are you sure you want to delete this survey? This action cannot be undone.')) return;
    
    try {
      await clientSurveyAPI.deleteClientSurvey(surveyId);
      setSurveys(prev => prev.filter(survey => survey.id !== surveyId));
      toast({ title: 'Survey deleted successfully!' });
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error deleting survey', 
        description: error.message 
      });
    }
  };

  const handleViewDetail = (surveyId) => {
    navigate(`/dashboard/survey-detail/${surveyId}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Site Visit Done': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Quote Sent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Quote Accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'Quote Unsuccessful': return 'bg-red-100 text-red-800 border-red-200';
      case 'Client Not Interested': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Client Uncontactable': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.client_phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: surveys.length,
    new: surveys.filter(s => s.status === 'New').length,
    contacted: surveys.filter(s => s.status === 'Contacted').length,
    completed: surveys.filter(s => s.status === 'Quote Accepted').length
  };

  return (
    <>
      <Helmet>
        <title>Client Survey Management - EstiMate Pro</title>
      </Helmet>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Surveys</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all client survey submissions
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button variant="outline" onClick={() => window.open(`/client-survey?builder=${user?.id}`, '_blank')}>
              <Plus className="h-4 w-4 mr-2" />
              Survey Link
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Surveys</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by client name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Surveys Table */}
        <Card>
          <CardHeader>
            <CardTitle>Survey List ({filteredSurveys.length} of {surveys.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : filteredSurveys.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Client</th>
                      <th className="hidden md:table-cell text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Phone</th>
                      <th className="hidden lg:table-cell text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Area</th>
                      <th className="hidden lg:table-cell text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Project Type</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSurveys.map((survey) => (
                      <tr key={survey.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                            {new Date(survey.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">
                          {survey.client_name}
                        </td>
                        <td className="hidden md:table-cell py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {survey.client_phone}
                        </td>
                        <td className="hidden lg:table-cell py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {displayArea(survey.total_area)}
                        </td>
                        <td className="hidden lg:table-cell py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {survey.bathroom_type}
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={survey.status}
                            onValueChange={(value) => handleStatusUpdate(survey.id, value)}
                            disabled={updatingStatus[survey.id]}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue>
                                <Badge variant="outline" className={`${getStatusBadge(survey.status)} text-xs`}>
                                  {updatingStatus[survey.id] ? 'Updating...' : survey.status}
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
                              onClick={() => handleViewDetail(survey.id)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(survey.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete Survey"
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
                <h3 className="text-lg font-medium text-gray-800">
                  {searchTerm || statusFilter !== 'all' ? 'No surveys match your filters' : 'No client surveys yet!'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search terms or filters' 
                    : 'Share your estimate link to get your first client survey.'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button 
                    className="mt-4" 
                    onClick={() => window.open(`/client-survey?builder=${user?.id}`, '_blank')}
                  >
                    Get Survey Link
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default ClientSurveyManagementPage; 