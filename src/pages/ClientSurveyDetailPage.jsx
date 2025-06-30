import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
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
import { 
  ArrowLeft, User, Phone, Home, Ruler, Calendar, Settings,
  MapPin, DollarSign, Clock, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

const ClientSurveyDetailPage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusOptions = ['New', 'Contacted', 'In Progress', 'Completed', 'Cancelled'];

  useEffect(() => {
    loadSurveyDetail();
  }, [surveyId]);

  const loadSurveyDetail = async () => {
    try {
      setLoading(true);
      const data = await clientSurveyAPI.getClientSurveyDetail(surveyId);
      setSurvey(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading survey details',
        description: error.message
      });
      navigate('/dashboard/client-survey');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await clientSurveyAPI.updateClientSurveyStatus(surveyId, newStatus);
      setSurvey(prev => ({ ...prev, status: newStatus }));
      toast({ title: 'Status updated successfully!' });
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error updating status', 
        description: error.message 
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Survey Not Found</h2>
        <p className="text-muted-foreground mt-2">This survey may have been deleted or you don't have access to it.</p>
        <Button className="mt-4" onClick={() => navigate('/dashboard/client-survey')}>
          Back to Surveys
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Survey Details - {survey.client_name} - EstiMate Pro</title>
      </Helmet>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/client-survey')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Surveys
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Survey Details</h1>
              <p className="text-muted-foreground">Survey #{survey.id}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className={`${getStatusBadge(survey.status)} px-3 py-1`}>
              {survey.status}
            </Badge>
            <Select
              value={survey.status}
              onValueChange={handleStatusUpdate}
              disabled={updatingStatus}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-lg font-medium">{survey.client_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-lg font-medium">{survey.client_phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bathroom Type</label>
                    <p className="text-lg">{survey.bathroom_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tiling Level</label>
                    <p className="text-lg">{survey.tiling_level}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Design Style</label>
                    <p className="text-lg">{survey.design_style}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Home Age</label>
                    <p className="text-lg">{survey.home_age_category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Measurements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Ruler className="h-5 w-5 mr-2" />
                  Measurements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {survey.total_area && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Area</label>
                      <p className="text-lg font-medium">{survey.total_area.toFixed(1)} m²</p>
                    </div>
                  )}
                  {survey.floor_length && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Floor Length</label>
                      <p className="text-lg">{survey.floor_length} m</p>
                    </div>
                  )}
                  {survey.floor_width && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Floor Width</label>
                      <p className="text-lg">{survey.floor_width} m</p>
                    </div>
                  )}
                  {survey.wall_height && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Wall Height</label>
                      <p className="text-lg">{survey.wall_height} m</p>
                    </div>
                  )}
                  {survey.calculated_floor_area && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Floor Area</label>
                      <p className="text-lg">{survey.calculated_floor_area.toFixed(1)} m²</p>
                    </div>
                  )}
                  {survey.calculated_wall_area && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Wall Area</label>
                      <p className="text-lg">{survey.calculated_wall_area.toFixed(1)} m²</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estimates */}
            {(survey.budget_area || survey.standard_area || survey.premium_area) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Area Estimates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {survey.budget_area && (
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">Budget</h4>
                        <p className="text-2xl font-bold text-blue-600">{survey.budget_area.toFixed(1)} m²</p>
                      </div>
                    )}
                    {survey.standard_area && (
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-yellow-900">Standard</h4>
                        <p className="text-2xl font-bold text-yellow-600">{survey.standard_area.toFixed(1)} m²</p>
                      </div>
                    )}
                    {survey.premium_area && (
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900">Premium</h4>
                        <p className="text-2xl font-bold text-green-600">{survey.premium_area.toFixed(1)} m²</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                  <p className="text-sm">{formatDate(survey.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">{formatDate(survey.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Client
                </Button>
                <Button className="w-full" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Generate Quote
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Visit
                </Button>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Survey ID:</span>
                  <span className="font-medium">#{survey.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{survey.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Area:</span>
                  <span className="font-medium">{survey.total_area ? `${survey.total_area.toFixed(1)} m²` : 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className={`${getStatusBadge(survey.status)} text-xs`}>
                    {survey.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ClientSurveyDetailPage; 