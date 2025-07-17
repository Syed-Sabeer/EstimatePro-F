import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  Eye, ExternalLink, Lock, Loader2, Trash2, DollarSign
} from 'lucide-react';
import { displayArea } from '@/lib/utils';

const DashboardPreviewSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});

  const fetchSurveys = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const surveysData = await clientSurveyAPI.getClientSurveys();
      // Get only the 5 most recent surveys
      const recentSurveys = (surveysData || []).slice(0, 5);
      setSurveys(recentSurveys);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

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

  const statusOptions = ['New', 'Contacted', 'Site Visit Done', 'Quote Sent', 'Quote Accepted', 'Quote Unsuccessful', 'Client Not Interested', 'Client Uncontactable'];

  const handleStatusChange = async (surveyId, newStatus) => {
    if (!user) return;
    
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
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this survey?')) return;
    
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

  const handleFeatureClick = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };
  
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="py-20 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Builder Dashboard Preview
          </h2>
          <p className="text-lg text-gray-600">
            Manage your leads and estimates all in one place with our intuitive dashboard.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white rounded-lg shadow-lg p-8 relative"
        >
          {/* Login Overlay */}
          {!user && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h3>
                <p className="text-gray-600 mb-4">Sign in to view your recent client surveys</p>
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Login to Access
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Recent Client Surveys</h3>
            <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Client</th>
                  <th className="hidden md:table-cell text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Phone</th>
                  <th className="hidden lg:table-cell text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Area</th>
                  <th className="hidden lg:table-cell text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Estimate Range</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-500 mx-auto" />
                    </td>
                  </tr>
                ) : surveys.length > 0 ? (
                  surveys.map((survey) => (
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
                      <td className="hidden lg:table-cell py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {survey.base_estimate ? `$${survey.base_estimate?.toLocaleString()}` : '-'}   -    {survey.high_estimate ? `$${survey.high_estimate?.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {user ? (
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
                        ) : (
                          <Badge variant="outline" className={`${getStatusBadge(survey.status)} text-xs`}>
                            {survey.status}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleFeatureClick}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(survey.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center">
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-800">No client surveys yet!</h3>
                        <p className="text-sm text-muted-foreground mt-1">Share your estimate link to get your first client survey.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-8">
            {user ? (
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Access Full Dashboard
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Login to Access Dashboard
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default DashboardPreviewSection;