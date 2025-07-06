import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ExternalLink } from 'lucide-react';

const CtaSection = () => {
  const { toast } = useToast();

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
      className="orange-gradient py-20"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Quoting Process?
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Save time and win jobs with EstiMate Pro.
          </p>
          {/* <Button 
            onClick={handleFeatureClick}
            className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
          >
            Start Your Free Trial
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button> */}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CtaSection;