'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, X, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function FeedbackModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, source: 'WEB' }),
      });
      
      if (res.ok) {
        toast.success('Thank you for your feedback!');
        setRating(0);
        setComment('');
        onClose();
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (err) {
      toast.error('Error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-card/90 border border-border rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
            
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-[color:var(--accent)]" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Send Feedback</h2>
            <p className="text-neutral-500 text-sm mb-8">
              Let us know how we can improve the SVSU Security experience.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 ml-1 mb-3 block">
                  Rate your experience
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-2 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star 
                        className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-600'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 ml-1 mb-3 block">
                  Comments (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us more..."
                  rows={4}
                  className="w-full bg-background border border-border rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all resize-none"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="w-full bg-accent hover:opacity-90 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
