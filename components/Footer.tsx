
import React, { useState } from 'react';
import { Instagram, Facebook, Linkedin, Twitter, Phone, Video, Share2 } from 'lucide-react';
import { addSubscriber } from '../services/storage';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
      return;
    }

    setStatus('loading');
    try {
      const success = await addSubscriber(email);
      if (success) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error'); // Already subscribed
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (err) {
      console.error("Newsletter subscription failed:", err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <footer className="bg-card-bg border-t border-neon-green pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 lg:col-span-2">
             <h3 className="font-anton text-3xl text-white mb-4">OWLISTER</h3>
             <p className="text-gray-400 mb-6 max-w-md">
               Decoding the signal from the noise. Dystopian tales of tech and music from the underground.
               Artys x Unlmtd.
             </p>
             <div className="flex space-x-4">
                <SocialIcon Icon={Instagram} label="Instagram" />
                <SocialIcon Icon={Facebook} label="Facebook" />
                <SocialIcon Icon={Phone} label="WhatsApp" /> 
                <SocialIcon Icon={Video} label="TikTok" />
                <SocialIcon Icon={Twitter} label="X" />
                <SocialIcon Icon={Linkedin} label="LinkedIn" />
             </div>
          </div>
          
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-roboto font-bold text-xl text-white mb-4 uppercase tracking-wider">Join the Resistance</h4>
            <p className="text-gray-400 mb-4 text-sm">Subscribe to our encrypted frequency (newsletter).</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                className="flex-1 bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-neon-purple hover:bg-purple-600 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded transition-colors uppercase tracking-widest font-roboto"
              >
                {status === 'loading' ? 'Sending...' : status === 'success' ? 'Joined!' : status === 'error' ? 'Try Again' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm text-center md:text-left">&copy; 2024 Owlister. Artys x Unlmtd. All rights reserved.</p>
          <p className="text-gray-600 text-sm font-roboto tracking-widest mt-2 md:mt-0">SEE BEYOND. BE SINGULAR.</p>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ Icon, label }: { Icon: any, label: string }) => (
  <a href="#" className="text-gray-400 hover:text-white hover:scale-110 transition-all p-2 bg-white/5 rounded-full">
    <Icon size={20} />
    <span className="sr-only">{label}</span>
  </a>
);

export default Footer;
