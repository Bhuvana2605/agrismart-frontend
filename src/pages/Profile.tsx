import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

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
  }, []);

  const loadProfile = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/profile/${id}`);
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
      const response = await fetch('http://localhost:8000/api/profile/save', {
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
        <div className="glass rounded-3xl p-8">
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
      </div>
    </div>
  );
};

export default Profile;
