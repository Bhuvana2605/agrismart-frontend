import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Loader2, MessageCircle, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://agrismart-backend-35jd.onrender.com').replace(/\/$/, '');

const Profile = () => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState({
    user_id: '',
    name: '',
    email: '',
    phone: '',
    location: '',
    farm_size: '',
    farm_type: '',
    preferred_language: 'en'
  });
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);

  // Generate or get user ID
  useEffect(() => {
    let id = localStorage.getItem('agrismart_user_id');
    if (!id) {
      id = 'user_' + Date.now();
      localStorage.setItem('agrismart_user_id', id);
    }
    setUserId(id);
    setProfile(prev => ({ ...prev, user_id: id }));
    loadProfile(id);
    loadCommunityPosts();
  }, []);

  const loadCommunityPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/community-posts`);
      const data = await response.json();
      
      if (data.success && data.posts) {
        // Get only the 3 most recent posts
        setCommunityPosts(data.posts.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to load community posts:', error);
    }
  };

  const loadProfile = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/${id}`);
      const data = await response.json();
      
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('✅ Profile saved successfully!');
        setIsEditing(false);
      } else {
        toast.error('❌ Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('❌ Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-[90px] px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-12 text-center">{t('profile.title') || 'My Profile'}</h1>

        {/* Profile Card */}
        <div className="glass rounded-3xl p-8 mb-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center mb-4">
              <User className="w-16 h-16 text-primary" />
            </div>
            <button className="text-sm text-primary hover:underline">Change Photo</button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('profile.name') || 'Name'}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('profile.email') || 'Email'}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('profile.phone') || 'Phone'}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('profile.location') || 'Location'}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Member since: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={loading}
            className="w-full mt-8 py-3 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('common.loading') || 'Saving...'}
              </>
            ) : isEditing ? (
              <>
                <Save className="w-5 h-5" />
                {t('profile.save') || 'Save Changes'}
              </>
            ) : (
              t('profile.edit') || 'Edit Profile'
            )}
          </button>
        </div>

        {/* Farm Details Section */}
        <div className="glass rounded-3xl p-8 mb-8">
          <h2 className="mb-6">Farm Details</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('profile.farmSize') || 'Farm Size'}</label>
              <input
                type="text"
                value={profile.farm_size}
                onChange={(e) => setProfile({ ...profile, farm_size: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., 5 acres"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('profile.farmType') || 'Farm Type'}</label>
              <select
                value={profile.farm_type}
                onChange={(e) => setProfile({ ...profile, farm_type: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
              >
                <option value="">Select type</option>
                <option value="small">Small Scale</option>
                <option value="medium">Medium Scale</option>
                <option value="large">Large Scale</option>
                <option value="organic">Organic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recent Community Posts Section */}
        <div className="glass rounded-3xl p-8">
          <h2 className="mb-6">Recent Community Posts 🌻</h2>
          
          {communityPosts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No community posts yet</p>
          ) : (
            <div className="space-y-4">
              {communityPosts.map((post) => (
                <div key={post.id} className={`p-4 rounded-xl border ${
                  post.type === 'feedback' ? 'bg-blue-50 border-blue-200' : 'bg-background border-border'
                }`}>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary text-sm">
                      {post.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{post.author}</p>
                        {post.type === 'feedback' && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                            💬 Feedback
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {post.timestamp ? new Date(post.timestamp).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                  
                  {post.type === 'feedback' && post.rating > 0 && (
                    <div className="mt-2">
                      <span className="text-xs">{'⭐'.repeat(post.rating)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{post.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{post.comments || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
