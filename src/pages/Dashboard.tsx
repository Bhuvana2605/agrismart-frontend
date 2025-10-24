import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Edit3, ArrowLeft, Loader2 } from 'lucide-react';
import { api, LocationRecommendationResponse, CropRecommendation as ApiCropRecommendation } from '../services/api';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateCropName } from '@/utils/cropTranslations';

type ViewMode = 'default' | 'auto' | 'manual';

interface CropRecommendation {
  name: string;
  emoji: string;
  suitability: number;
  price: string;
  reason: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, translateText, language } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
  });

  // Check authentication
  useEffect(() => {
    const user = localStorage.getItem('agrismart_user');
    if (!user) {
      navigate('/auth');
    }
  }, [navigate]);

  // Retranslate recommendations when language changes
  useEffect(() => {
    if (recommendations.length > 0) {
      console.log('🔄 Language changed to:', language);
      console.log('Re-translating', recommendations.length, 'crops...');
      
      const retranslated = recommendations.map((crop) => {
        // Use original_name if available, otherwise use current name
        const originalName = (crop as any).original_name || crop.name;
        const translatedName = language === 'en' ? originalName : translateCropName(originalName, language);
        
        return {
          ...crop,
          name: translatedName,
          original_name: originalName,
        };
      });
      
      console.log('✅ Re-translation complete!');
      setRecommendations(retranslated);
    }
  }, [language]); // Only depend on language, not recommendations to avoid infinite loop

  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [locationData, setLocationData] = useState<LocationRecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSoilOverride, setShowSoilOverride] = useState(false);
  const [overriddenSoilType, setOverriddenSoilType] = useState<string | null>(null);
  
  // CRITICAL: Separate browser-detected location from API response
  // This should NEVER be overwritten by API response data
  const [browserLocation, setBrowserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: number;
  } | null>(null);
  
  // Legacy state for compatibility (can be removed later)
  const [currentCoordinates, setCurrentCoordinates] = useState<{ lat: number; lon: number; accuracy: number } | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: number;
  } | null>(null);

  // Helper function to validate location coordinates
  const isValidLocation = (lat: number, lon: number): boolean => {
    return (
      lat !== 0 &&
      lon !== 0 &&
      !isNaN(lat) &&
      !isNaN(lon) &&
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180
    );
  };
  
  // Monitor browserLocation changes for debugging
  useEffect(() => {
    if (browserLocation) {
      console.log('🔄 browserLocation state changed:', browserLocation);
    }
  }, [browserLocation]);
  
  useEffect(() => {
    if (recommendations.length > 0) {
      console.log('🔄 recommendations state changed, count:', recommendations.length);
    }
  }, [recommendations]);

  // Crop emoji mapping with null/undefined safety
  const getCropEmoji = (cropName: string | undefined | null): string => {
    // Return default emoji if cropName is undefined, null, or empty
    if (!cropName || typeof cropName !== 'string') {
      console.warn('getCropEmoji: Invalid crop name:', cropName);
      return '🌾'; // Default emoji
    }

    const emojiMap: { [key: string]: string } = {
      rice: '🌾',
      wheat: '🌾',
      cotton: '🌱',
      sugarcane: '🌿',
      corn: '🌽',
      maize: '🌽',
      jute: '🌿',
      coffee: '☕',
      coconut: '🥥',
      papaya: '🍈',
      orange: '🍊',
      apple: '🍎',
      muskmelon: '🍈',
      watermelon: '🍉',
      grapes: '🍇',
      mango: '🥭',
      banana: '🍌',
      pomegranate: '🍎',
      lentil: '🫘',
      blackgram: '🫘',
      mungbean: '🫘',
      mothbeans: '🫘',
      pigeonpeas: '🫘',
      kidneybeans: '🫘',
      chickpea: '🫘',
      default: '🌱',
    };
    
    const normalizedName = cropName.toLowerCase().trim();
    return emojiMap[normalizedName] || emojiMap.default;
  };

  const handleAutoDetect = async () => {
    console.log('🎯 Detect button clicked');
    
    // Reset states (but DON'T reset browserLocation yet - will be set after detection)
    setRecommendations([]);
    setError(null);
    setIsLoading(true);
    
    // Clear legacy states
    setDetectedLocation(null);
    setCurrentCoordinates(null);

    try {
      // Get user's current location
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      console.log('🌍 Geolocation available, requesting permission...');
      
      // Check current permission status (if supported)
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          console.log('📋 Current permission status:', permissionStatus.state);
          
          if (permissionStatus.state === 'denied') {
            throw new Error('🔒 Location permission denied.\n\nTo fix:\n1. Click the lock icon in address bar\n2. Find "Location" permission\n3. Change to "Allow"\n4. Refresh page and try again');
          }
          
          if (permissionStatus.state === 'granted') {
            console.log('✅ Permission already granted (cached)');
          } else {
            console.log('⏳ Will prompt for permission...');
          }
        } catch (err) {
          console.log('ℹ️ Permission API not available, will request directly');
        }
      }
      
      console.log('📍 Requesting geolocation...');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('=== LOCATION SUCCESS ===');
            console.log('Full position object:', pos);
            console.log('Latitude:', pos.coords.latitude);
            console.log('Longitude:', pos.coords.longitude);
            console.log('Accuracy:', pos.coords.accuracy);
            console.log('Timestamp:', new Date(pos.timestamp).toLocaleString());
            console.log('✅ Location permission granted');
            resolve(pos);
          },
          (err) => {
            console.error('❌ Geolocation error:', err);
            console.log('Error code:', err.code, 'Message:', err.message);
            // Handle specific geolocation errors with detailed instructions
            if (err.code === 1) {
              reject(new Error('🔒 Location permission denied.\n\nTo fix:\n1. Click the location icon in your browser address bar\n2. Change permission to "Allow"\n3. Refresh the page and try again'));
            } else if (err.code === 2) {
              reject(new Error('📡 Location unavailable.\n\nPlease:\n1. Enable location services on your device\n2. Make sure GPS/WiFi is enabled\n3. Try again'));
            } else if (err.code === 3) {
              reject(new Error('⏱️ Location request timed out. Please try again.'));
            } else {
              reject(new Error(`Failed to get your location: ${err.message}`));
            }
          },
          {
            enableHighAccuracy: true,  // Use GPS for better accuracy
            timeout: 15000,             // Wait up to 15 seconds
            maximumAge: 0               // Don't use cached location
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      console.log('=== PROCESSING COORDINATES ===');
      console.log('Values before setState:');
      console.log('  lat:', latitude, typeof latitude);
      console.log('  lon:', longitude, typeof longitude);
      console.log('  accuracy:', accuracy, typeof accuracy);
      
      // Validate coordinates
      if (latitude === 0 && longitude === 0) {
        console.error('❌ Invalid coordinates: 0, 0');
        throw new Error('Invalid coordinates (0, 0). Please check your device location settings.');
      }
      
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        console.error('❌ Invalid or missing coordinates');
        throw new Error('Invalid coordinates received. Please try again.');
      }
      
      // CRITICAL: Validate coordinates before storing
      if (!isValidLocation(latitude, longitude)) {
        console.error('❌ Invalid location coordinates:', latitude, longitude);
        throw new Error('Invalid coordinates detected. Please try again.');
      }
      
      // CRITICAL: Store browser location in dedicated state
      // This should NEVER be overwritten by API response
      setBrowserLocation({
        latitude: latitude,
        longitude: longitude,
        accuracy: accuracy,
        timestamp: position.timestamp
      });
      
      console.log('✅ SAVED TO STATE:', latitude, longitude);
      console.log('✅ browserLocation will update to:', { latitude, longitude, accuracy });
      
      // Also update legacy states for compatibility
      setDetectedLocation({
        latitude: latitude,
        longitude: longitude,
        accuracy: accuracy,
        timestamp: position.timestamp
      });
      
      setCurrentCoordinates({ 
        lat: latitude, 
        lon: longitude, 
        accuracy: accuracy || 0 
      });
      
      console.log('✅ Browser location saved to state (PERMANENT)');
      console.log('Stored location:', { latitude, longitude, accuracy });
      console.log('======================');

      // Call API to get recommendations
      console.log('📡 Calling backend API with coordinates:', latitude, longitude);
      const data = await api.recommendFromLocation(latitude, longitude);
      console.log('📥 API Response received:', data);
      
      // Check if backend sent invalid location
      if (data.location) {
        if (data.location.latitude === 0 && data.location.longitude === 0) {
          console.warn('⚠️ Backend returned 0,0 coordinates - IGNORING');
          console.warn('⚠️ Using browser-detected location instead');
          // Don't overwrite browserLocation - it's already correct!
        }
      }
      
      // Store API response data (but NOT the location - we keep browser location)
      setLocationData(data);
      
      console.log('✅ API data stored (location NOT overwritten)');
      console.log('✅ browserLocation remains:', { latitude, longitude });

      // Transform API recommendations to match UI format with defensive checks
      const transformedCrops: CropRecommendation[] = (data.recommendations || []).map((rec: any) => {
        // Handle different possible field names from backend
        const cropName = rec?.crop_name || rec?.name || 'Unknown Crop';
        const score = rec?.suitability_score ?? rec?.score ?? 0;
        const price = rec?.market_price ?? rec?.price ?? 'N/A';
        const reason = rec?.reason || `Recommended based on your location's soil and weather conditions.`;
        
        console.log('Processing crop:', { cropName, score, price });
        
        // CRITICAL FIX: Backend already returns scores as 0-100, don't multiply by 100 again!
        // Clamp to 0-100 range just in case
        const clampedScore = Math.min(Math.max(typeof score === 'number' ? score : 0, 0), 100);
        
        return {
          name: cropName,
          emoji: getCropEmoji(cropName),
          suitability: Math.round(clampedScore), // Already a percentage, just round it
          price: typeof price === 'number' ? `₹${price}/quintal` : String(price),
          reason: reason,
        };
      });

      console.log('=== TRANSLATION CHECK ===');
      console.log('🌐 Current language:', language);
      console.log('📦 Raw recommendations:', transformedCrops);
      
      // Translate crop names using hardcoded dictionary (reliable & instant!)
      if (language !== 'en') {
        console.log('🔄 Translating to:', language);
        
        const translatedCrops = transformedCrops.map((crop) => {
          const translatedName = translateCropName(crop.name, language);
          
          return {
            ...crop,
            name: translatedName,
            original_name: crop.name, // Keep original for reference
          };
        });
        
        console.log('✅ Translation complete!');
        console.log('📋 Translated crops:', translatedCrops);
        setRecommendations(translatedCrops);
      } else {
        console.log('ℹ️ Language is English, no translation needed');
        setRecommendations(transformedCrops);
      }
      console.log('======================');
      
      setShowResults(true);
      toast.success('Recommendations generated successfully!');

      // Save to local storage for history
      const searchData = {
        method: 'auto',
        timestamp: new Date().toISOString(),
        location: `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
        crops: transformedCrops.slice(0, 3),
      };

      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      history.unshift(searchData);
      localStorage.setItem('searchHistory', JSON.stringify(history.slice(0, 50)));
    } catch (err: any) {
      console.error('Auto-detect error:', err);
      const errorMessage = err.message || 'Failed to get recommendations. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepare API request data
      const requestData = {
        N: parseFloat(formData.nitrogen),
        P: parseFloat(formData.phosphorus),
        K: parseFloat(formData.potassium),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall),
      };

      // Call API
      const data = await api.recommendManual(requestData);
      console.log('Manual API Response:', data);
      console.log('Manual Recommendations:', data.recommendations);

      // Transform API recommendations to match UI format with defensive checks
      const transformedCrops: CropRecommendation[] = (data.recommendations || []).map((rec: any) => {
        // Handle different possible field names from backend
        const cropName = rec?.crop_name || rec?.name || 'Unknown Crop';
        const score = rec?.suitability_score ?? rec?.score ?? 0;
        const price = rec?.market_price ?? rec?.price ?? 'N/A';
        const reason = rec?.reason || `Recommended based on your provided soil and weather parameters.`;
        
        console.log('Processing manual crop:', { cropName, score, price });
        
        // CRITICAL FIX: Backend already returns scores as 0-100, don't multiply by 100 again!
        // Clamp to 0-100 range just in case
        const clampedScore = Math.min(Math.max(typeof score === 'number' ? score : 0, 0), 100);
        
        return {
          name: cropName,
          emoji: getCropEmoji(cropName),
          suitability: Math.round(clampedScore), // Already a percentage, just round it
          price: typeof price === 'number' ? `₹${price}/quintal` : String(price),
          reason: reason,
        };
      });

      console.log('=== MANUAL TRANSLATION CHECK ===');
      console.log('🌐 Current language:', language);
      console.log('📦 Raw recommendations:', transformedCrops);
      
      // Translate crop names using hardcoded dictionary (reliable & instant!)
      if (language !== 'en') {
        console.log('🔄 Translating to:', language);
        
        const translatedCrops = transformedCrops.map((crop) => {
          const translatedName = translateCropName(crop.name, language);
          
          return {
            ...crop,
            name: translatedName,
            original_name: crop.name,
          };
        });
        
        console.log('✅ Translation complete!');
        console.log('📋 Translated crops:', translatedCrops);
        setRecommendations(translatedCrops);
      } else {
        console.log('ℹ️ Language is English, no translation needed');
        setRecommendations(transformedCrops);
      }
      console.log('======================');
      
      setShowResults(true);
      toast.success('Recommendations generated successfully!');

      // Save to local storage for history
      const searchData = {
        method: 'manual',
        timestamp: new Date().toISOString(),
        inputs: formData,
        crops: transformedCrops.slice(0, 3),
      };

      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      history.unshift(searchData);
      localStorage.setItem('searchHistory', JSON.stringify(history.slice(0, 50)));
    } catch (err: any) {
      console.error('Manual submit error:', err);
      const errorMessage = err.message || 'Failed to get recommendations. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetView = () => {
    setViewMode('default');
    setShowResults(false);
    setIsLoading(false);
  };

  if (viewMode === 'default') {
    return (
      <div className="min-h-screen pt-20 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="mb-3">{t('dashboard.title')}</h1>
            <p className="text-xl text-muted-foreground">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-8 text-center hover-lift">
              <span className="text-4xl mb-4 block">📍</span>
              <h2 className="text-2xl mb-3">{t('dashboard.autodetect.title')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('dashboard.autodetect.desc')}
              </p>
              <button
                onClick={() => setViewMode('auto')}
                className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform"
              >
                {t('dashboard.autodetect.button')}
              </button>
            </div>

            <div className="glass rounded-2xl p-8 text-center hover-lift">
              <span className="text-4xl mb-4 block">✏️</span>
              <h2 className="text-2xl mb-3">{t('dashboard.manual.title')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('dashboard.manual.desc')}
              </p>
              <button
                onClick={() => setViewMode('manual')}
                className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform"
              >
                {t('dashboard.manual.button')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'auto') {
    return (
      <div className="min-h-screen pt-16 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={resetView}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          {!showResults ? (
            <div className="space-y-4">
              {error && (
                <div className="glass rounded-xl p-4 border-2 border-destructive/20 bg-destructive/5">
                  <p className="font-medium whitespace-pre-line">{error}</p>
                </div>
              )}
              
              {/* Location Display - Show REAL browser-detected coordinates */}
              {/* CRITICAL: Always display browserLocation, NEVER API response location */}
              {browserLocation && (
                <div className="glass rounded-xl p-5 border-2 border-green-500/20 bg-gradient-to-r from-green-50 to-blue-50">
                  <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    📍 Your Location (Browser-Detected)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">Latitude:</span>
                      <span className="font-bold text-gray-900">
                        {browserLocation.latitude.toFixed(6)}° {browserLocation.latitude >= 0 ? 'N' : 'S'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">Longitude:</span>
                      <span className="font-bold text-gray-900">
                        {browserLocation.longitude.toFixed(6)}° {browserLocation.longitude >= 0 ? 'E' : 'W'}
                      </span>
                    </div>
                    
                    {browserLocation.accuracy && (
                      <div className="flex items-center gap-2 col-span-2">
                        <span className="font-medium text-gray-600">Accuracy:</span>
                        <span className="text-gray-700">
                          ± {browserLocation.accuracy.toFixed(0)} meters
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  {browserLocation.timestamp && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                      <p className="text-xs text-gray-500">
                        Detected: {new Date(browserLocation.timestamp).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Warning if coordinates are 0,0 */}
              {browserLocation && browserLocation.latitude === 0 && browserLocation.longitude === 0 && (
                <div className="glass rounded-xl p-4 border-2 border-yellow-500/20 bg-yellow-50">
                  <p className="font-semibold text-yellow-800 mb-2">⚠️ Invalid Coordinates Detected</p>
                  <p className="text-sm text-yellow-700 mb-2">To fix this:</p>
                  <ol className="list-decimal ml-5 text-sm text-yellow-700 space-y-1">
                    <li>Clear your browser location cache</li>
                    <li>Make sure location services are enabled on your device</li>
                    <li>Try refreshing the page</li>
                    <li>Click "Detect My Location" again</li>
                  </ol>
                </div>
              )}
              
              {/* Placeholder if no location yet */}
              {!browserLocation && !isLoading && (
                <div className="glass rounded-xl p-5 border-2 border-gray-200 bg-gray-50">
                  <p className="text-gray-600 text-center flex items-center justify-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Click "Detect My Location" to get started
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  onClick={handleAutoDetect}
                  disabled={isLoading}
                  className="px-8 py-4 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {t('dashboard.detectlocation.detecting')}
                    </>
                  ) : (
                    <>
                      <MapPin className="w-6 h-6" />
                      {t('dashboard.detectlocation.button')}
                    </>
                  )}
                </button>
                
                {/* Debug button to check permission status */}
                <button
                  onClick={async () => {
                    if (navigator.permissions) {
                      try {
                        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
                        const message = `Permission Status: ${status.state}\n\n` +
                          `${status.state === 'granted' ? '✅ Permission granted (popup won\'t show - already cached)' : ''}` +
                          `${status.state === 'prompt' ? '⏳ Permission will be requested (popup will show)' : ''}` +
                          `${status.state === 'denied' ? '❌ Permission denied - Please reset in browser settings' : ''}`;
                        alert(message);
                      } catch (err) {
                        alert('Permission API error: ' + err);
                      }
                    } else {
                      alert('Permission API not available in this browser.');
                    }
                  }}
                  className="px-4 py-2 border-2 border-primary text-primary font-medium rounded-full hover:bg-primary/10 transition-colors text-sm"
                >
                  🔍 {t('dashboard.detectlocation.checkpermission')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ========== LOCATION DISPLAY - START ========== */}
              {/* CRITICAL: Display browserLocation (NOT locationData.location which is 0,0) */}
              {browserLocation && (
                <div className="mb-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-lg">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3 border-b border-green-200 pb-2">
                    <div className="text-3xl">📍</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{t('dashboard.location.title')}</h3>
                      <p className="text-sm text-gray-600">{t('dashboard.location.detected')}</p>
                    </div>
                  </div>
                  
                  {/* Coordinates Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Latitude */}
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100">
                      <div className="text-xs font-medium text-gray-500 mb-1">{t('dashboard.location.latitude').toUpperCase()}</div>
                      <div className="text-xl font-bold text-green-700">
                        {browserLocation.latitude.toFixed(4)}°
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {browserLocation.latitude >= 0 ? t('dashboard.location.north') : t('dashboard.location.south')}
                      </div>
                    </div>
                    
                    {/* Longitude */}
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100">
                      <div className="text-xs font-medium text-gray-500 mb-1">{t('dashboard.location.longitude').toUpperCase()}</div>
                      <div className="text-xl font-bold text-blue-700">
                        {browserLocation.longitude.toFixed(4)}°
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {browserLocation.longitude >= 0 ? t('dashboard.location.east') : t('dashboard.location.west')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Accuracy */}
                  {browserLocation.accuracy && (
                    <div className="mt-3 text-center text-sm text-gray-600">
                      📡 {t('dashboard.location.accuracy')}: ± {Math.round(browserLocation.accuracy)} {t('dashboard.location.meters')}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  {browserLocation.timestamp && (
                    <div className="mt-3 text-center text-xs text-gray-500">
                      {t('dashboard.detected')}: {new Date(browserLocation.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
              {/* ========== LOCATION DISPLAY - END ========== */}
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="glass rounded-xl p-5">
                  <span className="text-3xl mb-3 block">🏞️</span>
                  <h3 className="font-semibold mb-2">{t('dashboard.soiltype')}</h3>
                  <p className="font-medium">{overriddenSoilType || locationData?.detected_soil?.soil_type || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{locationData?.detected_soil?.technical_name || ''}</p>
                  {!showSoilOverride ? (
                    <button
                      onClick={() => setShowSoilOverride(true)}
                      className="mt-3 text-sm text-primary hover:underline"
                    >
                      {t('dashboard.soiltype.wrong')}
                    </button>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <select
                        value={overriddenSoilType || locationData?.detected_soil?.soil_type || ''}
                        onChange={(e) => setOverriddenSoilType(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      >
                        <option value="Sandy">Sandy Soil</option>
                        <option value="Clay">Clay Soil</option>
                        <option value="Loam">Loam Soil</option>
                        <option value="Loamy">Loamy Soil</option>
                        <option value="Silty">Silty Soil</option>
                        <option value="Red">Red Soil</option>
                        <option value="Black">Black Soil</option>
                        <option value="Alluvial">Alluvial Soil</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowSoilOverride(false);
                            toast.info('Soil type updated. Recommendations remain based on original detection.');
                          }}
                          className="flex-1 px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => {
                            setShowSoilOverride(false);
                            setOverriddenSoilType(null);
                          }}
                          className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-muted"
                        >
                          {t('dashboard.soiltype.cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="glass rounded-2xl p-6">
                  <span className="text-3xl mb-3 block">☁️</span>
                  <h3 className="font-semibold mb-2">{t('dashboard.weather')}</h3>
                  <p className="font-medium">
                    {locationData?.current_weather?.temperature || 'N/A'}°C, {locationData?.current_weather?.humidity || 'N/A'}% Humidity
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {locationData?.current_weather?.rainfall || 'N/A'}mm {t('dashboard.weather.rainfall')}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl mb-6 text-center">{t('dashboard.recommendations.title')}</h2>
                {recommendations && recommendations.length > 0 ? (
                  <div className="grid gap-4">
                    {recommendations.map((crop, index) => (
                    <div key={crop.name || index} className="glass rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{crop.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold">{crop.name}</h3>
                            <span className="px-4 py-1 bg-secondary/20 text-secondary rounded-full font-medium">
                              {crop.price}
                            </span>
                          </div>
                          <div className="mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all duration-500"
                                  style={{ width: `${crop.suitability}%` }}
                                />
                              </div>
                              <span className="font-semibold text-primary">{crop.suitability}%</span>
                            </div>
                          </div>
                          <details className="text-sm text-muted-foreground">
                            <summary className="cursor-pointer font-medium text-foreground hover:text-primary">
                              Why this crop?
                            </summary>
                            <p className="mt-2">{crop.reason}</p>
                          </details>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass rounded-2xl p-12 text-center">
                    <p className="text-xl text-muted-foreground">No recommendations available</p>
                    <p className="text-sm text-muted-foreground mt-2">Try detecting your location again</p>
                  </div>
                )}
                
                {/* Validation Checklist */}
                {recommendations && recommendations.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3">✅ Validation Checklist</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={recommendations.every(r => r.suitability >= 0 && r.suitability <= 100) ? 'text-green-600' : 'text-red-600'}>
                          {recommendations.every(r => r.suitability >= 0 && r.suitability <= 100) ? '✅' : '❌'}
                        </span>
                        <span>All scores between 0-100%</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={recommendations.length > 0 ? 'text-green-600' : 'text-red-600'}>
                          {recommendations.length > 0 ? '✅' : '❌'}
                        </span>
                        <span>Recommendations received ({recommendations.length} crops)</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={browserLocation ? 'text-green-600' : 'text-gray-400'}>
                          {browserLocation ? '✅' : '⚪'}
                        </span>
                        <span>Location detected {browserLocation && `(${browserLocation.latitude.toFixed(4)}°, ${browserLocation.longitude.toFixed(4)}°)`}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={recommendations.every(r => r.name) ? 'text-green-600' : 'text-red-600'}>
                          {recommendations.every(r => r.name) ? '✅' : '❌'}
                        </span>
                        <span>All crops have names</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <button className="px-8 py-3 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform">
                  Save to History
                </button>
                <button
                  onClick={() => setShowResults(false)}
                  className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-full hover:scale-105 transition-transform"
                >
                  Get New Recommendations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[90px] px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={resetView}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('dashboard.back')}
        </button>

        <h2 className="text-2xl mb-6 text-center">{t('manual.title')}</h2>
        
        {/* Test Buttons Section */}
        <div className="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-200 max-w-2xl mx-auto">
          <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
            <span className="text-xl">🧪</span>
            {t('manual.test.title')}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {t('manual.test.desc')}
          </p>
          
          <div className="flex flex-wrap gap-3">
            {/* Test Case 1: Rice */}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  nitrogen: '90',
                  phosphorus: '42',
                  potassium: '43',
                  temperature: '21',
                  humidity: '82',
                  ph: '6.5',
                  rainfall: '202'
                });
                toast.success('Rice test conditions loaded');
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              🌾 {t('manual.test.rice')}
            </button>
            
            {/* Test Case 2: Wheat */}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  nitrogen: '80',
                  phosphorus: '40',
                  potassium: '50',
                  temperature: '18',
                  humidity: '65',
                  ph: '7.0',
                  rainfall: '100'
                });
                toast.success('Wheat test conditions loaded');
              }}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              🌾 {t('manual.test.wheat')}
            </button>
            
            {/* Test Case 3: Cotton */}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  nitrogen: '120',
                  phosphorus: '60',
                  potassium: '40',
                  temperature: '25',
                  humidity: '70',
                  ph: '6.8',
                  rainfall: '80'
                });
                toast.success('Cotton test conditions loaded');
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              🌱 {t('manual.test.cotton')}
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            <strong>Expected:</strong> {t('manual.test.expected')}
          </p>
        </div>

        {!showResults ? (
          <form onSubmit={handleManualSubmit} className="glass rounded-2xl p-6 max-w-2xl mx-auto">
            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                <p className="font-medium">{error}</p>
              </div>
            )}
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('manual.nitrogen')}</label>
                <div className="relative">
                  <input
                    type="number"
                    name="nitrogen"
                    value={formData.nitrogen}
                    onChange={handleInputChange}
                    placeholder="e.g., 80"
                    required
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    kg/ha
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('manual.phosphorus')}</label>
                <div className="relative">
                  <input
                    type="number"
                    name="phosphorus"
                    value={formData.phosphorus}
                    onChange={handleInputChange}
                    placeholder="e.g., 40"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    kg/ha
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('manual.potassium')}</label>
                <div className="relative">
                  <input
                    type="number"
                    name="potassium"
                    value={formData.potassium}
                    onChange={handleInputChange}
                    placeholder="e.g., 40"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    kg/ha
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('manual.temperature')}</label>
                <div className="relative">
                  <input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    placeholder="e.g., 25"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    °C
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('manual.humidity')}</label>
                <div className="relative">
                  <input
                    type="number"
                    name="humidity"
                    value={formData.humidity}
                    onChange={handleInputChange}
                    placeholder="e.g., 70"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('manual.ph')}</label>
                <input
                  type="number"
                  step="0.1"
                  name="ph"
                  value={formData.ph}
                  onChange={handleInputChange}
                  placeholder="e.g., 6.5"
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('manual.rainfall')}</label>
                <div className="relative">
                  <input
                    type="number"
                    name="rainfall"
                    value={formData.rainfall}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    mm
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('manual.processing')}
                </>
              ) : (
                t('manual.submit')
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="mb-8 text-center">{t('results.toprecommendations')}</h2>
              {recommendations && recommendations.length > 0 ? (
                <div className="grid gap-6">
                  {recommendations.map((crop, index) => (
                    <div key={crop.name || index} className="glass rounded-2xl p-6">
                    <div className="flex items-start gap-6">
                      <div className="text-5xl">{crop.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl font-semibold">{crop.name}</h3>
                          <span className="px-4 py-1 bg-secondary/20 text-secondary rounded-full font-medium">
                            {crop.price}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${crop.suitability}%` }}
                              />
                            </div>
                            <span className="font-semibold text-primary">{crop.suitability}%</span>
                          </div>
                        </div>
                        <details className="text-sm text-muted-foreground">
                          <summary className="cursor-pointer font-medium text-foreground hover:text-primary">
                            Why this crop?
                          </summary>
                          <p className="mt-2">{crop.reason}</p>
                        </details>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-2xl p-12 text-center">
                  <p className="text-xl text-muted-foreground">No recommendations available</p>
                  <p className="text-sm text-muted-foreground mt-2">Please check your input values</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform">
                Save to History
              </button>
              <button
                onClick={() => {
                  setShowResults(false);
                  setFormData({
                    nitrogen: '',
                    phosphorus: '',
                    potassium: '',
                    temperature: '',
                    humidity: '',
                    ph: '',
                    rainfall: '',
                  });
                }}
                className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-full hover:scale-105 transition-transform"
              >
                Get New Recommendations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
