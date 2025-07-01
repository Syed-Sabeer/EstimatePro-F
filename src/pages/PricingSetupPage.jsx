import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { builderPricingAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Loader2, 
  Save, 
  Info, 
  Plus, 
  Pencil, 
  Trash2,
  DollarSign,
  Package
} from 'lucide-react';

// Move PricingFormDialog outside the main component to prevent re-creation on every render
const PricingFormDialog = ({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  title, 
  description, 
  formData, 
  handleFormChange, 
  calculateFinalPrice, 
  saving, 
  editingPricing, 
  applicabilityOptions, 
  priceTypes 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item_name">Item Name *</Label>
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) => handleFormChange('item_name', e.target.value)}
                placeholder="e.g., Vinyl Flooring"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicability">Applicability *</Label>
              <Select value={formData.applicability} onValueChange={(value) => handleFormChange('applicability', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select applicability" />
                </SelectTrigger>
                <SelectContent>
                  {applicabilityOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_type">Price Type</Label>
              <Select value={formData.price_type} onValueChange={(value) => handleFormChange('price_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="base_price">Base Price * ($)</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => handleFormChange('base_price', e.target.value)}
                placeholder="15.50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="markup_percent">Markup Percentage (%)</Label>
              <Input
                id="markup_percent"
                type="number"
                step="0.1"
                value={formData.markup_percent}
                onChange={(e) => handleFormChange('markup_percent', e.target.value)}
                placeholder="10"
              />
            </div>
            {formData.base_price && (
              <div className="p-3 bg-orange-50 rounded-md">
                <p className="text-sm font-medium text-orange-900">
                  Final Price: ${calculateFinalPrice(formData.base_price, formData.markup_percent).toFixed(2)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving} 
              className="bg-orange-500 hover:bg-orange-600"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editingPricing ? 'Update' : 'Add'} Pricing
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PricingSetupPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricings, setPricings] = useState([]);
  
  // Form state for adding/editing pricing
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [formData, setFormData] = useState({
    item_name: '',
    applicability: '',
    price_type: 'm2',
    base_price: '',
    markup_percent: '',
  });

  const priceTypes = [
    { value: 'm2', label: 'Per Square Meter (m²)' },
    { value: 'linear_meter', label: 'Per Linear Meter' },
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'hourly', label: 'Hourly Rate' },
  ];

  const applicabilityOptions = [
    'Floor Surface',
    'Wall Surface', 
    'Ceiling Surface',
    'Bathroom Tiling',
    'Kitchen Backsplash',
    'Outdoor Patio',
    'Pool Area',
    'General Labor',
    'Materials',
    'Equipment'
  ];

  const fetchPricings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const pricingsData = await builderPricingAPI.getBuilderPricings();
      setPricings(pricingsData || []);
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error fetching pricing data', 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchPricings();
  }, [fetchPricings]);

  const calculateFinalPrice = (basePrice, markupPercent) => {
    const base = parseFloat(basePrice) || 0;
    const markup = parseFloat(markupPercent) || 0;
    return base + (base * markup / 100);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate final price when base price or markup changes
      if (field === 'base_price' || field === 'markup_percent') {
        updated.final_price = calculateFinalPrice(updated.base_price, updated.markup_percent);
      }
      return updated;
    });
  };

  const resetForm = () => {
    setFormData({
      item_name: '',
      applicability: '',
      price_type: 'm2',
      base_price: '',
      markup_percent: '',
    });
  };

  const handleAddPricing = async () => {
    if (!formData.item_name || !formData.base_price || !formData.applicability) {
      toast({ 
        variant: 'destructive', 
        title: 'Validation Error', 
        description: 'Please fill in all required fields (Item Name, Applicability, and Base Price).' 
      });
      return;
    }

    setSaving(true);
    try {
      const pricingData = {
        item_name: formData.item_name.trim(),
        applicability: formData.applicability || '',
        price_type: formData.price_type || 'm2',
        base_price: parseFloat(formData.base_price),
        markup_percent: parseFloat(formData.markup_percent) || 0,
        final_price: calculateFinalPrice(formData.base_price, formData.markup_percent),
      };
      
      await builderPricingAPI.storeBuilderPricing(pricingData);
      await fetchPricings();
      setIsAddDialogOpen(false);
      resetForm();
      toast({ title: 'Success!', description: 'Pricing item added successfully.' });
    } catch (error) {
      console.error('Error adding pricing:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error adding pricing', 
        description: error.message || 'An unexpected error occurred.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditPricing = (pricing) => {
    setEditingPricing(pricing);
    setFormData({
      item_name: pricing.item_name,
      applicability: pricing.applicability,
      price_type: pricing.price_type,
      base_price: pricing.base_price.toString(),
      markup_percent: pricing.markup_percent.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePricing = async () => {
    if (!formData.item_name || !formData.base_price || !formData.applicability) {
      toast({ 
        variant: 'destructive', 
        title: 'Validation Error', 
        description: 'Please fill in all required fields (Item Name, Applicability, and Base Price).' 
      });
      return;
    }

    setSaving(true);
    try {
      const pricingData = {
        item_name: formData.item_name.trim(),
        applicability: formData.applicability || '',
        price_type: formData.price_type || 'm2',
        base_price: parseFloat(formData.base_price),
        markup_percent: parseFloat(formData.markup_percent) || 0,
        final_price: calculateFinalPrice(formData.base_price, formData.markup_percent),
      };

      await builderPricingAPI.updateBuilderPricing(editingPricing.id, pricingData);
      await fetchPricings();
      setIsEditDialogOpen(false);
      setEditingPricing(null);
      resetForm();
      toast({ title: 'Success!', description: 'Pricing item updated successfully.' });
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error updating pricing', 
        description: error.message || 'An unexpected error occurred.'
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeletePricing = async (id) => {
    if (!confirm('Are you sure you want to delete this pricing item?')) return;

    try {
      await builderPricingAPI.deleteBuilderPricing(id);
      await fetchPricings();
      toast({ title: 'Success!', description: 'Pricing item deleted successfully.' });
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error deleting pricing', 
        description: error.message 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pricing Setup - EstiMate Pro</title>
        <meta name="description" content="Manage your pricing items for accurate and competitive estimates." />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pricing Setup</h1>
          <p className="text-muted-foreground mt-1">Manage your pricing items for accurate and competitive estimates.</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-900">
                <Info className="mr-2 h-5 w-5" />
                How Pricing Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-orange-800 text-sm space-y-3">
              <p>Create pricing items for different materials, services, or work types:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><span className="font-semibold">Base Price:</span> Your cost for the item/service</li>
                <li><span className="font-semibold">Markup:</span> Your profit margin percentage</li>
                <li><span className="font-semibold">Final Price:</span> What you charge clients (Base + Markup)</li>
              </ul>
              <p>These pricing items will be used to generate accurate estimates for your clients.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Pricing Items</CardTitle>
                <p className="text-sm text-muted-foreground pt-1">Manage individual pricing for materials and services.</p>
              </div>
              <Button 
                onClick={() => setIsAddDialogOpen(true)} 
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Pricing Item
              </Button>
            </CardHeader>
            <CardContent>
              {pricings.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <div className="mx-auto h-12 w-12 text-gray-400">
                    <Package className="h-full w-full" />
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No pricing items yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding your first pricing item.</p>
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)} 
                    className="mt-4 bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Pricing Item
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Applicability</TableHead>
                      <TableHead>Price Type</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Markup</TableHead>
                      <TableHead>Final Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricings.map((pricing) => (
                      <TableRow key={pricing.id}>
                        <TableCell className="font-medium">{pricing.item_name}</TableCell>
                        <TableCell>{pricing.applicability || '-'}</TableCell>
                        <TableCell>{pricing.price_type}</TableCell>
                        <TableCell>${pricing.base_price}</TableCell>
                        <TableCell>{pricing.markup_percent}%</TableCell>
                        <TableCell className="font-semibold">${pricing.final_price}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPricing(pricing)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePricing(pricing.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
              </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Pricing Dialog */}
        <PricingFormDialog
          isOpen={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}
          onSubmit={handleAddPricing}
          title="Add New Pricing Item"
          description="Create a new pricing item for your estimates."
          formData={formData}
          handleFormChange={handleFormChange}
          calculateFinalPrice={calculateFinalPrice}
          saving={saving}
          editingPricing={editingPricing}
          applicabilityOptions={applicabilityOptions}
          priceTypes={priceTypes}
        />

        {/* Edit Pricing Dialog */}
        <PricingFormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setEditingPricing(null);
              resetForm();
            }
          }}
          onSubmit={handleUpdatePricing}
          title="Edit Pricing Item"
          description="Update the pricing item details."
          formData={formData}
          handleFormChange={handleFormChange}
          calculateFinalPrice={calculateFinalPrice}
          saving={saving}
          editingPricing={editingPricing}
          applicabilityOptions={applicabilityOptions}
          priceTypes={priceTypes}
        />
      </motion.div>
    </>
  );
};

export default PricingSetupPage;