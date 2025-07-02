import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { clientSurveyAPI } from '@/lib/api';
import { Home, UploadCloud, Check, Loader2 } from 'lucide-react';

const surveyConfig = {
  welcome_title: "Hi there! Welcome to EstiMate",
  welcome_subtitle: "Let's get started on your bathroom renovation estimate",
  welcome_info: "Your builder wants to provide you with an estimate and needs to collect some basic information about your bathroom renovation.",
  steps: [
    {
      step: 1,
      title: "Contact Information",
      fields: [
        { id: "full_name", label: "Your Name *", type: "text", placeholder: "Enter your full name" },
        { id: "phone_number", label: "Your Contact Number *", type: "text", placeholder: "Enter your phone number" }
      ]
    },
    {
      step: 2,
      title: "Bathroom Measurements",
      fields: [
        { 
          id: "measurement_type", type: "radio_toggle", options: [
            { value: "direct", label: "Enter total size directly", sublabel: "If you know the total square meters" },
            { value: "calculate", label: "Let us calculate it for you", sublabel: "Enter individual measurements" }
          ],
          width: "full"
        },
        { id: "total_size", label: "Total Size (square meters) *", type: "text", placeholder: "e.g., 12.5", condition: { field: "measurement_type", value: "direct" }, width: "full" }
      ]
    },
    {
      step: 3,
      title: "Property Details",
      fields: [
        { id: "property_type", label: "Please select one option *", type: "radio", options: ["House or Unit", "Apartment", "Other / Not sure"], width: "full" },
        { id: "home_age", label: "Age of Home *", type: "radio", options: ["Less than 10 years old", "10-30 years old", "30-50 years old", "Over 50 years old", "Not sure"], width: "full" }
      ]
    },
    {
      step: 4,
      title: "Tile Preference and Design Choices",
      fields: [
        { id: "tile_preference", label: "Please select one option *", type: "radio", options: [
            { value: "budget", label: "Budget", "sublabel": "Tiles in wet areas only" },
            { value: "standard", label: "Standard", "sublabel": "Tiles in wet areas PLUS certain areas as feature wall" },
            { value: "premium", label: "Premium", "sublabel": "Floor to ceiling tiles" }
        ], width: "full"},
        { id: "include_tiles", label: "Would you like for the tiles to be included in the estimate? *", type: "radio_toggle", options: [
            { value: "no", label: "No, thank you", "sublabel": "I will supply my own tiles" },
            { value: "yes", label: "Yes, please!", "sublabel": "Include in the estimate" }
        ], width: "full"}
      ]
    },
    {
      step: 5,
      title: "Structural Changes",
      fields: [
        { id: "toilet_move", label: "Will the toilet stay where it is, or be moved? *", type: "radio", options: [
            { value: "stay", label: "Toilet will remain the same location" },
            { value: "move", label: "Toilet will change location", "sublabel": "Moving plumbing may affect estimate accuracy and require additional consultation." }
        ], width: "full"},
        { id: "wall_change", label: "Will you be knocking down or shifting a wall? *", type: "radio", options: [
            { value: "no", label: "No" },
            { value: "yes", label: "Yes", "sublabel": "Structural changes may require additional permits and engineering consultation." }
        ], width: "full"}
      ]
    },
    {
      step: 6,
      title: "Photo/Video Upload",
      fields: [
        { id: "file_upload", label: "Please upload your photos (max 10 photos, no larger than 5MB per file)", type: "file_drop", width: "full" }
      ]
    }
  ],
  submit_button_text: "Get My Estimate"
};

const SurveyStep = ({ step, title, children }) => (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start mb-6">
        <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-bold mr-4">{step}</div>
        <h2 className="text-2xl font-semibold text-gray-800 pt-1">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );

