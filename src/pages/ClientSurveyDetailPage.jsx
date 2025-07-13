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
  MapPin, DollarSign, Clock, Loader2, CheckCircle, AlertCircle,
  Camera, Eye, X, Download, Info
} from 'lucide-react';
import { displayArea } from '@/lib/utils';

const ClientSurveyDetailPage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Download image function - avoids CORS issues by using direct anchor download
  const downloadImage = async (imageUrl, filename) => {
    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename || `project-photo-${Date.now()}.jpg`;
      link.target = '_blank'; // Open in new tab if download fails
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      toast({
        title: 'Download started',
        description: 'The image download should begin shortly.',
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: 'Unable to download the image. The image will open in a new tab instead.',
      });
      
      // Fallback: open image in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const statusOptions = ['New', 'Contacted', 'Site Visit Done', 'Quote Sent', 'Quote Accepted', 'Quote Unsuccessful', 'Client Not Interested', 'Client Uncontactable'];

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
      case 'Site Visit Done': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Quote Sent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Quote Accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'Quote Unsuccessful': return 'bg-red-100 text-red-800 border-red-200';
      case 'Client Not Interested': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Client Uncontactable': return 'bg-slate-100 text-slate-800 border-slate-200';
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
           
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Client Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Client Name</label>
                    <p className="text-xl font-bold text-gray-900">{survey.client_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact Phone</label>
                    <p className="text-xl font-bold text-blue-600">{survey.client_phone}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Ready for contact</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Project Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bathroom Type</label>
                    <p className="text-lg font-medium">{survey.bathroom_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tiling Level</label>
                    <p className="text-lg font-medium">{survey.tiling_level || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                    <p className="text-lg font-medium">{survey.property_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Home Age</label>
                    <p className="text-lg font-medium">{survey.home_age_category || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Survey Questions & Answers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Survey Questions & Answers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Property Type */}
                  <div className="border-b border-gray-100 pb-3">
                    <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                    <p className="text-lg font-medium mt-1">
                      {survey.property_type || 'Not specified'}
                    </p>
                  </div>
                  
                  {/* Home Age */}
                  <div className="border-b border-gray-100 pb-3">
                    <label className="text-sm font-medium text-muted-foreground">Age of Home</label>
                    <p className="text-lg font-medium mt-1">
                      {survey.home_age_category || 'Not specified'}
                    </p>
                  </div>
                  
                  {/* Tiling Level */}
                  <div className="border-b border-gray-100 pb-3">
                    <label className="text-sm font-medium text-muted-foreground">Tile Preference</label>
                    <p className="text-lg font-medium mt-1">
                      {survey.tiling_level === 'Budget' ? 'Budget - Tiles in wet areas only' : 
                       survey.tiling_level === 'Standard' ? 'Standard - Tiles in wet areas PLUS certain areas as feature wall' : 
                       survey.tiling_level === 'Premium' ? 'Premium - Floor to ceiling tiles' : 
                       survey.tiling_level || 'Not specified'}
                    </p>
                  </div>
                  
                  {/* Include Tiles */}
                  <div className="border-b border-gray-100 pb-3">
                    <label className="text-sm font-medium text-muted-foreground">Would you like for the tiles to be included in the estimate?</label>
                    <p className="text-lg font-medium mt-1">
                      {survey.include_tiles === 'yes' ? 'Yes, please! - Include in the estimate' : 
                       survey.include_tiles === 'no' ? 'No, thank you - I will supply my own tiles' : 'Not specified'}
                    </p>
                  </div>
                  
                  {/* Toilet Move */}
                  <div className="border-b border-gray-100 pb-3">
                    <label className="text-sm font-medium text-muted-foreground">Will the toilet stay where it is, or be moved?</label>
                    <p className="text-lg font-medium mt-1">
                      {survey.toilet_move === 'stay' ? 'Toilet will remain the same location' : 
                       survey.toilet_move === 'move' ? 'Toilet will change location - Moving plumbing may affect estimate accuracy and require additional consultation' : 'Not specified'}
                    </p>
                  </div>
                  
                  {/* Wall Change */}
                  <div className="border-b border-gray-100 pb-3">
                    <label className="text-sm font-medium text-muted-foreground">Will you be knocking down or shifting a wall?</label>
                    <p className="text-lg font-medium mt-1">
                      {survey.wall_change === 'yes' ? 'Yes - Structural changes may require additional permits and engineering consultation' : 
                       survey.wall_change === 'no' ? 'No' : 'Not specified'}
                    </p>
                  </div>
                  
                  {/* Bathroom Type */}
                  <div className="border-b border-gray-100 pb-3">
                    <label className="text-sm font-medium text-muted-foreground">Bathroom Type</label>
                    <p className="text-lg font-medium mt-1">
                      {survey.bathroom_type || 'Not specified'}
                    </p>
                  </div>
                  
                  {/* Design Style */}
                  <div className="border-b border-gray-100 pb-3">
                    <label className="text-sm font-medium text-muted-foreground">Design Style</label>
                    <p className="text-lg font-medium mt-1">
                      {survey.design_style || 'Not specified'}
                    </p>
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
                {/* Measurement Method */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <label className="text-sm font-medium text-blue-900">Measurement Method</label>
                  <p className="text-sm text-blue-700 mt-1">
                    {survey.floor_length && survey.floor_width && survey.wall_height ? 
                      'Individual measurements provided (Length × Width × Height)' :
                      survey.total_area ? 
                      'Total area provided directly' : 
                      'Measurement method not specified'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {survey.total_area && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Area</label>
                      <p className="text-lg font-medium">{displayArea(survey.total_area)}</p>
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
                      <label className="text-sm font-medium text-muted-foreground">Calculated Floor Area</label>
                      <p className="text-lg">{displayArea(survey.calculated_floor_area)}</p>
                    </div>
                  )}
                  {survey.calculated_wall_area && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Calculated Wall Area</label>
                      <p className="text-lg">{displayArea(survey.calculated_wall_area)}</p>
                    </div>
                  )}
                  {survey.calculated_total_area && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Calculated Total Area</label>
                      <p className="text-lg">{displayArea(survey.calculated_total_area)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Project Photos
                  </div>
                  {(() => {
                    let photos = [];
                    try {
                      if (survey.photos && survey.photos !== '[]' && survey.photos !== 'null' && survey.photos !== null) {
                        photos = typeof survey.photos === 'string' ? JSON.parse(survey.photos) : survey.photos;
                        photos = Array.isArray(photos) ? photos.filter(url => url && url.trim() !== '') : [];
                      }
                    } catch (e) {
                      photos = [];
                    }
                    return photos.length > 0 ? (
                      <Badge variant="outline" className="text-xs">
                        {photos.length} photo{photos.length !== 1 ? 's' : ''}
                      </Badge>
                    ) : null;
                  })()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  let photos = [];
                  try {
                    if (survey.photos && survey.photos !== '[]' && survey.photos !== 'null' && survey.photos !== null) {
                      photos = typeof survey.photos === 'string' ? JSON.parse(survey.photos) : survey.photos;
                      photos = Array.isArray(photos) ? photos.filter(url => url && url.trim() !== '') : [];
                    }
                  } catch (e) {
                    console.error('Error parsing photos:', e);
                    photos = [];
                  }
                  
                  return photos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {photos.map((photoUrl, index) => (
                      <div 
                        key={index} 
                        className="relative group cursor-pointer"
                        onClick={(e) => {
                          setSelectedPhoto({ url: photoUrl, index: index + 1 });
                        }}
                      >
                        <img
                          src={photoUrl}
                          alt={`Project photo ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg border border-gray-200 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedPhoto({ url: photoUrl, index: index + 1 });
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="hidden w-full h-40 bg-gray-100 rounded-lg border border-gray-200 items-center justify-center text-gray-500 text-sm"
                        >
                          <div className="text-center">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>Image not available</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                downloadImage(photoUrl, `project-photo-${index + 1}.jpg`);
                              }}
                              className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                              title="Download image"
                            >
                              <Download className="h-4 w-4 text-gray-700" />
                            </button>
                            <div className="bg-white rounded-full p-3 shadow-lg">
                              <Eye className="h-5 w-5 text-gray-700" />
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                                            ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Camera className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No photos uploaded</h3>
                        <p className="text-sm">The client didn't upload any photos for this survey</p>
                      </div>
                    );
                  })()}
                </CardContent>
            </Card>

            {/* Estimates */}
            {(survey.budget_area || survey.standard_area || survey.premium_area || survey.base_estimate || survey.high_estimate) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Estimates & Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(survey.budget_area || survey.standard_area || survey.premium_area) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Area Estimates</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {survey.budget_area && (
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900">Budget</h4>
                            <p className="text-2xl font-bold text-blue-600">{displayArea(survey.budget_area)}</p>
                          </div>
                        )}
                        {survey.standard_area && (
                          <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <h4 className="font-medium text-yellow-900">Standard</h4>
                            <p className="text-2xl font-bold text-yellow-600">{displayArea(survey.standard_area)}</p>
                          </div>
                        )}
                        {survey.premium_area && (
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-900">Premium</h4>
                            <p className="text-2xl font-bold text-green-600">{displayArea(survey.premium_area)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {(survey.base_estimate || survey.high_estimate) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Price Estimates</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {survey.base_estimate && (
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <h4 className="font-medium text-orange-900">Base Estimate</h4>
                            <p className="text-2xl font-bold text-orange-600">${survey.base_estimate?.toLocaleString()}</p>
                          </div>
                        )}
                        {survey.high_estimate && (
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <h4 className="font-medium text-red-900">High Estimate</h4>
                            <p className="text-2xl font-bold text-red-600">${survey.high_estimate?.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start">
                          <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Estimate Calculation Method:</p>
                            <ul className="text-xs space-y-1">
                              <li>• Base estimate includes all applicable line items based on client selections</li>
                              <li>• Builder's labour and access fees may be calculated as fixed prices or percentages of subtotal</li>
                              <li>• High estimate adds 30% buffer for unknowns and variations</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                  <span className="font-medium">{survey.total_area ? displayArea(survey.total_area) : 'Not specified'}</span>
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

                {/* Photo Modal - SweetAlert Style */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 backdrop-blur-md bg-white bg-opacity-20 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Project Photo {selectedPhoto.index}</h3>
                <div className="flex items-center space-x-2">
                  {/* Download Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(selectedPhoto.url, `project-photo-${selectedPhoto.index}.jpg`);
                    }}
                    className="flex items-center px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    title="Download image"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                  {/* Close Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    aria-label="Close modal"
                    title="Close modal"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              {/* Image Container */}
              <div className="p-4">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedPhoto.url}
                    alt={`Project photo ${selectedPhoto.index}`}
                    className="w-full h-full object-cover"
                    onClick={(e) => e.stopPropagation()}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="hidden w-full h-full bg-gray-100 items-center justify-center text-gray-500"
                  >
                    <div className="text-center">
                      <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg">Image not available</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer with Navigation */}
              {(() => {
                let photos = [];
                try {
                  if (survey.photos && survey.photos !== '[]' && survey.photos !== 'null' && survey.photos !== null) {
                    photos = typeof survey.photos === 'string' ? JSON.parse(survey.photos) : survey.photos;
                    photos = Array.isArray(photos) ? photos.filter(url => url && url.trim() !== '') : [];
                  }
                } catch (e) {
                  photos = [];
                }
                
                const currentIndex = selectedPhoto.index - 1;
                const hasPrevious = currentIndex > 0;
                const hasNext = currentIndex < photos.length - 1;
                
                return photos.length > 1 ? (
                  <div className="flex items-center justify-between p-4 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasPrevious) {
                          setSelectedPhoto({ 
                            url: photos[currentIndex - 1], 
                            index: currentIndex 
                          });
                        }
                      }}
                      disabled={!hasPrevious}
                      className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                        hasPrevious 
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    <span className="text-sm text-gray-500">
                      {selectedPhoto.index} of {photos.length}
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasNext) {
                          setSelectedPhoto({ 
                            url: photos[currentIndex + 1], 
                            index: currentIndex + 2 
                          });
                        }
                      }}
                      disabled={!hasNext}
                      className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                        hasNext 
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Next
                      <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default ClientSurveyDetailPage; 