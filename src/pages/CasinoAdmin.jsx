import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import AdminHeader from "../components/AdminHeader";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToastContext } from "../App";
import { apiHelper } from "../utils/apiHelper";
import {
  Edit2,
  Trash2,
  RefreshCw,
  ImagePlus,
  X,
  Check,
  Home,
  Plus,
  Search,
  Gamepad2,
  ToggleLeft,
  ToggleRight,
  Image,
  Tag,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  Save,
  EyeOff,
  Eye,
} from "lucide-react";
import LobbyManagement from "./LobbyManagement";

const CasinoAdmin = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();

  const [activeTab, setActiveTab] = useState("games");

  // Games state
  const [games, setGames] = useState([]);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterProvider, setFilterProvider] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit game modal
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [formData, setFormData] = useState({
    game_name: "",
    provider_name: "",
    category: "",
    game_id: "",
    is_active: true,
  });

  // Banner state
  const [banners, setBanners] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerGameSearch, setBannerGameSearch] = useState("");
  const [bannerGames, setBannerGames] = useState([]);
  const [bannerGameLoading, setBannerGameLoading] = useState(false);
  const [bannerFilterProvider, setBannerFilterProvider] = useState("");
  const [editingBannerImg, setEditingBannerImg] = useState(null);
  const [bannerImgInput, setBannerImgInput] = useState("");
  const [bannerImgFile, setBannerImgFile] = useState(null);
  const [confirmRemoveBanner, setConfirmRemoveBanner] = useState(null);
  const [addBannerForm, setAddBannerForm] = useState({
    provider: "",
    game_id: "",
    displayOrder: 0,
    file: null,
    previewUrl: "",
  });
  const [addBannerLoading, setAddBannerLoading] = useState(false);

  // Super category state
  const [superCategories, setSuperCategories] = useState([]);
  const [superCatLoading, setSuperCatLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showSuperCatModal, setShowSuperCatModal] = useState(false);
  const [editingSuperCat, setEditingSuperCat] = useState(null);
  const [superCatForm, setSuperCatForm] = useState({
    name: "",
    categories: [],
    displayOrder: 0,
    file: null,
    previewUrl: "",
  });
  const [superCatSaving, setSuperCatSaving] = useState(false);
  const [confirmDeleteSuperCat, setConfirmDeleteSuperCat] = useState(null);

  // Super category strips state
  const [strips, setStrips] = useState([]);
  const [stripsLoading, setStripsLoading] = useState(false);
  const [showStripModal, setShowStripModal] = useState(false);
  const [editingStrip, setEditingStrip] = useState(null);
  const [stripForm, setStripForm] = useState({
    title: "",
    superCategorySlug: "",
    displayOrder: 0,
    gameIds: [],
  });
  const [stripSaving, setStripSaving] = useState(false);
  const [confirmDeleteStrip, setConfirmDeleteStrip] = useState(null);
  const [stripGames, setStripGames] = useState([]);
  const [stripGameLoading, setStripGameLoading] = useState(false);
  const [selectedStripGames, setSelectedStripGames] = useState([]);

  // Home providers state
  const [homeProviders, setHomeProviders] = useState([]);
  const [homeProviderLoading, setHomeProviderLoading] = useState(false);
  const [savingProviders, setSavingProviders] = useState(false);
  const [selectedHomeProviders, setSelectedHomeProviders] = useState([]);
  const [confirmRemoveProvider, setConfirmRemoveProvider] = useState(null);
  const [addProviderName, setAddProviderName] = useState("");
  const [addingProvider, setAddingProvider] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    navigate("/suprime/super-admin", { replace: true });
  };

  const handleNavigation = (tab) => {
    const routes = {
      dashboard: "/dashboard",
      games: "/games",
      casino: "/casino-admin",
    };
    if (routes[tab]) navigate(routes[tab]);
  };

  const fetchAllGames = async (pageNum = 1) => {
    setLoading(true);
    try {
      // Try to fetch all games including inactive ones
      const response = await apiHelper.get(
        `/game/games/getAllGames?page=${pageNum}&pageSize=20&includeInactive=true&showAll=true`,
      );
      const gamesData = response?.data?.data || response?.data?.games || [];
      setGames(gamesData);


      setTotalPages(Math.ceil((response?.data?.pagination?.total || response?.data?.count || response?.data?.total || 0) / 20));

      setPage(pageNum);

      // Show success message with count breakdown
      const activeCount = gamesData.filter(
        (g) => g.is_active ?? g.isActive,
      ).length;
      const inactiveCount = gamesData.length - activeCount;
      toast.success(
        `Loaded ${gamesData.length} games (${activeCount} active, ${inactiveCount} inactive)`,
      );
    } catch (error) {
      console.error("Failed to fetch all games:", error);
      toast.error(
        "Failed to load all games. Try using provider/category filters instead.",
      );
      // Fallback to regular fetch if getAllGames doesn't exist
      setGames([]);
      setTotalPages(1);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async (pageNum = 1) => {
    setLoading(true);
    try {
      let response;
      if (filterProvider) {
        response = await apiHelper.post("/game/games/admin/games-by-provider", {
          provider_name: filterProvider,
          page: pageNum,
          pageSize: 20,
        });
      } else if (filterCategory) {
        response = await apiHelper.post("/game/games/by-category", {
          category: filterCategory,
          page: pageNum,
          pageSize: 20,
          includeInactive: true,
          showAll: true, // Add this to ensure inactive games are included

        });
      } else {
        setGames([]);
        setTotalPages(1);
        setPage(1);
        setLoading(false);
        return;
      }
      setGames(response?.data?.data || []);
      setTotalPages(Math.ceil((response?.data?.pagination?.total || response?.data?.count || 0) / 20));
      setPage(pageNum);
    } catch (error) {
      toast.error(error?.message || "Failed to fetch games");
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await apiHelper.get("/game/games/unique-providers");
      setProviders(response?.data?.providers || response?.providers || []);
    } catch {}
  };

  const fetchCategories = async () => {
    try {
      const response = await apiHelper.get("/game/games/unique-categories");
      setCategories(response?.data?.categories || response?.categories || []);
    } catch {}
  };

  useEffect(() => {
    if (activeTab === "games") {
      fetchProviders();
      fetchCategories();
      fetchBanners();
      fetchHomeProviders();
    }
    if (activeTab === "categories") {
      fetchSuperCategories();
      fetchAvailableCategories();
    }
    if (activeTab === "strips") {
      fetchStrips();
      fetchSuperCategories();
    }
    if (activeTab === "sub-providers") {
      fetchSubProviders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "games") {
      setPage(1);
      fetchGames(1);
    }
  }, [filterProvider, filterCategory, filterStatus]);

  const fetchBanners = async () => {
    setBannerLoading(true);
    try {
      const res = await apiHelper.get(
        "/game/games/featured/getHeroBannerGames",
      );
      setBanners(res?.data?.games || []);
    } catch (e) {
      toast.error(e?.message || "Failed to fetch banners");
    } finally {
      setBannerLoading(false);
    }
  };

  const fetchBannerGames = async (providerName) => {
    if (!providerName) return;
    setBannerGameLoading(true);
    try {
      const res = await apiHelper.post("/game/games/by-provider", {
        provider_name: providerName,
        page: 1,
        pageSize: 50,
      });
      setBannerGames(res?.data?.data || []);
    } catch (e) {
      toast.error(e?.message || "Failed to fetch games");
    } finally {
      setBannerGameLoading(false);
    }
  };

  const handleAddBannerGame = async () => {
    if (!addBannerForm.game_id.trim()) {
      toast.error("Game ID is required");
      return;
    }
    setAddBannerLoading(true);
    try {
      const formData = new FormData();
      formData.append(
        "games",
        JSON.stringify([
          {
            game_id: addBannerForm.game_id.trim(),
            displayOrder: addBannerForm.displayOrder,
          },
        ]),
      );
      if (addBannerForm.file)
        formData.append("banner_thumbnail", addBannerForm.file);
      const res = await apiHelper.postFormData(
        "/game/games/featured/setHeroBannerGames",
        formData,
      );
      toast.success(res?.data?.message || "Banner added successfully!");
      setShowBannerModal(false);
      setAddBannerForm({
        provider: "",
        game_id: "",
        displayOrder: 0,
        file: null,
        previewUrl: "",
      });
      fetchBanners();
    } catch (e) {
      toast.error(e?.message || "Failed to add banner");
    } finally {
      setAddBannerLoading(false);
    }
  };

  const handleRemoveBannerGame = async (game_id) => {
    try {
      const res = await apiHelper.post(
        "/game/games/featured/removeHeroBannerGame",
        { game_id },
      );
      toast.success(res?.data?.message || res?.message);
      fetchBanners();
    } catch (e) {
      toast.error(e?.message || "Failed to remove banner game");
    }
  };

  const handleToggleBannerGame = async (game_id, isActive) => {
    try {
      const res = await apiHelper.post(
        "/game/games/featured/toggleHeroBannerGame",
        { game_id, isActive: !isActive },
      );
      toast.success(res?.data?.message || res?.message);
      setBanners((prev) =>
        prev.map((b) =>
          b.game_id === game_id ? { ...b, isActive: !isActive } : b,
        ),
      );
    } catch (e) {
      toast.error(e?.message || "Failed to toggle banner game");
    }
  };

  // ── Top Providers API ──
  const fetchHomeProviders = async () => {
    setHomeProviderLoading(true);
    try {
      const res = await apiHelper.get("/game/games/featured/getTopProviders");
      const list = res?.data?.providers || [];
      setHomeProviders(
        [...list].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
      );
    } catch (e) {
      toast.error(e?.message || "Failed to fetch top providers");
    } finally {
      setHomeProviderLoading(false);
    }
  };

  const handleAddTopProvider = async () => {
    if (!addProviderName.trim()) {
      toast.error("Provider name is required");
      return;
    }
    setAddingProvider(true);
    try {
      const res = await apiHelper.post("/game/games/featured/setTopProviders", {
        providers: [
          {
            providerName: addProviderName.trim(),
            displayOrder: homeProviders.length,
          },
        ],
      });
      toast.success(res?.data?.message || "Provider added!");
      setAddProviderName("");
      fetchHomeProviders();
    } catch (e) {
      toast.error(e?.message || "Failed to add provider");
    } finally {
      setAddingProvider(false);
    }
  };

  const handleUpdateProviderOrder = async (providerName, displayOrder) => {
    try {
      await apiHelper.post("/game/games/featured/updateTopProvider", {
        providerName,
        displayOrder,
      });
      setHomeProviders((prev) =>
        prev.map((p) =>
          p.providerName === providerName ? { ...p, displayOrder } : p,
        ),
      );
    } catch (e) {
      toast.error(e?.message || "Failed to update order");
    }
  };

  const handleSaveProviderOrder = async () => {
    setSavingProviders(true);
    try {
      await Promise.all(
        homeProviders.map((p, i) =>
          apiHelper.post("/game/games/featured/updateTopProvider", {
            providerName: p.providerName,
            displayOrder: i,
          }),
        ),
      );
      toast.success("Provider order saved!");
      fetchHomeProviders();
    } catch (e) {
      toast.error(e?.message || "Failed to save order");
    } finally {
      setSavingProviders(false);
    }
  };

  const handleRemoveHomeProvider = async (providerName) => {
    try {
      const res = await apiHelper.post(
        "/game/games/featured/removeTopProvider",
        { providerName },
      );
      toast.success(res?.data?.message || res?.message);
      setHomeProviders((prev) =>
        prev.filter((p) => p.providerName !== providerName),
      );
      setConfirmRemoveProvider(null);
    } catch (e) {
      toast.error(e?.message || "Failed to remove provider");
    }
  };

  // drag handlers
  const handleDragStart = (e, idx) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("dragIdx", idx);
  };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = (e, dropIdx) => {
    e.preventDefault();
    const dragIdx = Number(e.dataTransfer.getData("dragIdx"));
    if (dragIdx === dropIdx) {
      setDragOverIdx(null);
      return;
    }
    const sorted = [...homeProviders].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
    );
    const [moved] = sorted.splice(dragIdx, 1);
    sorted.splice(dropIdx, 0, moved);
    setHomeProviders(sorted.map((p, i) => ({ ...p, displayOrder: i })));
    setDragOverIdx(null);
  };

  const handleUpdateBannerOrder = async (game_id, displayOrder) => {
    try {
      await apiHelper.post("/game/games/featured/setHeroBannerGames", {
        games: [{ game_id, displayOrder }],
      });
      setBanners((prev) =>
        prev.map((b) => (b.game_id === game_id ? { ...b, displayOrder } : b)),
      );
    } catch (e) {
      toast.error(e?.message || "Failed to update order");
    }
  };

  const handleUpdateBannerImage = async (game_id) => {
    if (!bannerImgFile && !bannerImgInput.trim()) {
      toast.error("Please select an image or enter a URL");
      return;
    }
    try {
      const banner = banners.find((b) => b.game_id === game_id);
      const formData = new FormData();
      formData.append("game_id", game_id);
      formData.append("displayOrder", banner?.displayOrder || 0);
      formData.append("isActive", banner?.isActive ?? true);
      if (bannerImgFile) {
        formData.append("banner_thumbnail", bannerImgFile);
      }
      const res = await apiHelper.postFormData(
        "/game/games/featured/updateHeroBannerGame",
        formData,
      );
      const updatedBanner = res?.data || res;
      toast.success("Banner image updated successfully!");
      setBanners((prev) =>
        prev.map((b) =>
          b.game_id === game_id
            ? {
                ...b,
                banner_thumbnail:
                  updatedBanner?.banner_thumbnail || b.banner_thumbnail,
              }
            : b,
        ),
      );
      setEditingBannerImg(null);
      setBannerImgInput("");
      setBannerImgFile(null);
    } catch (e) {
      toast.error(e?.message || "Failed to update image");
    }
  };

  // ── Super Category API ──
  const fetchSuperCategories = async () => {
    setSuperCatLoading(true);
    try {
      const res = await apiHelper.get(
        "/game/games/super-category/getAllSuperCategories",
      );
      setSuperCategories(res?.data?.superCategories || []);
    } catch (e) {
      toast.error(e?.message || "Failed to fetch super categories");
    } finally {
      setSuperCatLoading(false);
    }
  };

  const fetchAvailableCategories = async () => {
    try {
      const res = await apiHelper.get(
        "/game/games/super-category/getAvailableCategories",
      );
      setAvailableCategories(res?.data?.categories || []);
    } catch {}
  };

  const handleSaveSuperCat = async () => {
    if (!superCatForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (superCatForm.categories.length === 0) {
      toast.error("Select at least one category");
      return;
    }
    setSuperCatSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", superCatForm.name.trim());
      fd.append("categories", JSON.stringify(superCatForm.categories));
      fd.append("displayOrder", superCatForm.displayOrder);
      if (superCatForm.file) fd.append("icon", superCatForm.file);
      if (editingSuperCat) {
        fd.append("slug", editingSuperCat.slug);
        await apiHelper.postFormData(
          "/game/games/super-category/updateSuperCategory",
          fd,
        );
        toast.success("Super category updated!");
      } else {
        await apiHelper.postFormData(
          "/game/games/super-category/createSuperCategory",
          fd,
        );
        toast.success("Super category created!");
      }
      setShowSuperCatModal(false);
      setEditingSuperCat(null);
      setSuperCatForm({
        name: "",
        categories: [],
        displayOrder: 0,
        file: null,
        previewUrl: "",
      });
      fetchSuperCategories();
      fetchAvailableCategories();
    } catch (e) {
      toast.error(e?.message || "Failed to save");
    } finally {
      setSuperCatSaving(false);
    }
  };

  const handleToggleSuperCat = async (slug, isActive) => {
    try {
      await apiHelper.post("/game/games/super-category/toggleSuperCategory", {
        slug,
        isActive: !isActive,
      });
      setSuperCategories((prev) =>
        prev.map((s) => (s.slug === slug ? { ...s, isActive: !isActive } : s)),
      );
    } catch (e) {
      toast.error(e?.message || "Failed to toggle");
    }
  };

  const handleDeleteSuperCat = async (slug) => {
    try {
      await apiHelper.post("/game/games/super-category/deleteSuperCategory", {
        slug,
      });
      toast.success("Super category deleted!");
      setSuperCategories((prev) => prev.filter((s) => s.slug !== slug));
      setConfirmDeleteSuperCat(null);
      fetchAvailableCategories();
    } catch (e) {
      toast.error(e?.message || "Failed to delete");
    }
  };

  const openEditSuperCat = (sc) => {
    setEditingSuperCat(sc);
    setSuperCatForm({
      name: sc.name,
      categories: sc.categories || [],
      displayOrder: sc.displayOrder || 0,
      file: null,
      previewUrl: sc.icon || "",
    });
    setShowSuperCatModal(true);
  };

  // ── Super Category Strips API ──
  const fetchStrips = async () => {
    setStripsLoading(true);
    try {
      const res = await apiHelper.get("/game/games/strips/all");
      setStrips(res?.data?.strips || []);
    } catch (e) {
      toast.error(e?.message || "Failed to fetch strips");
    } finally {
      setStripsLoading(false);
    }
  };

  const fetchStripGames = async (superCategorySlug) => {
    if (!superCategorySlug) {
      setStripGames([]);
      return;
    }
    setStripGameLoading(true);
    try {
      // Fetch games by super category
      const res = await apiHelper.post("/game/games/by-category", {
        category: superCategorySlug,
        page: 1,
        pageSize: 100, // Get more games for selection
      });

      // Handle the response structure with gamesByCategory
      const gamesByCategory = res?.data?.gamesByCategory || [];
      const allGames = gamesByCategory.flatMap((cat) => cat.games || []);
      setStripGames(allGames);
    } catch (e) {
      console.error("Failed to fetch super category games:", e);
      setStripGames([]);
    } finally {
      setStripGameLoading(false);
    }
  };

  const handleSaveStrip = async () => {
    if (!stripForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!stripForm.superCategorySlug) {
      toast.error("Super category is required");
      return;
    }
    if (selectedStripGames.length === 0) {
      toast.error("Select at least one game");
      return;
    }

    setStripSaving(true);
    try {
      const payload = {
        title: stripForm.title.trim(),
        superCategorySlug: stripForm.superCategorySlug,
        displayOrder: stripForm.displayOrder,
        gameIds: selectedStripGames.map((g) => g.game_id),
      };

      if (editingStrip) {
        payload.stripId = editingStrip._id;
        await apiHelper.post("/game/games/strips/update", payload);
        toast.success("Strip updated successfully!");
      } else {
        await apiHelper.post("/game/games/strips/create", payload);
        toast.success("Strip created successfully!");
      }

      setShowStripModal(false);
      setEditingStrip(null);
      setStripForm({
        title: "",
        superCategorySlug: "",
        displayOrder: 0,
        gameIds: [],
      });
      setSelectedStripGames([]);
      setStripGames([]);
      fetchStrips();
    } catch (e) {
      toast.error(e?.message || "Failed to save strip");
    } finally {
      setStripSaving(false);
    }
  };

  const handleToggleStrip = async (stripId, isActive) => {
    try {
      await apiHelper.post("/game/games/strips/toggle", {
        stripId,
        isActive: !isActive,
      });
      setStrips((prev) =>
        prev.map((s) =>
          s._id === stripId ? { ...s, isActive: !isActive } : s,
        ),
      );
      toast.success(
        `Strip ${!isActive ? "activated" : "deactivated"} successfully!`,
      );
    } catch (e) {
      toast.error(e?.message || "Failed to toggle strip");
    }
  };

  const handleDeleteStrip = async (stripId) => {
    try {
      await apiHelper.post("/game/games/strips/delete", { stripId });
      toast.success("Strip deleted successfully!");
      setStrips((prev) => prev.filter((s) => s._id !== stripId));
      setConfirmDeleteStrip(null);
    } catch (e) {
      toast.error(e?.message || "Failed to delete strip");
    }
  };

  const openEditStrip = (strip) => {
    setEditingStrip(strip);
    setStripForm({
      title: strip.title,
      superCategorySlug: strip.superCategorySlug,
      displayOrder: strip.displayOrder || 0,
      gameIds: strip.games?.map((g) => g.game_id) || [],
    });
    setSelectedStripGames(strip.games || []);
    // Fetch games for the super category
    fetchStripGames(strip.superCategorySlug);
    setShowStripModal(true);
  };

  const handleToggleStatus = async (game) => {
    try {
      const res = await apiHelper.post("/game/games/toggleGameStatus", {
        game_id: game.game_id,
      });
      const msg = res?.data?.message || res?.message;
      if (msg) toast.success(msg);

      // Update the game status in the current list without removing it
      setGames((prev) =>
        prev.map((g) =>
          g.game_id === game.game_id
            ? {
                ...g,
                is_active: res?.data?.isActive ?? !g.is_active,
                isActive: res?.data?.isActive ?? !g.isActive,
              }
            : g,
        ),
      );

      // Don't refetch - keep the game visible in the list
    } catch (error) {
      toast.error(error?.message || "Failed to update game status");
    }
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setFormData({
      game_name: game.game_name,
      provider_name: game.provider_name,
      category: game.category,
      game_id: game.game_id,
      is_active: game.is_active !== false,
    });
    setShowModal(true);
  };

  const handleSaveGame = async () => {
    if (!formData.game_name || !formData.provider_name) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await apiHelper.put(
        `/game/games/updateGame/${editingGame._id}`,
        formData,
      );
      toast.success("Game updated successfully");
      setShowModal(false);
      fetchGames(page);
    } catch (error) {
      toast.error(error?.message || "Failed to save game");
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm("Are you sure you want to delete this game?")) return;
    try {
      await apiHelper.delete(`/game/games/deleteGame/${gameId}`);
      toast.success("Game deleted successfully");
      fetchGames(page);
    } catch (error) {
      toast.error(error?.message || "Failed to delete game");
    }
  };

  // Banner handlers
  const handleSaveBanner = (id) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, url: bannerInput } : b)),
    );
    setEditingBanner(null);
    setBannerInput("");
    toast.success("Banner updated");
  };

  const handleRemoveBanner = (id) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, url: "" } : b)),
    );
    toast.success("Banner removed");
  };

  // Home providers handlers
  const toggleHomeProvider = (provider) => {
    setHomeProviders((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider],
    );
  };

  // Sub-provider state
  const [subProviders, setSubProviders] = useState([]);
  const [subProviderLoading, setSubProviderLoading] = useState(false);
  const [toggleSubProviderLoading, setToggleSubProviderLoading] = useState(null);

  // Sub-provider API functions
  const fetchSubProviders = async () => {
    setSubProviderLoading(true);
    try {
      const response = await apiHelper.get("/game/games/admin/sub-providers");
      setSubProviders(response?.data?.subProviders || []);
    } catch (error) {
      toast.error(error?.message || "Failed to fetch sub-providers");
    } finally {
      setSubProviderLoading(false);
    }
  };

  const handleToggleSubProvider = async (subProviderName, isActive) => {
    setToggleSubProviderLoading(subProviderName);
    try {
      const response = await apiHelper.post("/game/games/admin/toggle-sub-provider", {
        sub_provider_name: subProviderName,
        isActive: !isActive
      });
      toast.success(response?.data?.message || "Sub-provider updated successfully");
      
      // Update local state
      setSubProviders(prev => 
        prev.map(sp => 
          sp.sub_provider_name === subProviderName 
            ? { ...sp, isFullyActive: !isActive, isFullyInactive: isActive }
            : sp
        )
      );
    } catch (error) {
      toast.error(error?.message || "Failed to toggle sub-provider");
    } finally {
      setToggleSubProviderLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab="casino"
        setActiveTab={handleNavigation}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:ml-64">
        <AdminHeader
          title="Casino Management"
          subtitle="Manage casino games, providers, and categories"
        />

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
            {[
              { key: "games", label: "Games", icon: Gamepad2 },
              { key: "lobby", label: "Lobby", icon: Layers },
              { key: "categories", label: "Categories", icon: Tag },
              { key: "strips", label: "Strips", icon: Layers },
              { key: "sub-providers", label: "Sub-Providers", icon: ToggleLeft },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === key
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* ── GAMES TAB ── */}
          {activeTab === "games" && (
            <div className="space-y-6">
              {/* Banner Management */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
                      <ImagePlus size={17} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        Hero Banner Games
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="text-green-600 font-semibold">
                          {banners.filter((b) => b.isActive).length} active
                        </span>
                        <span className="mx-1 text-gray-300">·</span>
                        {banners.length} total
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowBannerModal(true);
                      setAddBannerForm({
                        provider: "",
                        game_id: "",
                        displayOrder: banners.length,
                        file: null,
                        previewUrl: "",
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
                  >
                    <Plus size={14} /> Add Banner
                  </button>
                </div>

                {bannerLoading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Loading banners...</p>
                  </div>
                ) : banners.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <ImagePlus size={24} className="text-gray-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        No banner games yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "Add Game" to get started
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {banners
                        .sort(
                          (a, b) =>
                            (a.displayOrder || 0) - (b.displayOrder || 0),
                        )
                        .map((banner, i) => (
                          <div
                            key={banner._id || banner.game_id}
                            className={`group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
                              banner.isActive ? "" : "opacity-50 grayscale"
                            }`}
                            style={{ aspectRatio: "16/6" }}
                          >
                            {/* Background image */}
                            {banner.banner_thumbnail || banner.url_thumb ? (
                              <img
                                src={
                                  banner.banner_thumbnail || banner.url_thumb
                                }
                                alt={banner.game_name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-center">
                                <Gamepad2
                                  size={32}
                                  className="text-slate-500"
                                />
                              </div>
                            )}

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

                            {/* Top-right badges */}
                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest shadow ${
                                  banner.isActive
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-600 text-gray-200"
                                }`}
                              >
                                {banner.isActive ? "LIVE" : "OFF"}
                              </span>
                              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow">
                                {i + 1}
                              </span>
                            </div>

                            {/* Hover action buttons */}
                            <div className="absolute top-2.5 left-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowBannerModal(true);
                                  setAddBannerForm({
                                    provider: "",
                                    game_id: banner.game_id,
                                    displayOrder: banner.displayOrder || 0,
                                    file: null,
                                    previewUrl:
                                      banner.banner_thumbnail ||
                                      banner.url_thumb ||
                                      "",
                                  });
                                }}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold rounded-lg shadow transition"
                              >
                                <Image size={10} /> Change Image
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleBannerGame(
                                    banner.game_id,
                                    banner.isActive,
                                  );
                                }}
                                className={`flex items-center gap-1 px-2 py-1 text-white text-[10px] font-semibold rounded-lg shadow transition ${
                                  banner.isActive
                                    ? "bg-amber-500 hover:bg-amber-400"
                                    : "bg-green-600 hover:bg-green-500"
                                }`}
                              >
                                {banner.isActive ? (
                                  <EyeOff size={10} />
                                ) : (
                                  <Eye size={10} />
                                )}
                                {banner.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmRemoveBanner(banner);
                                }}
                                className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-400 text-white text-[10px] font-semibold rounded-lg shadow transition"
                              >
                                <Trash2 size={10} /> Remove
                              </button>
                            </div>

                            {/* Bottom info */}
                            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between">
                              <div className="min-w-0">
                                <p className="text-white text-sm font-bold truncate leading-tight drop-shadow">
                                  {banner.game_name}
                                </p>
                                <p className="text-white/50 text-[10px] truncate mt-0.5">
                                  {banner.provider_name}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                                <Tag size={9} className="text-white/40" />
                                <input
                                  type="number"
                                  value={banner.displayOrder || 0}
                                  onChange={(e) =>
                                    handleUpdateBannerOrder(
                                      banner.game_id,
                                      Number(e.target.value),
                                    )
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-10 px-1 py-0.5 bg-white/15 border border-white/20 rounded text-[10px] text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
                                />
                              </div>
                            </div>

                            {/* Inline image editor removed — handled by modal */}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Home Providers */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
                      <Home size={17} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        Home Providers
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="text-indigo-600 font-semibold">
                          {homeProviders.length} active
                        </span>
                        <span className="mx-1 text-gray-300">·</span>
                        drag to reorder
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveProviderOrder}
                    disabled={savingProviders}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                  >
                    {savingProviders ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={13} />
                    )}
                    Save Order
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Add provider input */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Layers
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <select
                        value={addProviderName}
                        onChange={(e) => setAddProviderName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 hover:bg-white transition"
                      >
                        <option value="">Select provider to add...</option>
                        {providers
                          .filter((p) => {
                            const name =
                              typeof p === "object"
                                ? p.provider_name || p.name
                                : p;
                            return !homeProviders.some(
                              (hp) => hp.providerName === name,
                            );
                          })
                          .map((p) => {
                            const name =
                              typeof p === "object"
                                ? p.provider_name || p.name
                                : p;
                            return (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                    <button
                      onClick={handleAddTopProvider}
                      disabled={addingProvider || !addProviderName}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm flex-shrink-0"
                    >
                      {addingProvider ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus size={13} />
                      )}
                      Add
                    </button>
                  </div>

                  {/* Provider list */}
                  {homeProviderLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : homeProviders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                        <Home size={20} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-400">
                        No providers added yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Select a provider above and click Add
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                        Drag to reorder · order reflects on user home page
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {homeProviders.map((provider, idx) => (
                          <div
                            key={provider.providerName}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragLeave={() => setDragOverIdx(null)}
                            className={`relative flex items-center gap-2 pl-3 pr-2 py-2.5 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all select-none ${
                              dragOverIdx === idx
                                ? "border-indigo-400 bg-indigo-50 shadow-lg scale-105"
                                : "border-gray-100 bg-white hover:border-indigo-300 hover:shadow-md shadow-sm"
                            }`}
                          >
                            {/* Order badge */}
                            <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0">
                              {idx + 1}
                            </span>

                            {/* Provider name */}
                            <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
                              {provider.providerName}
                            </span>

                            {/* Remove */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmRemoveProvider(provider);
                              }}
                              className="w-4 h-4 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-100 hover:text-red-500 transition flex-shrink-0"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Filter size={15} className="text-gray-400" />
                  <h4 className="text-sm font-bold text-gray-700">
                    Filter Games
                  </h4>               
                  <button
                    onClick={() => fetchAllGames(1)}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition shadow-sm"
                  >
                    <RefreshCw size={12} /> Load All Games
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <Layers
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={filterProvider}
                      onChange={(e) => {
                        setFilterProvider(e.target.value);
                        setFilterCategory("");
                      }}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                    >
                      <option value="">All Providers</option>
                      {providers.map((p) => {
                        const name =
                          typeof p === "object" ? p.provider_name || p.name : p;
                        return (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* <div className="relative">
                    <Tag
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={filterCategory}
                      onChange={(e) => {
                        setFilterCategory(e.target.value);
                        setFilterProvider("");
                      }}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => {
                        const name =
                          typeof c === "object"
                            ? c.category_name || c.category || c.name
                            : c;
                        return (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </div> */}

                  <div className="relative">
                    <ToggleLeft
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>
                </div>
               
              </div>

              {/* Games Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center shadow-sm">
                      <Gamepad2 size={17} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        Games Library
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {(() => {
                          const filteredGames = games.filter((game) => {
                            const isActive = game.is_active ?? game.isActive;
                            if (filterStatus === "active") return isActive;
                            if (filterStatus === "inactive") return !isActive;
                            return true;
                          });
                          const activeCount = games.filter(
                            (g) => g.is_active ?? g.isActive,
                          ).length;
                          const inactiveCount = games.length - activeCount;
                          return filteredGames.length > 0
                            ? `${filteredGames.length} games loaded • ${activeCount} active • ${inactiveCount} inactive`
                            : "Select a filter to load games";
                        })()}
                      </p>
                    </div>
                  </div>
                  {games.length > 0 && (
                    <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                      Page {page} / {totalPages}
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="p-16 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Loading games...</p>
                  </div>
                ) : !filterProvider && !filterCategory ? (
                  <div className="p-16 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <Filter size={28} className="text-blue-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-600">
                        No filter selected
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Select a provider or category above to load games
                      </p>
                    </div>
                  </div>
                ) : games.length === 0 ? (
                  <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <Gamepad2 size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-400">
                      No games found
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                              Game
                            </th>
                            <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                              Provider
                            </th>
                            <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {games
                            .filter((game) => {
                              const isActive = game.is_active ?? game.isActive;
                              if (filterStatus === "active") return isActive;
                              if (filterStatus === "inactive") return !isActive;
                              return true;
                            })
                            .map((game, idx) => {
                              const isActive = game.is_active ?? game.isActive;
                              return (
                                <tr
                                  key={`${game._id}-${idx}`}
                                  className={`hover:bg-blue-50/30 transition-colors ${
                                    !isActive
                                      ? "bg-red-50/50 border-l-4 border-red-400"
                                      : ""
                                  }`}
                                >
                                  <td className="px-6 py-3">
                                    <div className="flex items-center gap-3">
                                      {game.url_thumb ? (
                                        <img
                                          src={game.url_thumb}
                                          alt={game.game_name}
                                          className={`w-10 h-12 object-cover rounded-lg flex-shrink-0 border border-gray-100 shadow-sm ${
                                            !isActive
                                              ? "grayscale opacity-60"
                                              : ""
                                          }`}
                                        />
                                      ) : (
                                        <div
                                          className={`w-10 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 ${
                                            !isActive
                                              ? "grayscale opacity-60"
                                              : ""
                                          }`}
                                        >
                                          <Gamepad2
                                            size={16}
                                            className="text-gray-400"
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <p
                                            className={`text-sm font-semibold leading-tight ${
                                              !isActive
                                                ? "text-gray-500 line-through"
                                                : "text-gray-800"
                                            }`}
                                          >
                                            {game.game_name}
                                          </p>
                                          {!isActive && (
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                                              INACTIVE
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                                          {game.game_id}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-3">
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                                      {game.provider_name}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3">
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
                                      {game.category || "—"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleToggleStatus(game)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shadow-inner ${
                                          isActive
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                        }`}
                                      >
                                        <span
                                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                            isActive
                                              ? "translate-x-4"
                                              : "translate-x-1"
                                          }`}
                                        />
                                      </button>
                                      <span
                                        className={`text-xs font-semibold ${
                                          isActive
                                            ? "text-green-600"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {isActive ? "Active" : "Inactive"}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <span className="text-xs text-gray-500 font-medium">
                          Page{" "}
                          <span className="font-bold text-gray-700">
                            {page}
                          </span>{" "}
                          of{" "}
                          <span className="font-bold text-gray-700">
                            {totalPages}
                          </span>
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => fetchGames(page - 1)}
                            disabled={page === 1}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <ChevronLeft size={13} /> Prev
                          </button>
                          <button
                            onClick={() => fetchGames(page + 1)}
                            disabled={page === totalPages}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            Next <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── CATEGORIES TAB ── */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-violet-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center shadow-sm">
                      <Tag size={17} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        Super Categories
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="text-violet-600 font-semibold">
                          {superCategories.filter((s) => s.isActive).length}{" "}
                          active
                        </span>
                        <span className="mx-1 text-gray-300">·</span>
                        {superCategories.length} total
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSuperCat(null);
                      setSuperCatForm({
                        name: "",
                        categories: [],
                        displayOrder: superCategories.length,
                        file: null,
                        previewUrl: "",
                      });
                      setShowSuperCatModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition shadow-sm"
                  >
                    <Plus size={14} /> New Super Category
                  </button>
                </div>

                {superCatLoading ? (
                  <div className="p-12 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Loading...</p>
                  </div>
                ) : superCategories.length === 0 ? (
                  <div className="p-12 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <Tag size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-400">
                      No super categories yet
                    </p>
                    <p className="text-xs text-gray-400">
                      Click "New Super Category" to create one
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {superCategories.map((sc) => (
                      <div
                        key={sc.slug}
                        className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition ${!sc.isActive ? "opacity-50" : ""}`}
                      >
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                          {sc.icon ? (
                            <img
                              src={sc.icon}
                              alt={sc.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                              <Tag size={18} className="text-violet-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-gray-800">
                              {sc.name}
                            </p>
                            <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                              {sc.slug}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                sc.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {sc.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(sc.categories || []).map((cat) => (
                              <span
                                key={cat}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100 font-medium capitalize"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Order */}
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          #{sc.displayOrder}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() =>
                              handleToggleSuperCat(sc.slug, sc.isActive)
                            }
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              sc.isActive ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                sc.isActive ? "translate-x-4" : "translate-x-1"
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => openEditSuperCat(sc)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteSuperCat(sc)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STRIPS TAB ── */}
          {activeTab === "strips" && (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
                      <Layers size={17} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        Super Category Strips
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="text-emerald-600 font-semibold">
                          {strips.filter((s) => s.isActive).length} active
                        </span>
                        <span className="mx-1 text-gray-300">·</span>
                        {strips.length} total strips for home page
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingStrip(null);
                      setStripForm({
                        title: "",
                        superCategorySlug: "",
                        displayOrder: strips.length,
                        gameIds: [],
                      });
                      setSelectedStripGames([]);
                      setStripGames([]);
                      setShowStripModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm"
                  >
                    <Plus size={14} /> New Strip
                  </button>
                </div>

                {stripsLoading ? (
                  <div className="p-12 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Loading strips...</p>
                  </div>
                ) : strips.length === 0 ? (
                  <div className="p-12 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <Layers size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-400">
                      No strips created yet
                    </p>
                    <p className="text-xs text-gray-400">
                      Click "New Strip" to create your first strip
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {strips
                      .sort(
                        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
                      )
                      .map((strip) => (
                        <div
                          key={strip._id}
                          className={`flex items-start gap-4 px-6 py-5 hover:bg-gray-50 transition ${!strip.isActive ? "opacity-50" : ""}`}
                        >
                          {/* Strip Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-bold text-gray-800">
                                {strip.title}
                              </h4>
                              <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                #{strip.displayOrder}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  strip.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {strip.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>

                            {/* Super Category */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs text-gray-500">
                                Super Category:
                              </span>
                              <div className="flex items-center gap-1.5">
                                {strip.superCategory?.icon && (
                                  <img
                                    src={strip.superCategory.icon}
                                    alt={strip.superCategory.name}
                                    className="w-4 h-4 rounded object-cover"
                                  />
                                )}
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                  {strip.superCategory?.name ||
                                    strip.superCategorySlug}
                                </span>
                              </div>
                            </div>

                            {/* Games Preview */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {strip.games?.length || 0} games:
                              </span>
                              <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                                {(strip.games || [])
                                  .slice(0, 8)
                                  .map((game, idx) => (
                                    <div
                                      key={game.game_id}
                                      className="flex-shrink-0 relative group"
                                    >
                                      {game.url_thumb ? (
                                        <img
                                          src={game.url_thumb}
                                          alt={game.game_name}
                                          className="w-8 h-10 object-cover rounded border border-gray-200 shadow-sm"
                                          title={game.game_name}
                                        />
                                      ) : (
                                        <div
                                          className="w-8 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center"
                                          title={game.game_name}
                                        >
                                          <Gamepad2
                                            size={12}
                                            className="text-gray-400"
                                          />
                                        </div>
                                      )}
                                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                                        {idx + 1}
                                      </span>
                                    </div>
                                  ))}
                                {(strip.games?.length || 0) > 8 && (
                                  <div className="flex-shrink-0 w-8 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                    <span className="text-[8px] font-bold text-gray-500">
                                      +{(strip.games?.length || 0) - 8}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() =>
                                handleToggleStrip(strip._id, strip.isActive)
                              }
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                strip.isActive ? "bg-green-500" : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                  strip.isActive
                                    ? "translate-x-4"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => openEditStrip(strip)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteStrip(strip)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SUB-PROVIDERS TAB ── */}
          {activeTab === "sub-providers" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm">
                      <ToggleLeft size={17} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        Sub-Provider Management
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="text-orange-600 font-semibold">
                          {subProviders.filter(sp => !sp.isFullyInactive).length} active
                        </span>
                        <span className="mx-1 text-gray-300">·</span>
                        {subProviders.length} total sub-providers
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={fetchSubProviders}
                    disabled={subProviderLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 transition shadow-sm"
                  >
                    {subProviderLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    Refresh
                  </button>
                </div>

                {subProviderLoading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Loading sub-providers...</p>
                  </div>
                ) : subProviders.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <ToggleLeft size={24} className="text-gray-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        No sub-providers found
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Sub-providers will appear here when games are loaded
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            Sub-Provider
                          </th>
                          <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            Main Provider
                          </th>
                          <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            Games Count
                          </th>
                          <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {subProviders.map((subProvider) => (
                          <tr
                            key={subProvider.sub_provider_name}
                            className={`hover:bg-orange-50/30 transition-colors ${
                              subProvider.isFullyInactive
                                ? "bg-red-50/50 border-l-4 border-red-400"
                                : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
                                  <ToggleLeft size={16} className="text-orange-500" />
                                </div>
                                <div>
                                  <p className={`text-sm font-semibold leading-tight ${
                                    subProvider.isFullyInactive
                                      ? "text-gray-500 line-through"
                                      : "text-gray-800"
                                  }`}>
                                    {subProvider.sub_provider_name}
                                  </p>
                                  {subProvider.isFullyInactive && (
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
                                      ALL INACTIVE
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                                {subProvider.provider_name || "—"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-700">
                                      {subProvider.totalGames} total
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-green-600 font-medium">
                                      ✓ {subProvider.activeGames} active
                                    </span>
                                    <span className="text-xs text-red-500 font-medium">
                                      ✗ {subProvider.inactiveGames} inactive
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {subProvider.isFullyActive ? (
                                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                                    All Active
                                  </span>
                                ) : subProvider.isFullyInactive ? (
                                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                                    All Inactive
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                    Mixed
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleSubProvider(
                                    subProvider.sub_provider_name,
                                    !subProvider.isFullyInactive
                                  )}
                                  disabled={toggleSubProviderLoading === subProvider.sub_provider_name}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shadow-inner disabled:opacity-50 ${
                                    !subProvider.isFullyInactive
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                >
                                  {toggleSubProviderLoading === subProvider.sub_provider_name ? (
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                  ) : (
                                    <span
                                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                        !subProvider.isFullyInactive
                                          ? "translate-x-4"
                                          : "translate-x-1"
                                      }`}
                                    />
                                  )}
                                </button>
                                <span
                                  className={`text-xs font-semibold ${
                                    !subProvider.isFullyInactive
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {!subProvider.isFullyInactive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── LOBBY TAB ── */}
          {activeTab === "lobby" && <LobbyManagement />}
        </div>
      </div>

      {/* Add Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <ImagePlus size={15} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800">
                    {addBannerForm.game_id && !addBannerForm.provider
                      ? "Change Banner Image"
                      : "Add Banner"}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {addBannerForm.game_id && !addBannerForm.provider
                      ? "Upload a new image for this banner"
                      : "Select a game and upload a banner image"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBannerModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Banner Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Banner Image
                </label>
                <label
                  className={`relative flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed cursor-pointer transition overflow-hidden ${
                    addBannerForm.previewUrl
                      ? "border-blue-300 h-40"
                      : "border-gray-200 h-36 hover:border-blue-400 hover:bg-blue-50/30"
                  }`}
                >
                  {addBannerForm.previewUrl ? (
                    <>
                      <img
                        src={addBannerForm.previewUrl}
                        alt="preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1 opacity-0 hover:opacity-100 transition">
                        <ImagePlus size={20} className="text-white" />
                        <span className="text-white text-xs font-semibold">
                          Change Image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <ImagePlus size={22} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500">
                        Click to upload banner image
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG, WEBP recommended
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file)
                        setAddBannerForm((prev) => ({
                          ...prev,
                          file,
                          previewUrl: URL.createObjectURL(file),
                        }));
                    }}
                  />
                </label>
                {addBannerForm.file && (
                  <p className="text-xs text-green-600 font-medium mt-1.5 flex items-center gap-1">
                    <Check size={11} /> {addBannerForm.file.name}
                  </p>
                )}
              </div>

              {/* Provider + Game + Order — only shown when adding new banner */}
              {!(addBannerForm.game_id && !addBannerForm.provider) && (
                <>
                  {/* Provider select */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                      Provider <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Layers
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <select
                        value={addBannerForm.provider}
                        onChange={(e) => {
                          setAddBannerForm((prev) => ({
                            ...prev,
                            provider: e.target.value,
                            game_id: "",
                          }));
                          fetchBannerGames(e.target.value);
                        }}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition"
                      >
                        <option value="">Select provider</option>
                        {providers.map((p) => {
                          const name =
                            typeof p === "object"
                              ? p.provider_name || p.name
                              : p;
                          return (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Game select */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                      Game <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Gamepad2
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      {bannerGameLoading ? (
                        <div className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 flex items-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />{" "}
                          Loading games...
                        </div>
                      ) : (
                        <select
                          value={addBannerForm.game_id}
                          onChange={(e) =>
                            setAddBannerForm((prev) => ({
                              ...prev,
                              game_id: e.target.value,
                            }))
                          }
                          disabled={!addBannerForm.provider}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {addBannerForm.provider
                              ? "Select game"
                              : "Select provider first"}
                          </option>
                          {bannerGames.map((g) => (
                            <option
                              key={g.game_id}
                              value={g.game_id}
                              disabled={banners.some(
                                (b) => b.game_id === g.game_id,
                              )}
                            >
                              {g.game_name}
                              {banners.some((b) => b.game_id === g.game_id)
                                ? " (already added)"
                                : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                      Display Order
                    </label>
                    <div className="relative">
                      <Tag
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="number"
                        min="0"
                        value={addBannerForm.displayOrder}
                        onChange={(e) =>
                          setAddBannerForm((prev) => ({
                            ...prev,
                            displayOrder: Number(e.target.value),
                          }))
                        }
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowBannerModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // edit image mode — use updateHeroBannerGame
                  if (addBannerForm.game_id && !addBannerForm.provider) {
                    if (!addBannerForm.file) {
                      toast.error("Please select an image");
                      return;
                    }
                    setAddBannerLoading(true);
                    const fd = new FormData();
                    fd.append("game_id", addBannerForm.game_id);
                    fd.append("displayOrder", addBannerForm.displayOrder);
                    fd.append("isActive", true);
                    fd.append("banner_thumbnail", addBannerForm.file);
                    apiHelper
                      .postFormData(
                        "/game/games/featured/updateHeroBannerGame",
                        fd,
                      )
                      .then((res) => {
                        const updated = res?.data || res;
                        toast.success("Banner image updated!");
                        setBanners((prev) =>
                          prev.map((b) =>
                            b.game_id === addBannerForm.game_id
                              ? {
                                  ...b,
                                  banner_thumbnail:
                                    updated?.banner_thumbnail ||
                                    b.banner_thumbnail,
                                }
                              : b,
                          ),
                        );
                        setShowBannerModal(false);
                      })
                      .catch((e) =>
                        toast.error(e?.message || "Failed to update image"),
                      )
                      .finally(() => setAddBannerLoading(false));
                  } else {
                    handleAddBannerGame();
                  }
                }}
                disabled={addBannerLoading || !addBannerForm.game_id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              >
                {addBannerLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                    Saving...
                  </>
                ) : addBannerForm.game_id && !addBannerForm.provider ? (
                  <>
                    <Check size={14} /> Save Image
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Add Banner
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Remove Banner Modal */}
      {confirmRemoveBanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={16} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Remove Banner
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <div className="px-6 py-5">
              {(confirmRemoveBanner.banner_thumbnail ||
                confirmRemoveBanner.url_thumb) && (
                <img
                  src={
                    confirmRemoveBanner.banner_thumbnail ||
                    confirmRemoveBanner.url_thumb
                  }
                  alt={confirmRemoveBanner.game_name}
                  className="w-full h-24 object-cover rounded-xl mb-4 border border-gray-100"
                />
              )}
              <p className="text-sm text-gray-700">
                Are you sure you want to remove{" "}
                <span className="font-bold text-gray-900">
                  {confirmRemoveBanner.game_name}
                </span>{" "}
                from the hero banner?
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Users will no longer see this banner on the home page.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setConfirmRemoveBanner(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleRemoveBannerGame(confirmRemoveBanner.game_id);
                  setConfirmRemoveBanner(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition shadow-sm"
              >
                <Trash2 size={14} /> Remove Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Remove Provider Modal */}
      {confirmRemoveProvider && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={16} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Remove Provider
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  This will remove it from the home page
                </p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700">
                Are you sure you want to remove{" "}
                <span className="font-bold text-gray-900">
                  {confirmRemoveProvider.providerName}
                </span>{" "}
                from the home providers?
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Users will no longer see this provider on the home page.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setConfirmRemoveProvider(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleRemoveHomeProvider(confirmRemoveProvider.providerName)
                }
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition shadow-sm"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Category Modal */}
      {showSuperCatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                  <Tag size={14} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800">
                    {editingSuperCat
                      ? "Edit Super Category"
                      : "New Super Category"}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Group multiple raw categories into one
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSuperCatModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Icon upload */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Icon Image{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <label
                  className={`relative flex items-center justify-center w-full rounded-xl border-2 border-dashed cursor-pointer transition overflow-hidden h-24 ${
                    superCatForm.previewUrl
                      ? "border-violet-300"
                      : "border-gray-200 hover:border-violet-400 hover:bg-violet-50/30"
                  }`}
                >
                  {superCatForm.previewUrl ? (
                    <>
                      <img
                        src={superCatForm.previewUrl}
                        alt="preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <ImagePlus size={18} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <ImagePlus size={18} className="text-gray-300" />
                      <span className="text-xs">Click to upload icon</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file)
                        setSuperCatForm((prev) => ({
                          ...prev,
                          file,
                          previewUrl: URL.createObjectURL(file),
                        }));
                    }}
                  />
                </label>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={superCatForm.name}
                  onChange={(e) =>
                    setSuperCatForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Crash Games"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 hover:bg-white transition"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={superCatForm.displayOrder}
                  onChange={(e) =>
                    setSuperCatForm((prev) => ({
                      ...prev,
                      displayOrder: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 hover:bg-white transition"
                />
              </div>

              {/* Sub categories */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Sub Categories <span className="text-red-500">*</span>
                  <span className="ml-2 text-gray-400 font-normal normal-case">
                    {superCatForm.categories.length} selected
                  </span>
                </label>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Available raw categories — click to toggle
                  </div>
                  <div className="max-h-48 overflow-y-auto p-3 flex flex-wrap gap-2">
                    {availableCategories.length === 0 ? (
                      <p className="text-xs text-gray-400">
                        Loading categories...
                      </p>
                    ) : (
                      availableCategories.map(({ category, assignedTo }) => {
                        const isSelected =
                          superCatForm.categories.includes(category);
                        const isAssignedElsewhere =
                          assignedTo &&
                          assignedTo.superCategorySlug !==
                            editingSuperCat?.slug;
                        return (
                          <button
                            key={category}
                            onClick={() => {
                              if (isAssignedElsewhere) return;
                              setSuperCatForm((prev) => ({
                                ...prev,
                                categories: isSelected
                                  ? prev.categories.filter(
                                      (c) => c !== category,
                                    )
                                  : [...prev.categories, category],
                              }));
                            }}
                            title={
                              isAssignedElsewhere
                                ? `Already in "${assignedTo.superCategoryName}"`
                                : ""
                            }
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              isSelected
                                ? "bg-violet-600 text-white border-violet-600"
                                : isAssignedElsewhere
                                  ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-violet-400 hover:text-violet-600"
                            }`}
                          >
                            {isSelected && <Check size={10} />}
                            <span className="capitalize">{category}</span>
                            {isAssignedElsewhere && (
                              <span className="text-[9px] text-gray-400">
                                ({assignedTo.superCategoryName})
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
                {/* Selected preview */}
                {superCatForm.categories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {superCatForm.categories.map((cat) => (
                      <span
                        key={cat}
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 font-medium"
                      >
                        <span className="capitalize">{cat}</span>
                        <button
                          onClick={() =>
                            setSuperCatForm((prev) => ({
                              ...prev,
                              categories: prev.categories.filter(
                                (c) => c !== cat,
                              ),
                            }))
                          }
                        >
                          <X
                            size={9}
                            className="text-violet-400 hover:text-red-500"
                          />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6 flex-shrink-0">
              <button
                onClick={() => setShowSuperCatModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSuperCat}
                disabled={superCatSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition shadow-sm"
              >
                {superCatSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {editingSuperCat ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Super Category */}
      {confirmDeleteSuperCat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={16} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Delete Super Category
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  This cannot be undone
                </p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-bold text-gray-900">
                  {confirmDeleteSuperCat.name}
                </span>
                ?
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {(confirmDeleteSuperCat.categories || []).map((cat) => (
                  <span
                    key={cat}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setConfirmDeleteSuperCat(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSuperCat(confirmDeleteSuperCat.slug)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition shadow-sm"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strip Modal */}
      {showStripModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Layers size={14} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800">
                    {editingStrip ? "Edit Strip" : "New Strip"}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Create a strip of games for home page display
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStripModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Left: Strip Details */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                      Strip Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={stripForm.title}
                      onChange={(e) =>
                        setStripForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="e.g. Popular Crash Games"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 hover:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                      Super Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Tag
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <select
                        value={stripForm.superCategorySlug}
                        onChange={(e) => {
                          const newSlug = e.target.value;
                          setStripForm((prev) => ({
                            ...prev,
                            superCategorySlug: newSlug,
                          }));
                          // Clear selected games when changing super category
                          setSelectedStripGames([]);
                          // Fetch games for the new super category
                          fetchStripGames(newSlug);
                        }}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 hover:bg-white transition"
                      >
                        <option value="">Select super category</option>
                        {superCategories.map((sc) => (
                          <option key={sc.slug} value={sc.slug}>
                            {sc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stripForm.displayOrder}
                      onChange={(e) =>
                        setStripForm((prev) => ({
                          ...prev,
                          displayOrder: Number(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 hover:bg-white transition"
                    />
                  </div>

                  {/* Selected Games Preview */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                      Selected Games ({selectedStripGames.length}/5)
                    </label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      {selectedStripGames.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">
                          <Gamepad2
                            size={20}
                            className="mx-auto mb-2 text-gray-300"
                          />
                          <p className="text-xs">No games selected yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {selectedStripGames.map((game, idx) => (
                            <div
                              key={game.game_id}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50"
                            >
                              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {idx + 1}
                              </span>
                              {game.url_thumb ? (
                                <img
                                  src={game.url_thumb}
                                  alt={game.game_name}
                                  className="w-8 h-10 object-cover rounded border border-gray-200 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
                                  <Gamepad2
                                    size={12}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">
                                  {game.game_name}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">
                                  {game.provider_name}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setSelectedStripGames((prev) =>
                                    prev.filter(
                                      (g) => g.game_id !== game.game_id,
                                    ),
                                  )
                                }
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition flex-shrink-0"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Game Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                      Available Games (Max 5)
                      {stripForm.superCategorySlug && (
                        <span className="ml-2 text-emerald-600 font-normal normal-case">
                          from{" "}
                          {
                            superCategories.find(
                              (sc) => sc.slug === stripForm.superCategorySlug,
                            )?.name
                          }
                        </span>
                      )}
                    </label>
                  </div>

                  {/* Games List */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      {stripForm.superCategorySlug
                        ? "Games in Category"
                        : "Select Super Category First"}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {!stripForm.superCategorySlug ? (
                        <div className="p-6 text-center text-gray-400">
                          <Tag
                            size={20}
                            className="mx-auto mb-2 text-gray-300"
                          />
                          <p className="text-xs">
                            Please select a super category first
                          </p>
                        </div>
                      ) : stripGameLoading ? (
                        <div className="p-6 flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-gray-400">
                            Loading games...
                          </span>
                        </div>
                      ) : stripGames.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">
                          <Gamepad2
                            size={20}
                            className="mx-auto mb-2 text-gray-300"
                          />
                          <p className="text-xs">
                            No games found in this category
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {stripGames.map((game) => {
                            const isSelected = selectedStripGames.some(
                              (g) => g.game_id === game.game_id,
                            );
                            const canAdd = selectedStripGames.length < 5;
                            return (
                              <div
                                key={game.game_id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50"
                              >
                                {game.url_thumb ? (
                                  <img
                                    src={game.url_thumb}
                                    alt={game.game_name}
                                    className="w-8 h-10 object-cover rounded border border-gray-200 flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
                                    <Gamepad2
                                      size={12}
                                      className="text-gray-400"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 truncate">
                                    {game.game_name}
                                  </p>
                                  <p className="text-[10px] text-gray-400 truncate">
                                    {game.provider_name}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedStripGames((prev) =>
                                        prev.filter(
                                          (g) => g.game_id !== game.game_id,
                                        ),
                                      );
                                    } else if (canAdd) {
                                      setSelectedStripGames((prev) => [
                                        ...prev,
                                        game,
                                      ]);
                                    }
                                  }}
                                  disabled={!canAdd && !isSelected}
                                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition flex-shrink-0 ${
                                    isSelected
                                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                                      : canAdd
                                        ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  {isSelected ? (
                                    <>
                                      <X size={10} /> Remove
                                    </>
                                  ) : canAdd ? (
                                    <>
                                      <Plus size={10} /> Add
                                    </>
                                  ) : (
                                    "Max 5"
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6 flex-shrink-0 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setShowStripModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStrip}
                disabled={stripSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
              >
                {stripSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {editingStrip ? "Update Strip" : "Create Strip"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Strip Modal */}
      {confirmDeleteStrip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={16} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Delete Strip
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  This cannot be undone
                </p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-bold text-gray-900">
                  {confirmDeleteStrip.title}
                </span>
                ?
              </p>
              <p className="text-xs text-gray-400 mt-1">
                This strip will be removed from the home page.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setConfirmDeleteStrip(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStrip(confirmDeleteStrip._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition shadow-sm"
              >
                <Trash2 size={14} /> Delete Strip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Game Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                  <Edit2 size={14} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Edit Game</h2>
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">
                    {editingGame?.game_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  label: "Game Name",
                  key: "game_name",
                  placeholder: "Enter game name",
                  required: true,
                },
                {
                  label: "Provider",
                  key: "provider_name",
                  placeholder: "Enter provider name",
                  required: true,
                },
                {
                  label: "Category",
                  key: "category",
                  placeholder: "Enter category",
                },
                {
                  label: "Game ID",
                  key: "game_id",
                  placeholder: "Enter game ID",
                },
              ].map(({ label, key, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    {label}{" "}
                    {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={formData[key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div
                  onClick={() =>
                    setFormData({ ...formData, is_active: !formData.is_active })
                  }
                  className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${
                    formData.is_active ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      formData.is_active ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {formData.is_active ? "Active" : "Inactive"}
                </span>
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${
                    formData.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {formData.is_active
                    ? "Visible to users"
                    : "Hidden from users"}
                </span>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGame}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
              >
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasinoAdmin;
