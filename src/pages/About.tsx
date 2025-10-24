import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen pt-[90px] px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-center mb-16">{t('about.title')}</h1>

        {/* Mission Section */}
        <section className="mb-20">
          <h2 className="text-center mb-8">{t('about.mission')}</h2>
          <p className="text-xl text-center max-w-4xl mx-auto text-muted-foreground leading-relaxed">
            {t('about.missiontext')}
          </p>
        </section>

        {/* Technology Section */}
        <section className="mb-20">
          <h2 className="text-center mb-12">{t('about.team')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass rounded-2xl p-8 text-center hover-lift">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3">CatBoost ML Model</h3>
              <p className="text-muted-foreground">99.51% accuracy in crop recommendations</p>
            </div>
            <div className="glass rounded-2xl p-8 text-center hover-lift">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3">Federated Learning</h3>
              <p className="text-muted-foreground">Privacy-preserving AI technology</p>
            </div>
            <div className="glass rounded-2xl p-8 text-center hover-lift">
              <div className="text-5xl mb-4">🌦️</div>
              <h3 className="text-xl font-semibold mb-3">Weather Integration</h3>
              <p className="text-muted-foreground">Real-time weather data analysis</p>
            </div>
            <div className="glass rounded-2xl p-8 text-center hover-lift">
              <div className="text-5xl mb-4">📍</div>
              <h3 className="text-xl font-semibold mb-3">GPS Soil Detection</h3>
              <p className="text-muted-foreground">Location-based soil analysis</p>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="mb-20">
          <h2 className="text-center mb-12">Our Impact</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-5xl font-bold text-primary mb-2">10,000+</p>
              <p className="text-lg text-muted-foreground">Farmers</p>
            </div>
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-5xl font-bold text-primary mb-2">50,000+</p>
              <p className="text-lg text-muted-foreground">Recommendations</p>
            </div>
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-5xl font-bold text-primary mb-2">99.51%</p>
              <p className="text-lg text-muted-foreground">Accuracy</p>
            </div>
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-5xl font-bold text-primary mb-2">5</p>
              <p className="text-lg text-muted-foreground">Languages</p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <div className="glass rounded-3xl p-12 text-center">
            <h2 className="mb-6">{t('about.contact')}</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Have questions? We're here to help you succeed.
            </p>
            <div className="space-y-3 mb-8">
              <p className="text-lg">
                <strong>Email:</strong> support@agrismart.com
              </p>
              <p className="text-lg">
                <strong>Phone:</strong> +91 XXXXX XXXXX
              </p>
            </div>
            <button className="px-10 py-4 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform">
              {t('about.contact')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
