import { useState } from 'react';
import { Star, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const Feedback = () => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback_type: '',
    message: '',
    show_in_community: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          feedback_type: formData.feedback_type,
          message: formData.message,
          rating: rating,
          show_in_community: formData.show_in_community,
        })
      });

      const data = await response.json();

      setSubmitted(true);
      toast.success(
        data.posted_to_community 
          ? '✅ Feedback submitted and posted to community!' 
          : '✅ Thank you for your feedback!'
      );
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        feedback_type: '',
        message: '',
        show_in_community: true,
      });
      setRating(0);

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-[90px] px-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="mb-4">{t('feedback.title')} 💬</h1>
          <p className="text-xl text-muted-foreground">
            {t('feedback.subtitle')}
          </p>
        </div>

        {submitted ? (
          <div className="glass rounded-3xl p-12 text-center animate-scale-in">
            <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">{t('feedback.thankyou')}</h2>
            <p className="text-xl text-muted-foreground">
              {t('feedback.subtitle')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass rounded-3xl p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('feedback.yourname')} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('feedback.youremail')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('feedback.feedbacktype')} <span className="text-destructive">*</span>
                </label>
                <select
                  name="feedback_type"
                  value={formData.feedback_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a type</option>
                  <option value="bug">{t('feedback.bug')}</option>
                  <option value="feature">{t('feedback.feature')}</option>
                  <option value="general">{t('feedback.general')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('feedback.message')} <span className="text-destructive">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Tell us more... (minimum 20 characters)"
                  required
                  minLength={20}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-4">
                  {t('feedback.rating')}
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= rating
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Share to Community Checkbox */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                checked={formData.show_in_community}
                onChange={(e) => setFormData({...formData, show_in_community: e.target.checked})}
                className="w-5 h-5 text-primary"
              />
              <label className="font-medium text-sm">
                📢 Share this feedback with the community
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 py-4 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('common.submit')
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Feedback;
