
import React, { useState, useEffect } from 'react';
import { Comment } from '../types';
import { loadComments, saveComment } from '../services/storage';
import { Send, ThumbsUp, MessageSquare, Smile } from 'lucide-react';

interface CommentSectionProps {
  contentId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ contentId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState('Anonymous Nomad');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
        setComments(await loadComments(contentId));
    }
    fetch();
  }, [contentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      contentId,
      user,
      text: newComment,
      date: new Date().toISOString().split('T')[0],
      approved: true // Auto-approve for now, admin can delete
    };

    setLoading(true);
    await saveComment(comment);
    setComments(prev => [...prev, comment]);
    setNewComment('');
    setLoading(false);
  };

  return (
    <div className="mt-12 bg-card-bg border border-white/10 rounded-xl p-6">
      <h3 className="text-2xl font-anton text-white mb-6 flex items-center gap-2">
        <MessageSquare className="text-neon-green" />
        Transmissions ({comments.length})
      </h3>

      {/* List */}
      <div className="space-y-6 mb-8">
        {comments.length === 0 && (
          <p className="text-gray-500 italic">No signals detected yet. Be the first.</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-white/5 last:border-0 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-neon-purple font-roboto uppercase tracking-wider text-sm">{comment.user}</span>
              <span className="text-xs text-gray-600">{comment.date}</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{comment.text}</p>
            <div className="mt-2 flex gap-4">
               <button className="text-gray-600 hover:text-neon-green text-xs flex items-center gap-1 transition-colors">
                 <ThumbsUp size={12} /> Like
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="bg-black/30 p-4 rounded-lg border border-white/10">
        <div className="mb-4">
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Alias</label>
          <input 
            type="text" 
            value={user} 
            onChange={e => setUser(e.target.value)}
            className="bg-transparent border-b border-gray-700 text-white text-sm w-full focus:outline-none focus:border-neon-green py-1"
          />
        </div>
        <div className="relative">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Inject your thoughts into the network..."
            className="w-full bg-white/5 rounded-lg border border-gray-700 p-3 text-white text-sm focus:border-neon-green outline-none min-h-[80px] pr-12"
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute bottom-3 right-3 text-neon-green hover:text-white transition-colors p-2 bg-white/5 rounded-full"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
