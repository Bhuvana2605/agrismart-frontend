import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, Sun, Moon, Menu, X, ChevronDown, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const user = localStorage.getItem('agrismart_user');
    
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    setIsLoggedIn(!!user);
  }, []);

  // Check login status on route change
  useEffect(() => {
    const user = localStorage.getItem('agrismart_user');
    setIsLoggedIn(!!user);
  }, [location]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLanguageChange = (langCode: 'en' | 'te' | 'hi') => {
    setLanguage(langCode);
    setShowLanguageDropdown(false);
    toast({
      title: '🌐 Language Changed',
      description: `Language changed to ${languages.find(l => l.code === langCode)?.name}`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('agrismart_user');
    setIsLoggedIn(false);
    setShowProfileDropdown(false);
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass h-16 flex items-center px-6">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <span className="text-xl">🌾</span>
          <h2 className="text-xl font-semibold">AgriSmart</h2>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 flex-grow justify-center">
          <Link
            to="/"
            className={`text-base font-medium transition-colors ${
              isActive('/') ? 'text-primary' : 'text-foreground hover:text-primary'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/dashboard"
            className={`text-base font-medium transition-colors ${
              isActive('/dashboard') ? 'text-primary' : 'text-foreground hover:text-primary'
            }`}
          >
            {t('nav.dashboard')}
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
              className="flex items-center gap-1 text-base font-medium text-foreground hover:text-primary transition-colors"
            >
              {t('nav.community')}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showCommunityDropdown && (
              <div className="absolute top-full mt-2 w-48 glass-strong rounded-lg shadow-lg py-2 z-50">
                <Link
                  to="/community"
                  onClick={() => setShowCommunityDropdown(false)}
                  className="block px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
                >
                  {t('nav.community')}
                </Link>
                <Link
                  to="/feedback"
                  onClick={() => setShowCommunityDropdown(false)}
                  className="block px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
                >
                  {t('nav.feedback')}
                </Link>
                <Link
                  to="/tutorials"
                  onClick={() => setShowCommunityDropdown(false)}
                  className="block px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
                >
                  {t('nav.tutorials')}
                </Link>
              </div>
            )}
          </div>
          <Link
            to="/about"
            className={`text-base font-medium transition-colors ${
              isActive('/about') ? 'text-primary' : 'text-foreground hover:text-primary'
            }`}
          >
            {t('nav.about')}
          </Link>
        </div>

        {/* Right Side Icons */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-1 text-foreground hover:text-primary transition-colors"
            >
              <Globe className="w-5 h-5" />
              <ChevronDown className="w-4 h-4" />
            </button>
            {showLanguageDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 glass-strong rounded-lg shadow-lg py-2 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as any)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors flex items-center gap-3 ${
                      language === lang.code ? 'bg-green-50 text-primary font-semibold' : ''
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    {language === lang.code && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Profile */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <User className="w-4 h-4 text-primary" />
              </button>
              {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 glass-strong rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    className="block px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setShowProfileDropdown(false)}
                    className="block px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
                  >
                    {t('nav.history')}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    className="block px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
                  >
                    {t('nav.settings')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors text-destructive"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-full font-medium hover:scale-105 transition-transform"
            >
              {t('nav.signin')}
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 glass-strong border-t border-border p-4 space-y-3">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium">
            {t('nav.home')}
          </Link>
          <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium">
            {t('nav.dashboard')}
          </Link>
          <Link to="/community" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium">
            {t('nav.community')}
          </Link>
          <Link to="/feedback" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium">
            {t('nav.feedback')}
          </Link>
          <Link to="/tutorials" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium">
            {t('nav.tutorials')}
          </Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium">
            {t('nav.about')}
          </Link>
          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium">
            {t('nav.profile')}
          </Link>
          <Link to="/history" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium">
            {t('nav.history')}
          </Link>
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <button onClick={toggleTheme} className="p-2">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'te' | 'hi')}
              className="bg-transparent border border-border rounded px-2 py-1 text-sm"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
