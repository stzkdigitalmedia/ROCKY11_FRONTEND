import { useState, useEffect } from 'react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { Gamepad2, Plus, Edit, Trash2, X, Check } from 'lucide-react';

const GamesPanel = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const [gameForm, setGameForm] = useState({ name: '', image: null, gameUrl: '' });
  const [addingGame, setAddingGame] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', gameUrl: '', image: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [gameToDelete, setGameToDelete] = useState(null);
  const itemsPerPage = 10;
  const toast = useToastContext();

  const fetchGames = async (page = currentPage) => {
    setLoading(true);
    try {
      const response = await apiHelper.get(`/game/getAllGamesWithPagination?page=${page}&limit=${itemsPerPage}`);
      const gamesList = response?.games || response?.data || response || [];
      setGames(gamesList);
      setTotalPages(response?.totalPages || Math.ceil((response?.total || gamesList?.length || 0) / itemsPerPage));
      setTotalGames(response?.total || gamesList?.length || 0);
      setCurrentPage(page);
    } catch (error) {
      toast.error('Failed to fetch games: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    if (!gameForm.name.trim() || !gameForm.image || !gameForm.gameUrl.trim()) return;

    setAddingGame(true);
    try {
      const formData = new FormData();
      formData.append('name', gameForm.name);
      formData.append('image', gameForm.image);
      formData.append('gameUrl', gameForm.gameUrl);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/game/addGame`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || 'Failed to add game');
      }

      toast.success('Game added successfully!');
      setGameForm({ name: '', image: null, gameUrl: '' });
      setShowAddGame(false);
      fetchGames();
    } catch (error) {
      toast.error('Failed to add game: ' + (error?.message || 'Unknown error'));
    } finally {
      setAddingGame(false);
    }
  };

  const handleDeleteGame = async () => {
    if (!gameToDelete) return;

    try {
      await apiHelper.delete(`/game/deleteGame/${gameToDelete?.id || gameToDelete?._id || gameToDelete?.gameId}`);
      toast.success('Game deleted successfully!');
      setGameToDelete(null);
      fetchGames();
    } catch (error) {
      toast.error('Failed to delete game: ' + (error?.message || 'Unknown error'));
    }
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setEditForm({ name: game?.name, gameUrl: game?.gameUrl || '', image: null });
  };

  const handleUpdateGame = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;

    const gameId = editingGame?.id || editingGame?._id || editingGame?.gameId;

    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('gameUrl', editForm.gameUrl);
      if (editForm.image) {
        formData.append('image', editForm.image);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/game/updateGameName/${gameId}`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || 'Failed to update game');
      }

      toast.success('Game updated successfully!');
      setEditingGame(null);
      setEditForm({ name: '', gameUrl: '', image: null });
      fetchGames();
    } catch (error) {
      toast.error('Failed to update game: ' + (error?.message || 'Unknown error'));
    }
  };

  const handleToggleStatus = async (gameId) => {
    try {
      await apiHelper.patch(`/game/activeInactiveGameStatus/${gameId}`);
      toast.success('Game status updated!');
      fetchGames();
    } catch (error) {
      toast.error('Failed to update status: ' + (error?.message || 'Unknown error'));
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" style={{ color: '#1477b0' }} />
            Games Management
          </h2>
          <p className="text-gray-600 text-sm mt-1">Manage platform games</p>
        </div>
        <button
          onClick={() => setShowAddGame(true)}
          className="gaming-btn flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Game
        </button>
      </div>

      {/* Games List */}
      <div className="gaming-card p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
            <p className="text-gray-600">Loading games...</p>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">No games found</p>
            <p className="text-sm">Add some games to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game, index) => (
                  <tr key={game?.id || index} className="table-row border-b border-gray-100">
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + index + 1}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: '#1477b0' }}>
                          <Gamepad2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{game?.name}</h3>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(game?.id || game?._id || game?.gameId)}
                        className={`w-12 h-6 rounded-full transition-colors ${game?.status || game?.isActive ? '' : 'bg-gray-300'
                          }`}
                        style={game?.status || game?.isActive ? { backgroundColor: '#1477b0' } : {}}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${game?.status || game?.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-500">{game?.createdAt || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            handleEditGame(game);
                          }}
                          className="text-sm font-medium flex items-center gap-1 hover:opacity-80"
                          style={{ color: '#1477b0' }}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>

                        <button
                          onClick={() => setGameToDelete(game)}
                          className="delete-btn text-sm flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalGames)} of {totalGames} games
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchGames(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="px-3 py-1 text-sm text-white border rounded" style={{ backgroundColor: '#1477b0', borderColor: '#1477b0' }}>
                {currentPage}
              </span>

              <button
                onClick={() => fetchGames(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Game Modal */}
      {showAddGame && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Add New Game</h2>
                  <p className="text-gray-600 text-sm mt-1">Create a new game entry</p>
                </div>
                <button
                  onClick={() => setShowAddGame(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <form onSubmit={handleAddGame} className="space-y-5">
                {/* Game Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter game name"
                    value={gameForm.name}
                    onChange={(e) => setGameForm({ ...gameForm, name: e?.target?.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Game URL Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={gameForm.gameUrl}
                    onChange={(e) => setGameForm({ ...gameForm, gameUrl: e?.target?.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Game Image Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setGameForm({ ...gameForm, image: e?.target?.files?.[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    required
                  />
                  {gameForm.image && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {gameForm?.image?.name}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={addingGame || !gameForm.name.trim() || !gameForm.image || !gameForm.gameUrl.trim()}
                    className="flex-1 px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#1477b0' }}
                    onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#0f5a8a')}
                    onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#1477b0')}
                  >
                    {addingGame ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Game'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddGame(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Game Modal */}
      {editingGame && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="gaming-card p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit Game</h2>
                <p className="text-gray-600 text-sm mt-1">Update game name</p>
              </div>
              <button onClick={() => setEditingGame(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGame} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Game Name</label>
                <input
                  type="text"
                  placeholder="Enter game name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e?.target?.value })}
                  className="gaming-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Game URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={editForm.gameUrl}
                  onChange={(e) => setEditForm({ ...editForm, gameUrl: e?.target?.value })}
                  className="gaming-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Game Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditForm({ ...editForm, image: e?.target?.files?.[0] })}
                  className="gaming-input file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {editForm.image && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {editForm?.image?.name}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setEditingGame(null)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 gaming-btn flex items-center justify-center">
                  <Check className="w-4 h-4 mr-2" />Update Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {gameToDelete && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="gaming-card p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-red-600">Delete Game</h2>
                <p className="text-gray-600 text-sm mt-1">This action cannot be undone</p>
              </div>
              <button onClick={() => setGameToDelete(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">Are you sure you want to delete <strong>{gameToDelete?.name}</strong>?</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setGameToDelete(null)} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteGame} className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center">
                <Trash2 className="w-4 h-4 mr-2" />Delete Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamesPanel;