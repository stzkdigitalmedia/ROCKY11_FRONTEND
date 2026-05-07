import { useState, useEffect } from "react";
import { useToastContext } from "../App";
import { apiHelper } from "../utils/apiHelper";
import {
  Edit2, Eye, EyeOff, ChevronUp, ChevronDown,
  X, Search, Gamepad2, RotateCcw,
} from "lucide-react";

const getErrorMessage = (error) => {
  if (error?.message && !error.message.includes("<!DOCTYPE")) return error.message;
  return "Something went wrong";
};

const LobbyManagement = () => {
  const toast = useToastContext();

  const [lobbyProviders, setLobbyProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedGames, setSelectedGames] = useState({});
  const [displayOrders, setDisplayOrders] = useState({});
  const [providerDisplayOrder, setProviderDisplayOrder] = useState(0);

  useEffect(() => { fetchProvidersWithGames(1); }, [searchTerm]);

  const fetchProvidersWithGames = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await apiHelper.post("/game/games/getProvidersWithGames", {
        providerName: searchTerm, page: pageNum, pageSize,
      });
      setLobbyProviders(response?.data?.providers || []);
      setTotalPages(response?.data?.pagination?.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEditLobbyProvider = (provider) => {
    setEditingProvider(provider);
    setSelectedProvider(provider);
    setProviderDisplayOrder(provider.displayOrder || 0);
    const selected = {};
    const orders = {};
    provider.games.forEach((game) => {
      if (game.isSelected) {
        selected[game.game_id] = true;
        orders[game.game_id] = game.displayOrder || 0;
      }
    });
    setSelectedGames(selected);
    setDisplayOrders(orders);
    setShowModal(true);
  };

  const handleToggleGameSelection = (gameId) => {
    setSelectedGames((prev) => ({ ...prev, [gameId]: !prev[gameId] }));
    if (!selectedGames[gameId]) {
      setDisplayOrders((prev) => ({ ...prev, [gameId]: Object.keys(selectedGames).length }));
    }
  };

  const handleSaveLobbyProvider = async () => {
    if (!selectedProvider) { toast.error("No provider selected"); return; }
    const selectedGameIds = Object.keys(selectedGames).filter((id) => selectedGames[id]);
    if (selectedGameIds.length === 0) { toast.error("Please select at least one game"); return; }
    try {
      const providerData = {
        providerName: selectedProvider.providerName,
        displayOrder: providerDisplayOrder,
        isActive: true,
        providerLogo: null,
        games: selectedGameIds.map((gameId) => ({ game_id: gameId, displayOrder: displayOrders[gameId] || 0 })),
      };
      const res = await apiHelper.post("/game/games/setLobbyGames", { providers: [providerData] });
      toast.success(res?.data?.message || res?.message);
      setShowModal(false);
      fetchProvidersWithGames(page);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleResetLobbyProvider = async (providerName) => {
    if (!window.confirm(`Reset all lobby games for ${providerName}?`)) return;
    try {
      const res = await apiHelper.post("/game/games/removeLobbyProvider", { providerName });
      toast.success(res?.data?.message || res?.message);
      fetchProvidersWithGames(page);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleToggleLobbyProvider = async (providerName, isActive) => {
    try {
      const res = await apiHelper.post("/game/games/toggleLobbyProvider", { providerName, isActive: !isActive });
      const msg = res?.data?.message || res?.message;
      if (msg) toast.success(msg);
      fetchProvidersWithGames(page);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const totalSelected = lobbyProviders.reduce((acc, p) => acc + p.games.filter((g) => g.isSelected).length, 0);
  const activeProviders = lobbyProviders.filter((p) => p.isActive).length;

  const sortedProviders = [...lobbyProviders].sort((a, b) => {
    const aSelected = a.games.filter((g) => g.isSelected).length;
    const bSelected = b.games.filter((g) => g.isSelected).length;
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    if (!a.isActive && !b.isActive) {
      if (aSelected > 0 && bSelected === 0) return -1;
      if (aSelected === 0 && bSelected > 0) return 1;
    }
    return 0;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <Gamepad2 size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">Lobby Management</h2>
            <p className="text-xs text-gray-400">Configure providers and games shown in the casino lobby</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-center">
          <div className="border-r border-gray-200 pr-6">
            <p className="text-xl font-bold text-gray-800">{lobbyProviders.length}</p>
            <p className="text-xs text-gray-400 font-medium">Total</p>
          </div>
          <div className="border-r border-gray-200 pr-6">
            <p className="text-xl font-bold text-green-600">{activeProviders}</p>
            <p className="text-xs text-gray-400 font-medium">Active</p>
          </div>
          <div>
            <p className="text-xl font-bold text-blue-600">{totalSelected}</p>
            <p className="text-xs text-gray-400 font-medium">Games</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3" />
            <p className="text-sm text-gray-500">Loading providers...</p>
          </div>
        ) : lobbyProviders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Gamepad2 size={40} className="mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">No providers found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Provider</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Selected Games</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Display Order</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedProviders.map((provider, idx) => {
                const selected = provider.games.filter((g) => g.isSelected);
                return (
                  <tr key={`${provider.providerName}-${idx}`} className={`hover:bg-gray-50 transition ${!provider.isActive ? "opacity-60" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {provider.providerName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{provider.providerName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {selected.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">None</span>
                        ) : (
                          <>
                            {selected.slice(0, 2).map((g) => (
                              <span key={g.game_id} className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                                {g.game_name}
                              </span>
                            ))}
                            {selected.length > 2 && (
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                                +{selected.length - 2}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{selected.length} / {provider.totalGames || provider.games.length} games</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{provider.displayOrder ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${provider.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {provider.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleLobbyProvider(provider.providerName, provider.isActive)}
                          title={provider.isActive ? "Deactivate" : "Activate"}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                        >
                          {provider.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleEditLobbyProvider(provider)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleResetLobbyProvider(provider.providerName)}
                          className="p-2 rounded-lg text-orange-500 hover:bg-orange-50 transition"
                          title="Reset lobby games"
                        >
                          <RotateCcw size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => fetchProvidersWithGames(page - 1)} disabled={page === 1} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">Previous</button>
            <button onClick={() => fetchProvidersWithGames(page + 1)} disabled={page === totalPages} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">Next</button>
          </div>
        </div>
      )}

      {showModal && (
        <LobbyModal
          provider={selectedProvider}
          selectedGames={selectedGames}
          displayOrders={displayOrders}
          providerDisplayOrder={providerDisplayOrder}
          onToggleGame={handleToggleGameSelection}
          onChangeDisplayOrder={(gameId, order) => setDisplayOrders((prev) => ({ ...prev, [gameId]: order }))}
          onChangeProviderDisplayOrder={setProviderDisplayOrder}
          onSave={handleSaveLobbyProvider}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

const LobbyModal = ({
  provider, selectedGames, displayOrders, providerDisplayOrder,
  onToggleGame, onChangeDisplayOrder, onChangeProviderDisplayOrder, onSave, onClose,
}) => {
  const [gameSearch, setGameSearch] = useState("");

  const selectedGamesList = provider.games.filter((g) => selectedGames[g.game_id]);
  const unselectedGames = provider.games.filter((g) => !selectedGames[g.game_id] && g.game_name?.toLowerCase().includes(gameSearch.toLowerCase()));
  const filteredSelected = selectedGamesList.filter((g) => g.game_name?.toLowerCase().includes(gameSearch.toLowerCase()));
  const selectedCount = selectedGamesList.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {provider.providerName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">{provider.providerName}</h2>
              <p className="text-xs text-gray-400">{provider.totalGames || provider.games.length} total games &bull; <span className="text-blue-600 font-semibold">{selectedCount} selected</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Display Order */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Display Order</label>
            <input
              type="number"
              value={providerDisplayOrder}
              onChange={(e) => onChangeProviderDisplayOrder(Number(e.target.value))}
              className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400">Controls the position of this provider in the lobby</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search games..."
              value={gameSearch}
              onChange={(e) => setGameSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-2 gap-4">

            {/* Selected Games */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Selected Games</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{selectedCount}</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {filteredSelected.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs py-8">No games selected</p>
                ) : (
                  filteredSelected.map((game) => (
                    <div key={game.game_id} className="flex items-center gap-2 px-3 py-2.5 bg-blue-50/40 hover:bg-blue-50 transition group">
                      <button
                        onClick={() => onToggleGame(game.game_id)}
                        className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-500 flex items-center justify-center flex-shrink-0 hover:bg-blue-600 transition"
                      >
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{game.game_name}</p>
                        <p className="text-[10px] text-gray-400">{game.category}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] text-gray-400">Ord.</span>
                        <input
                          type="number"
                          value={displayOrders[game.game_id] || 0}
                          onChange={(e) => onChangeDisplayOrder(game.game_id, Number(e.target.value))}
                          className="w-12 px-1.5 py-0.5 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Available Games */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Available Games</span>
                <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{unselectedGames.length}</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {unselectedGames.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs py-8">All games selected</p>
                ) : (
                  unselectedGames.map((game) => (
                    <div
                      key={game.game_id}
                      onClick={() => onToggleGame(game.game_id)}
                      className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition group"
                    >
                      <div className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0 group-hover:border-blue-400 transition" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate group-hover:text-gray-900">{game.game_name}</p>
                        <p className="text-[10px] text-gray-400">{game.category}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
            Cancel
          </button>
          <button onClick={onSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyManagement;
