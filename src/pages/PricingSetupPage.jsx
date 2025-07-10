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
  DollarSign,
  Package
} from 'lucide-react';

// Predefined pricing items based on the feedback
const PREDEFINED_PRICING_ITEMS = [
  {
    id: 'demolition_labour',
    item_name: 'Demolition (labour)',
    estimate_options: 'All estimates',
    price_type: 'Fixed price based on avg of days',
    category: 'Demolition'
  },
  {
    id: 'waste_disposal',
    item_name: 'Waste disposal',
    estimate_options: 'All estimates',
    price_type: 'Fixed price estimate',
    category: 'Demolition'
  },
  {
    id: 'plumbing_labour_same_layout',
    item_name: 'Plumbing (labour) if layout stays the same',
    estimate_options: 'If customer selects same layout',
    price_type: 'Fixed price estimate',
    category: 'Plumbing'
  },
  {
    id: 'plumbing_labour_changes_layout',
    item_name: 'Plumbing (labour) if changes to layout',
    estimate_options: 'If customer selects toilet will change',
    price_type: 'Fixed price estimate',
    category: 'Plumbing'
  },
  {
    id: 'electrical_labour',
    item_name: 'Electrical (labour)',
    estimate_options: 'All estimates',
    price_type: 'Fixed price estimate',
    category: 'Electrical'
  },
  {
    id: 'electrical_material',
    item_name: 'Electrical (material)',
    estimate_options: 'All estimates',
    price_type: 'Fixed price estimate',
    category: 'Electrical'
  },
  {
    id: 'waterproofing',
    item_name: 'Waterproofing',
    estimate_options: 'All estimates',
    price_type: 'Fixed price estimate',
    category: 'Tiling'
  },
  {
    id: 'tiling_labour',
    item_name: 'Tiling (labour)',
    estimate_options: 'All estimates',
    price_type: 'per M2',
    category: 'Tiling'
  },
  {
    id: 'tiles_material',
    item_name: 'Tiles (material)',
    estimate_options: 'If customer selects yes for tiles',
    price_type: 'per M2',
    category: 'Tiling'
  },
  {
    id: 'niche_extra_cost',
    item_name: 'Niche extra cost + builder labour to frame',
    estimate_options: 'If customer selects yes for niche',
    price_type: 'Fixed price estimate',
    category: 'Tiling'
  },
  {
    id: 'consumables',
    item_name: 'Consumables: Timber, Floor Protection, plaster, insulation, caulking, cornice, fixing materials, etc',
    estimate_options: 'All estimates',
    price_type: 'Fixed price estimate',
    category: 'Consumables'
  },
  {
    id: 'shower_base_screen',
    item_name: 'Supply & installation of shower base & shower screen based on 900x900',
    estimate_options: 'All estimates',
    price_type: 'Fixed price estimate',
    category: 'Consumables'
  },
  {
    id: 'builder_labour',
    item_name: 'Builder\'s labour, project management & administration costs',
    estimate_options: 'All estimates',
    price_type: '% of all above line items',
    category: 'Finishes & Builder\'s labour'
  },
  {
    id: 'access_difficult_site',
    item_name: 'Access/difficult site fee',
    estimate_options: 'If client selects lives in apartment',
    price_type: '% margin of all above line items',
    category: 'Finishes & Builder\'s labour'
  },
  {
    id: 'gap_filling_painting',
    item_name: 'Gap filling & painting',
    estimate_options: 'All estimates',
    price_type: 'Fixed price estimate per room',
    category: 'Finishes & Builder\'s labour'
  },
  {
    id: 'builder_labour_wall',
    item_name: 'Builder\'s labour for knocking down/shift wall',
    estimate_options: 'If customer selects yes to changes to wall layout',
    price_type: 'Fixed price estimate',
    category: 'Finishes & Builder\'s labour'
  }
];

// Function to map descriptive price types to backend enum values
const mapPriceTypeToEnum = (priceType) => {
  const priceTypeMap = {
    'Fixed price based on avg of days': 'fixed',
    'Fixed price estimate': 'fixed',
    'per M2': 'm2',
    '% of all above line items': 'fixed',
    '% margin of all above line items': 'fixed',
    'Fixed price estimate per room': 'fixed'
  };
  
  return priceTypeMap[priceType] || 'fixed';
};

const PricingSetupPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricings, setPricings] = useState([]);
  const [priceInputs, setPriceInputs] = useState({});

  const fetchPricings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const pricingsData = await builderPricingAPI.getBuilderPricings();
      setPricings(pricingsData || []);
      
      // Initialize price inputs with existing data
      const inputs = {};
      pricingsData.forEach(pricing => {
        inputs[pricing.item_name] = pricing.final_price || '';
      });
      setPriceInputs(inputs);
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

  const handlePriceChange = (itemName, value) => {
    setPriceInputs(prev => ({
      ...prev,
      [itemName]: value
    }));
  };

  const handleSaveAllPricing = async () => {
    setSaving(true);
    try {
      // Delete existing pricing items
      for (const pricing of pricings) {
        await builderPricingAPI.deleteBuilderPricing(pricing.id);
      }

      // Create new pricing items for all items with prices
      const savePromises = [];
      
      PREDEFINED_PRICING_ITEMS.forEach(item => {
        const price = priceInputs[item.item_name];
        if (price && parseFloat(price) > 0) {
          const pricingData = {
            item_name: item.item_name,
            applicability: item.estimate_options,
            price_type: mapPriceTypeToEnum(item.price_type),
            base_price: parseFloat(price),
            markup_percent: 0, // No markup since price includes margin
            final_price: parseFloat(price),
          };
          savePromises.push(builderPricingAPI.storeBuilderPricing(pricingData));
        }
      });

      await Promise.all(savePromises);
      await fetchPricings();
      
      toast({ 
        title: 'Success!', 
        description: 'All pricing items saved successfully.' 
      });
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error saving pricing', 
        description: error.message || 'An unexpected error occurred.'
      });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryItems = (category) => {
    return PREDEFINED_PRICING_ITEMS.filter(item => item.category === category);
  };

  const categories = [...new Set(PREDEFINED_PRICING_ITEMS.map(item => item.category))];

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
        <meta name="description" content="Set up your pricing for accurate bathroom renovation estimates." />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pricing Setup</h1>
          <p className="text-muted-foreground mt-1">Configure your pricing for accurate bathroom renovation estimates.</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-900">
                <Info className="mr-2 h-5 w-5" />
                Pricing Setup Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-orange-800 text-sm space-y-3">
              <p>Look back at a few past bathroom quotes to help guide your pricing or your Excel pricing set up.</p>
              <p>A good starting point is the average amount you've charged for similar items across 3–4 typical bathroom renos.</p>
              <br />
              <span className="font-semibold">How it works:</span>
              <ul className="list-disc list-inside space-y-1">
                <li>You'll enter your price (including your margin) for each job item.</li>
                <li>When a client fills out the survey, EstiMate Pro will calculate an estimate based on your pricing. This estimate will only be visible to you in your dashboard.</li>
                <li>To give you a realistic quote range, EstiMate Pro calculates:
                  <br />
                  <span className='ml-5'>Low estimate = based on your price</span>
                  <br />
                  <span className='ml-5'>High estimate = your price + 30% (as a buffer for unknowns or variation)</span>
                </li>
              </ul>
              <br />
              <span className="font-semibold">How to fill your pricing template in:</span>
              <p>In the "Enter your price (including margin)" column:</p>
              <p>Enter a fixed price or $ per m², depending on what the row says.</p>
              <p>If a line says "if customer selects…" – price what you'd charge when that situation applies (e.g. layout change, niche, apartment access).</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pricing Configuration</CardTitle>
                <p className="text-sm text-muted-foreground pt-1">Enter your prices for each service item. Only the "Enter your price" column can be modified.</p>
              </div>
              <Button 
                onClick={handleSaveAllPricing} 
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save All Pricing
              </Button>
            </CardHeader>
            <CardContent>
              {categories.map(category => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Item</TableHead>
                        <TableHead className="w-[200px]">Estimate Options</TableHead>
                        <TableHead className="w-[200px]">Price Type</TableHead>
                        <TableHead className="w-[200px]">Enter your price (including margin)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCategoryItems(category).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.item_name}</TableCell>
                          <TableCell>{item.estimate_options}</TableCell>
                          <TableCell>{item.price_type}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={priceInputs[item.item_name] || ''}
                                onChange={(e) => handlePriceChange(item.item_name, e.target.value)}
                                className="w-32"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  );
};

export default PricingSetupPage;