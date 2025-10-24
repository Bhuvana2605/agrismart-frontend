import { Play, Clock } from 'lucide-react';

interface Tutorial {
  id: number;
  title: string;
  duration: string;
  description: string;
  thumbnail: string;
}

const Tutorials = () => {
  const tutorials: Tutorial[] = [
    {
      id: 1,
      title: 'How to Use GPS Detection',
      duration: '3 min',
      description: 'Learn how auto-detection works',
      thumbnail: '🗺️',
    },
    {
      id: 2,
      title: 'Understanding Soil Types',
      duration: '5 min',
      description: 'Know your soil for better crops',
      thumbnail: '🏞️',
    },
    {
      id: 3,
      title: 'Reading Weather Forecasts',
      duration: '4 min',
      description: 'Use weather data effectively',
      thumbnail: '☁️',
    },
    {
      id: 4,
      title: 'Market Price Trends',
      duration: '6 min',
      description: 'Maximize your profits',
      thumbnail: '💰',
    },
    {
      id: 5,
      title: 'Using Manual Input Mode',
      duration: '4 min',
      description: 'Enter NPK values correctly',
      thumbnail: '✏️',
    },
    {
      id: 6,
      title: 'Interpreting Results',
      duration: '5 min',
      description: 'Understand your recommendations',
      thumbnail: '📊',
    },
  ];

  return (
    <div className="min-h-screen pt-[90px] px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="mb-4">Farming Tutorials 📚</h1>
          <p className="text-xl text-muted-foreground">
            Learn how to use AgriSmart effectively
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <div key={tutorial.id} className="glass rounded-2xl overflow-hidden hover-lift">
              <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="text-6xl">{tutorial.thumbnail}</div>
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-primary ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{tutorial.duration}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{tutorial.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tutorial.description}</p>
                <button className="w-full py-2 bg-primary text-white font-medium rounded-full hover:scale-105 transition-transform">
                  Watch Tutorial
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tutorials;
