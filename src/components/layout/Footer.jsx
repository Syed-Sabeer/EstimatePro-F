import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';


const Footer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFeatureClick = (featureName, path) => {
     if (path) {
      navigate(path);
    } else if (featureName === 'Privacy Policy') {
      navigate('/privacy-policy');
    } else if (featureName === 'Terms of Service') {
      navigate('/terms-of-service');
    }
     else {
      toast({
        title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
      });
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <img
    src="/images/logo.jpg"
    alt="logo"
    className="w-full h-full object-cover rounded-lg"
  />
              </div>
              <span className="text-xl font-bold">EstiMate Pro</span>
            </Link>
            <p className="text-gray-400 text-sm">
             Estimate Pro helps save time and win more work by streamlining the quoting process.
            </p>
            {/* <div className="flex space-x-2 mt-4">
                {['F', 'T', 'L', 'I'].map(letter => (
                    <button key={letter} onClick={() => handleFeatureClick(`Social ${letter}`)} className="w-8 h-8 bg-gray-700 hover:bg-orange-500 rounded flex items-center justify-center text-sm font-medium">
                        {letter}
                    </button>
                ))}
            </div> */}
          </div>
          
          {/* <div>
            <p className="font-semibold mb-4 text-gray-200">Product</p>
            <div className="space-y-2">
              {[ "Features", "Pricing", "Templates", "Integrations", "API"].map(item => (
                <button key={item} onClick={() => handleFeatureClick(item)} className="block text-gray-400 hover:text-white transition-colors text-sm">
                  {item}
                </button>
              ))}
            </div>
          </div> */}
          
          {/* <div>
            <p className="font-semibold mb-4 text-gray-200">Company</p>
            <div className="space-y-2">
                {["About Us", "Careers", "Blog", "Press", "Partners"].map(item => (
                    <button key={item} onClick={() => handleFeatureClick(item)} className="block text-gray-400 hover:text-white transition-colors text-sm">
                        {item}
                    </button>
                ))}
            </div>
          </div> */}

          <div>
            <p className="font-semibold mb-4 text-gray-200">Contact Us</p>
            <div className="space-y-2">
                {/* {["Help Center", "Contact Us"].map(item => (
                    <button key={item} onClick={() => handleFeatureClick(item)} className="block text-gray-400 hover:text-white transition-colors text-sm">
                        {item}
                    </button>
                ))} */}
                 {/* <button onClick={() => handleFeatureClick('Privacy Policy', '/privacy-policy')} className="block text-gray-400 hover:text-white transition-colors text-sm">
                    Privacy Policy
                 </button>
                 <button onClick={() => handleFeatureClick('Terms of Service', '/terms-of-service')} className="block text-gray-400 hover:text-white transition-colors text-sm">
                    Terms of Service
                 </button>
                 <button onClick={() => handleFeatureClick('Status')} className="block text-gray-400 hover:text-white transition-colors text-sm">
                    Status
                 </button> */}
                 {/* <p className="text-gray-400 text-sm mt-2">1-800-ESTIMATE</p> */}
                 <p className="text-gray-400 text-sm">support@estimatepro.com.au</p>
            </div>
          </div>

        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
            © 2025 EstiMate Pro. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
                <button onClick={() => handleFeatureClick('Privacy Policy', '/privacy-policy')} className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</button>
                <button onClick={() => handleFeatureClick('Terms of Service', '/terms-of-service')} className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</button>
                <button onClick={() => handleFeatureClick('Cookie Policy')} className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</button>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;