const RadioToggle = ({ options, value, onValueChange, fieldId }) => (
  <RadioGroup value={value} onValueChange={onValueChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {options.map(option => (
      <Label key={option.value} htmlFor={`${fieldId}-${option.value}`} className={`flex flex-col items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${value === option.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
        <div className="flex items-center justify-between w-full">
          <div className="text-sm font-semibold">{option.label}</div>
          <RadioGroupItem value={option.value} id={`${fieldId}-${option.value}`} className="hidden" />
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${value === option.value ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
            {value === option.value && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
        {option.sublabel && <div className="text-xs text-muted-foreground mt-1">{option.sublabel}</div>}
      </Label>
    ))}
  </RadioGroup>
);

const ClientSurveyPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [submitting, setSubmitting] = useState(false);
    
    const builderId = searchParams.get('builder');
    
    const [formData, setFormData] = useState(() => {
        const initialData = {};
        surveyConfig.steps.forEach(step => {
          step.fields.forEach(field => {
            if (field.type === 'radio_toggle') initialData[field.id] = field.options[0].value;
            else if (field.type === 'radio') initialData[field.id] = null;
            else initialData[field.id] = '';
          });
        });
        return initialData;
    });

  const handleInputChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const existingFiles = Array.from(formData.photos || []);
    
    // Validate file count (max 10 total)
    if (existingFiles.length + newFiles.length > 10) {
      toast({
        variant: 'destructive',
        title: "Too many files",
        description: `You can only upload a maximum of 10 files. You currently have ${existingFiles.length} file(s). Please select ${10 - existingFiles.length} or fewer additional files.`,
      });
      return;
    }
    
    // Validate file sizes (max 5MB each)
    const oversizedFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        variant: 'destructive',
        title: "File too large",
        description: `Some files are larger than 5MB. Please choose smaller files.`,
      });
      return;
    }
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({
        variant: 'destructive',
        title: "Invalid file type",
        description: "Please select only image files (PNG, JPG, GIF).",
      });
      return;
    }
    
    // Combine existing files with new files
    const allFiles = [...existingFiles, ...newFiles];
    setFormData(prev => ({ ...prev, photos: allFiles }));
    
    // Clear the input so the same files can be selected again if needed
    e.target.value = '';
  };

  const handleRemoveFile = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      photos: Array.from(prev.photos || []).filter((_, index) => index !== indexToRemove)
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'full_name',
      'phone_number', 
      'property_type',
      'home_age',
      'tile_preference',
      'include_tiles',
      'toilet_move',
      'wall_change'
    ];

    // Add measurement validation based on type
    if (formData.measurement_type === 'direct') {
      requiredFields.push('total_size');
    }

    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Please fill in all required fields',
        description: 'Some required information is missing.'
      });
      return false;
    }

    if (!builderId) {
      toast({
        variant: 'destructive',
        title: 'Invalid survey link',
        description: 'Builder information is missing from the URL.'
      });
      return false;
    }

    return true;
  };

  const mapFormDataToAPI = () => {
    // Helper function to map form values to API expected values
    const mapTilingLevel = (value) => {
      const mapping = {
        'budget': 'Budget',
        'standard': 'Standard', 
        'premium': 'Premium'
      };
      return mapping[value] || 'Standard';
    };

    const mapBathroomType = (value) => {
      const mapping = {
        'House or Unit': 'Master Bathroom',
        'Apartment': 'Standard Bathroom',
        'Other / Not sure': 'Standard Bathroom'
      };
      return mapping[value] || 'Standard Bathroom';
    };

    const mapHomeAge = (value) => {
      const mapping = {
        'Less than 10 years old': '0-10 years',
        '10-30 years old': '10-20 years',
        '30-50 years old': '20-50 years',
        'Over 50 years old': '50+ years',
        'Not sure': '10-20 years'
      };
      return mapping[value] || '10-20 years';
    };

    // Map the form data to match Laravel API structure
    return {
      client_name: formData.full_name,
      client_phone: formData.phone_number,
      total_area: formData.measurement_type === 'direct' ? parseFloat(formData.total_size) || null : null,
      floor_length: null, // Not collected in this form
      floor_width: null,  // Not collected in this form  
      wall_height: null,  // Not collected in this form
      bathroom_type: mapBathroomType(formData.property_type),
      tiling_level: mapTilingLevel(formData.tile_preference),
      design_style: 'Modern', // Default value
      home_age_category: mapHomeAge(formData.home_age)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      const surveyData = mapFormDataToAPI();
      console.log('Submitting survey data:', surveyData);
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all survey data fields
      Object.keys(surveyData).forEach(key => {
        if (surveyData[key] !== null && surveyData[key] !== undefined) {
          submitData.append(key, surveyData[key]);
        }
      });
      
      // Add photos if any (from component state)
      if (formData.photos && formData.photos.length > 0) {
        Array.from(formData.photos).forEach((file, index) => {
          submitData.append(`photos[${index}]`, file);
        });
      }
      
      const result = await clientSurveyAPI.submitClientSurveyWithFiles(builderId, submitData);
      
      console.log('Survey submitted successfully:', result);
      
      toast({
        title: "Survey submitted successfully!",
        description: "Thank you for providing your project details. The builder will contact you soon.",
      });
      
      // Redirect to thank you page
      navigate('/thank-you');
      
    } catch (error) {
      console.error('Error submitting survey:', error);
    toast({
        variant: 'destructive',
        title: "Error submitting survey",
        description: error.message || "Please try again or contact the builder directly.",
    });
    } finally {
      setSubmitting(false);
    }
  };
  
  const renderField = (field) => {
    const isVisible = !field.condition || formData[field.condition.field] === field.condition.value;
    if (!isVisible) return null;

    const widthClass = field.width === 'full' ? 'md:col-span-2' : '';

    return (
      <div key={field.id} className={widthClass}>
        {(() => {
          switch (field.type) {
            case 'text':
              return (
                <div>
                  <Label htmlFor={field.id} className="font-semibold text-gray-700">{field.label}</Label>
                  <Input id={field.id} type="text" placeholder={field.placeholder} value={formData[field.id]} onChange={(e) => handleInputChange(field.id, e.target.value)} className="mt-1" />
                </div>
              );
            case 'radio_toggle':
                return (
                    <div>
                      {field.label && <Label className="mb-2 block font-semibold text-gray-700">{field.label}</Label>}
                      <RadioToggle fieldId={field.id} options={field.options} value={formData[field.id]} onValueChange={(value) => handleInputChange(field.id, value)} />
                    </div>
                );
            case 'radio':
              return (
                <div>
                  <Label className="font-semibold text-gray-700">{field.label}</Label>
                  <RadioGroup value={formData[field.id]} onValueChange={(value) => handleInputChange(field.id, value)} className="mt-2 space-y-3">
                    {field.options.map((option, index) => {
                      const optionValue = typeof option === 'string' ? option : option.value;
                      const optionLabel = typeof option === 'string' ? option : option.label;
                      const optionSublabel = typeof option === 'string' ? null : option.sublabel;
                      return (
                        <Label key={index} htmlFor={`${field.id}_${index}`} className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 transition-colors">
                          <RadioGroupItem value={optionValue} id={`${field.id}_${index}`} />
                          <div className="ml-3 -mt-1">
                            <span className="font-medium text-gray-800">{optionLabel}</span>
                            {optionSublabel && <p className="text-sm text-muted-foreground">{optionSublabel}</p>}
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>
              );
            case 'file_drop':
              return (
                <div>
                  <Label className="font-semibold text-gray-700">{field.label}</Label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <Label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-600 focus-within:ring-offset-2 hover:text-orange-500">
                          <span>
                            {formData.photos && formData.photos.length > 0 
                              ? `Add more photos (${formData.photos.length}/10 selected)` 
                              : 'Drop your photos here or click to browse'
                            }
                          </span>
                          <Input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            multiple 
                            accept="image/*"
                            onChange={(e) => handleFileChange(e)}
                          />
                        </Label>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 5MB each (max 10 files)</p>
                    </div>
                  </div>
                  {formData.photos && formData.photos.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                      <div className="space-y-2">
                        {Array.from(formData.photos).map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">{file.name}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            default:
              return null;
          }
        })()}
      </div>
    );
  };
  
  // Show error if no builder ID
  if (!builderId) {
    return (
      <>
        <Helmet>
          <title>Invalid Survey Link - EstiMate Pro</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Invalid Survey Link</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                This survey link appears to be invalid or incomplete. Please check the link provided by your builder.
              </p>
              <Button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-600">
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Client Survey Preview - EstiMate Pro</title>
        <meta name="description" content="This is a preview of the survey your clients will fill out to generate an estimate." />
      </Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="bg-gray-50 -m-4 sm:-m-6 p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="max-w-4xl w-full bg-white rounded-lg p-6 sm:p-10">
          <div className="text-center mb-10">
            <div className="inline-block p-3 bg-orange-100 rounded-full mb-4">
                <Home className="h-8 w-8 text-orange-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{surveyConfig.welcome_title}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{surveyConfig.welcome_subtitle}</p>
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm max-w-3xl mx-auto">
                {surveyConfig.welcome_info}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {surveyConfig.steps.map(step => (
                <SurveyStep key={step.step} step={step.step} title={step.title}>
                    {step.fields.map(field => renderField(field))}
                </SurveyStep>
            ))}
            <div className="text-center pt-6">
                <Button type="submit" size="lg" className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto" disabled={submitting}>
                     {submitting ? (
                       <>
                         <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                         Submitting...
                       </>
                     ) : (
                       <>
                    <Check className="mr-2 h-5 w-5" />
                    {surveyConfig.submit_button_text}
                       </>
                     )}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">Please complete all required fields to submit your estimate request.</p>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default ClientSurveyPage;