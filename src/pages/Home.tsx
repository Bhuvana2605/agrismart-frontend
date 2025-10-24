import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import heroImage from '@/assets/hero-farmland.jpg';

const Home = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(46, 125, 50, 0.75), rgba(129, 199, 132, 0.5)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{t('home.hero.title')}</h1>
          <p className="text-base md:text-lg mb-6 font-medium">
            {t('home.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link
              to="/auth"
              className="px-6 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all hover:scale-105"
            >
              {t('home.hero.signin')}
            </Link>
            <Link
              to="/auth"
              className="px-6 py-3 bg-white text-primary font-semibold rounded-full hover:scale-105 transition-transform"
            >
              {t('home.hero.getstarted')}
            </Link>
          </div>
          <p className="text-sm opacity-90">{t('home.hero.farmers')}</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center mb-10">{t('home.features.title')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass rounded-xl p-6 text-center hover-lift">
              <div className="text-4xl mb-3">📍</div>
              <h3 className="text-xl font-semibold mb-2">{t('home.features.gps.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.features.gps.desc')}
              </p>
            </div>
            <div className="glass rounded-xl p-6 text-center hover-lift">
              <div className="text-4xl mb-3">☁️</div>
              <h3 className="text-xl font-semibold mb-2">{t('home.features.weather.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.features.weather.desc')}
              </p>
            </div>
            <div className="glass rounded-xl p-6 text-center hover-lift">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-semibold mb-2">{t('home.features.market.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.features.market.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 px-4 bg-accent/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center mb-10">{t('home.howitworks.title')}</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="glass rounded-xl p-6">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mb-3">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('home.howitworks.step1.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.howitworks.step1.desc')}
              </p>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mb-3">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('home.howitworks.step2.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.howitworks.step2.desc')}
              </p>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mb-3">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('home.howitworks.step3.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.howitworks.step3.desc')}
              </p>
            </div>
          </div>
          <div className="text-center">
            <Link
              to="/dashboard"
              className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform"
            >
              {t('home.howitworks.cta')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
