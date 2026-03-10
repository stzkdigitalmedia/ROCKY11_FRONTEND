import { useState, useEffect } from 'react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import UserSidebar from '../components/UserSidebar';
import UserHeader from '../components/UserHeader';
import { Play, Users } from 'lucide-react';

const UserGames = () => {
  const [availableGames, setAvailableGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToastContext();

  const fetchAvailableExchanges = async () => {
    setLoading(true);
    try {
      const response = await apiHelper.get('/panel/getAllPanels?page=1&limit=10');
      const panelsData = response.data?.panels || response.panels || response.data || response || [];
      

      
      // Filter only active panels
      const activePanels = panelsData.filter(panel => {
        return panel?.isActive === true;
      });
      
      
      // Group by panel name (which is same as game name)
      const gameGroups = activePanels.reduce((groups, panel) => {
        const gameName = panel.panelName || panel.name || 'Unknown';
        if (!groups[gameName]) {
          groups[gameName] = {
            name: gameName,
            panels: [],
            activeCount: 0
          };
        }
        groups[gameName].panels.push(panel);
        groups[gameName].activeCount++;
        return groups;
      }, {});
      
      // Convert to array and sort alphabetically
      const availableGamesList = Object.values(gameGroups).sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      
      setAvailableGames(availableGamesList);
    } catch (error) {
      console.error('Fetch available exchanges error:', error);
      toast.error('Failed to fetch available exchanges: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableExchanges();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <UserSidebar />
      
      <div className="flex-1 overflow-auto">
        <UserHeader 
          title="Available Exchanges" 
          subtitle="Active gaming exchanges ready to play" 
        />
        <div className="p-8">

          <div className="gaming-card p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Play className="w-5 h-5" style={{color: '#1477b0'}} />
                Available Exchanges
              </h2>
              <p className="text-gray-600 text-sm mt-1">Active gaming exchanges available for play</p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading exchanges...</p>
              </div>
            ) : availableGames.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No exchanges available</p>
                <p className="text-sm">All exchanges are currently inactive</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableGames.map((game, index) => (
                  <div key={game.name || index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{backgroundColor: '#1477b0'}}>
                        {game.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{game.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{game.activeCount} active panel{game.activeCount > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Available Panels</span>
                        <span className="text-sm font-medium text-gray-900">{game.activeCount}</span>
                      </div>
                      
                      <button className="w-full mt-4 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2" style={{backgroundColor: '#1477b0'}}>
                        <Play className="w-4 h-4" />
                        Play Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGames;