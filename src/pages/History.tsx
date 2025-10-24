import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, RotateCcw, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';

type FilterType = 'all' | 'auto' | 'manual' | 'saved';

const History = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('agrismart_user') || '{}');
      const userId = user.email || 'guest';

      // Try to fetch from API
      try {
        const apiHistory = await api.getHistory(userId);
        if (apiHistory && apiHistory.length > 0) {
          setHistory(apiHistory);
          return;
        }
      } catch (apiError) {
        console.log('API history not available, using local storage');
      }

      // Fallback to localStorage
      const savedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setHistory(savedHistory);
    } catch (error: any) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to load history');
      // Fallback to localStorage
      const savedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setHistory(savedHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'auto') return item.method === 'auto';
    if (filter === 'manual') return item.method === 'manual';
    return false;
  });

  const deleteItem = (index: number) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const stats = {
    totalSearches: history.length,
    mostRecommended: 'Rice',
    favoriteLocation: 'Hyderabad',
    successRate: 95,
  };

  return (
    <div className="min-h-screen pt-[90px] px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="mb-4">My Search History 📊</h1>
          <p className="text-xl text-muted-foreground">
            View your previous crop recommendations and searches
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">{stats.totalSearches}</p>
            <p className="text-sm text-muted-foreground">Total Searches</p>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">{stats.mostRecommended}</p>
            <p className="text-sm text-muted-foreground">Most Recommended</p>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">{stats.favoriteLocation}</p>
            <p className="text-sm text-muted-foreground">Favorite Location</p>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">{stats.successRate}%</p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'auto', label: 'Auto-Detect' },
            { key: 'manual', label: 'Manual Input' },
            { key: 'saved', label: 'Saved' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as FilterType)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                filter === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-muted text-foreground hover:bg-primary/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* History List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-xl text-muted-foreground">No search history yet</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-6 px-8 py-3 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform"
              >
                Get Your First Recommendation
              </button>
            </div>
          ) : (
            filteredHistory.map((item, index) => (
              <div key={index} className="glass rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.method === 'auto'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-secondary/20 text-secondary'
                        }`}
                      >
                        {item.method === 'auto' ? 'Auto' : 'Manual'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleDateString()} at{' '}
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-medium mb-3">
                      {item.location || 'Manual Input'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.crops?.map((crop: any, idx: number) => (
                        <div
                          key={idx}
                          className="px-3 py-1 bg-muted rounded-full text-sm flex items-center gap-2"
                        >
                          <span>{crop.emoji}</span>
                          <span>{crop.name}</span>
                          <span className="text-primary font-medium">{crop.suitability}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title="Repeat Search"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteItem(index)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
