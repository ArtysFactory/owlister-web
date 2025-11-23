import React from 'react';
import { X, Link as LinkIcon } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, title, url }) => {
  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  // Note: TikTok and Snapchat do not have standard web share URL schemes for arbitrary links.
  // We provide a copy-link fallback or homepage link for them where applicable.
  const links = [
    { name: 'WhatsApp', url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, color: 'bg-[#25D366]' },
    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: 'bg-[#1877F2]' },
    { name: 'X (Twitter)', url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, color: 'bg-black border border-white/20' },
    { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, color: 'bg-[#0A66C2]' },
    { name: 'Instagram', url: `https://instagram.com/`, color: 'bg-gradient-to-r from-purple-500 to-orange-500', note: '(Copy link first)' },
    { name: 'TikTok', url: `https://tiktok.com/`, color: 'bg-[#000000] border border-white/20', note: '(Copy link first)' },
    { name: 'Snapchat', url: `https://snapchat.com/`, color: 'bg-[#FFFC00] text-black' },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert('Link copied! You can now paste it in your social app.');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-card-bg border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl shadow-neon-purple/20">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        
        <h3 className="text-2xl font-anton text-white mb-6">Share Transmission</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {links.map((link) => (
            <a 
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${link.color} text-white flex flex-col items-center justify-center py-3 rounded-lg text-center font-roboto font-bold uppercase tracking-wider hover:opacity-80 transition-opacity`}
              onClick={link.note ? copyToClipboard : undefined}
            >
              <span>{link.name}</span>
              {link.note && <span className="text-[8px] opacity-70 font-normal normal-case">{link.note}</span>}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-black/50 p-3 rounded-lg border border-white/10">
          <div className="flex-1 truncate text-gray-400 text-sm font-mono">{url}</div>
          <button onClick={copyToClipboard} className="p-2 bg-neon-purple/20 text-neon-purple rounded hover:bg-neon-purple/40">
            <LinkIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;