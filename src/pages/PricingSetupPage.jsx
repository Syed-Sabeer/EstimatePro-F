import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Info, Settings, FileText, Ruler, Plus, Pencil, Percent } from 'lucide-react';

const PricingSetupPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [calcMethod, setCalcMethod] = useState('fixed_price');
  const [fixedPrice, setFixedPrice] = useState('');
  const [markup, setMarkup] = useState('');
  
  const fetchPricingProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pricing_profiles')
        .select('profile_data')
        .eq('builder_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.profile_data) {
        setCalcMethod(data.profile_data.base_calculation_method || 'fixed_price');
        setFixedPrice(data.profile_data.base_fixed_price || '');
        setMarkup(data.profile_data.default_markup_percentage || '');
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error fetching pricing data', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchPricingProfile();
  }, [fetchPricingProfile]);

  const handleSaveChanges = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { data: currentProfile, error: fetchError } = await supabase
        .from('pricing_profiles')
        .select('profile_data')
        .eq('builder_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      const updatedProfileData = {
        ...(currentProfile?.profile_data || {}),
        base_calculation_method: calcMethod,
        base_fixed_price: parseFloat(fixedPrice) || 0,
        default_markup_percentage: parseFloat(markup) || 0,
      };

      const { error: updateError } = await supabase
        .from('pricing_profiles')
        .upsert({ builder_id: user.id, profile_data: updatedProfileData, updated_at: new Date().toISOString() }, { onConflict: 'builder_id' });

      if (updateError) throw updateError;

      toast({ title: 'Success!', description: 'Your pricing settings have been saved.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error saving changes', description: error.message });
    } finally {
      setSaving(false);
    }
  };
  
  const handleFeatureClick = () => toast({ title: "🚧 Feature not implemented yet!" });

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
        <meta name="description" content="Fine-tune your pricing strategy for accurate and competitive estimates." />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pricing Setup</h1>
          <p className="text-muted-foreground mt-1">Fine-tune your pricing strategy for accurate and competitive estimates.</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Pricing Configuration</CardTitle>
              <p className="text-sm text-muted-foreground pt-1">Set your default base prices and markup. These will apply unless overridden by service-specific pricing.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Base Price Calculation Method</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-w-md">
                  <Button variant={calcMethod === 'fixed_price' ? 'default' : 'outline'} onClick={() => setCalcMethod('fixed_price')} className={calcMethod === 'fixed_price' ? 'bg-orange-500 hover:bg-orange-600' : ''}>
                    <FileText className="mr-2 h-4 w-4" /> Fixed Project Price
                  </Button>
                  <Button variant={calcMethod === 'per_sqm' ? 'default' : 'outline'} onClick={() => { setCalcMethod('per_sqm'); handleFeatureClick(); }} className={calcMethod === 'per_sqm' ? 'bg-orange-500 hover:bg-orange-600' : ''}>
                    <Ruler className="mr-2 h-4 w-4" /> Price per m²
                  </Button>
                </div>
              </div>
              
              <div className="max-w-xs space-y-2">
                <Label htmlFor="base-fixed-price">Base Fixed Price</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                  <Input id="base-fixed-price" type="number" value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} className="pl-7" placeholder="500" />
                </div>
              </div>

              <div className="max-w-xs space-y-2">
                <Label htmlFor="default-markup">Default Markup Percentage</Label>
                <div className="relative">
                  <Percent className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground h-full w-4" />
                  <Input id="default-markup" type="number" value={markup} onChange={(e) => setMarkup(e.target.value)} className="pl-9 pr-8" placeholder="20" />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">%</span>
                </div>
              </div>

              <Button onClick={handleSaveChanges} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Pricing Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-900">
                <Info className="mr-2 h-5 w-5" />
                Key Pricing Logic Explained
              </CardTitle>
            </CardHeader>
            <CardContent className="text-orange-800 text-sm space-y-3">
              <p>Your estimates are calculated to provide a Low and High range, offering flexibility to your clients:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><span className="font-semibold">Low Estimate:</span> Base Price + (Base Price × Markup Percentage / 100)</li>
                <li><span className="font-semibold">High Estimate:</span> Low Estimate × 1.25 (This multiplier is configurable in advanced settings)</li>
              </ul>
              <p>This ensures your costs and profit margins are covered while providing a clear range.</p>
              <Button variant="link" onClick={handleFeatureClick} className="p-0 h-auto text-orange-800 hover:text-orange-900 font-semibold">
                <Settings className="mr-2 h-4 w-4" />
                Explore Advanced Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Service-Specific Pricing</CardTitle>
                <p className="text-sm text-muted-foreground pt-1">Define custom pricing for individual services to override general settings.</p>
              </div>
              <Button onClick={handleFeatureClick} className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Service Price Rule
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <Pencil className="h-full w-full" />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No service-specific pricing rules defined yet.</h3>
                <p className="mt-1 text-sm text-gray-500">Click "Add Service Price Rule" to create granular pricing for different services.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  );
};

export default PricingSetupPage;