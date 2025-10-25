import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Plus, X, Loader2 } from 'lucide-react';
import { api, CommunityPost } from '../services/api';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface Post {
  id: string | number;
  author: string;
  date?: string;
  timestamp?: string;
  title: string;
  content: string;
  preview?: string;
  likes: number;
  comments: number;
  type?: string;
  rating?: number;
}

const Community = () => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    author: '',
    title: '',
    content: '',
  });

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/community-posts');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.posts) {
        // Transform API data to match UI format
        const transformedPosts: Post[] = data.posts.map((post: any) => {
          // Format date properly
          let formattedDate = 'Recently';
          if (post.timestamp) {
            try {
              const date = new Date(post.timestamp);
              formattedDate = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });
            } catch (e) {
              formattedDate = 'Recently';
            }
          }
          
          return {
            id: post.id || Math.random().toString(),
            author: post.author,
            date: formattedDate,
            title: post.title,
            content: post.content,
            preview: post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content,
            likes: post.likes || 0,
            comments: post.comments || 0,
            type: post.type || 'post',
            rating: post.rating || 0,
          };
        });
        setPosts(transformedPosts);
      } else {
        setPosts([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to load community posts. Please check if the backend is running.');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/community-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: formData.author,
          title: formData.title,
          content: formData.content,
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        toast.success('✅ Your story has been shared successfully!');
        setShowModal(false);
        setFormData({ author: '', title: '', content: '' });
        
        // Refresh posts to show the new one
        await fetchPosts();
      } else {
        toast.error('Failed to share your story. Please try again.');
      }
    } catch (error: any) {
      console.error('Failed to submit post:', error);
      toast.error('❌ Failed to share your story. Please check if the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen pt-[90px] px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="mb-4">{t('community.title')} 🌻</h1>
          <p className="text-xl text-muted-foreground">
            {t('community.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-xl text-muted-foreground mb-4">{t('community.nopostsyet')}</p>
            <p className="text-muted-foreground">{t('community.createpost')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
            <div key={post.id} className={`rounded-2xl p-6 hover-lift ${
              post.type === 'feedback' ? 'bg-blue-50 border-2 border-blue-200' : 'glass'
            }`}>
              {/* Feedback Badge */}
              {post.type === 'feedback' && (
                <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs rounded-full mb-3">
                  💬 Feedback
                </span>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{post.author}</p>
                  <p className="text-xs text-muted-foreground">{post.date}</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {post.preview}
              </p>

              {/* Show rating for feedback posts */}
              {post.type === 'feedback' && post.rating && post.rating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium">Rating:</span>
                  <span>{'⭐'.repeat(post.rating)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments}</span>
                </div>
              </div>

              <button className="w-full mt-4 py-2 border border-primary text-primary font-medium rounded-full hover:bg-primary/10 transition-colors">
                {t('results.viewmore')}
              </button>
              </div>
            ))}
          </div>
        )}

        {/* Floating Add Button */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-6 right-6 w-[60px] h-[60px] bg-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40"
          aria-label="Share your story"
        >
          <Plus className="w-7 h-7 text-white" />
        </button>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-strong rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2>{t('community.createpost')}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-muted rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('feedback.yourname')}</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('community.posttitle')}</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Give your story a title"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('community.postcontent')}</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Share your farming experience..."
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('community.postbutton')
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
