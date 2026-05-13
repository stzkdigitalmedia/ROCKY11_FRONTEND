import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Tv2,
  Dices,
  Spade,
  Trophy,
  Zap,
  Fish,
  Gamepad2,
  Ticket,
  Monitor,
  RotateCcw,
  Flame,
  Star,
  Crown,
  Swords,
  CircleDot,
  Layers,
  Grid2x2,
  Joystick,
  Coins,
  X,
  Maximize2,
  RotateCcw as RefreshIcon,
  ArrowLeft,
  Plane,
  Film,
  Gem,
  Globe,
  Sparkles,
  Target,
  Rocket,
  Shuffle,
  Clover,
  Wallet2,
} from "lucide-react";
import BottomNavigation from "../components/BottomNavigation";
import LanguageSelector from "../components/LanguageSelector";
import WhatsAppButton from "../components/WhatsAppButton";
import { useAuth } from "../hooks/useAuth";
import { apiHelper, subscribeToLoading } from "../utils/apiHelper";
import aviatorImg from "/aviator.svg";
// import auraImg from "/aura.svg";
// import awcImg from "/awc.svg";
import betcoreImg from "/betcore.svg";
import betgamesImg from "/betgames.svg";
import ezugiImg from "/ezugi.svg";
import crash88 from "/crash88.svg";
import crashslot from "/crashslot.gif";
import creedImg from "/creed.svg";
import darwinImg from "/darwin.svg";
import drgs from "/drgs.png";
import Mac88 from "/Mac88.svg"
// import dcbetImg from "/dcbet.svg";
// import fantacyhubImg from "/fantacyhub.svg";
// import fiesta777Img from "/fiesta777.svg";
import jacktop from "/jacktop.svg";
import randora from "/randora.png";
import jiliImg from "/jili.svg";
import kingmidasImg from "/kingmidas.svg";
// import llgImg from "/llg.svg";
import macaw from "/macaw.png";
// import suno from "/suno.svg";
// import tc from "/tc.svg";
// import pinky from "/pinky.svg";
import turbo from "/turbo.svg";
// import qtech from "/qtech.svg";
// import popok from "/popok.svg";
// import retro from "/retro.svg";
import rg from "/rg.svg";
import rich88 from "/rich88.webp";
// import sa from "/sa.svg";
import spribe from "/spribe.svg";

const PAGE_SIZE = 20;
let categoriesFetching = false;

const PROVIDER_IMAGES = {
  aviator: aviatorImg,
  // aura: auraImg,
  // awc: awcImg,
  betcore: betcoreImg,
  crashslot:crashslot,
  crash88:crash88,
  drgs: drgs,
  betgames: betgamesImg,
  ezugi: ezugiImg,
  creed: creedImg,
  randora:randora,
  darwin: darwinImg,
  jacktop:jacktop,
  mac88: Mac88,

  // dcbet: dcbetImg,
  // fantacyhub: fantacyhubImg,
  // fantacy: fantacyhubImg,
  // fiesta777: fiesta777Img,
  // fiesta: fiesta777Img,
  jili: jiliImg,
  kingmidas: kingmidasImg,
  // llg: llgImg,
  macaw: macaw,
  // pinky: pinky,
  turbo: turbo,
  // qtech: qtech,
  // retro: retro,
  rg: rg,
  rich88: rich88,
  // sa: sa,
  spribe: spribe,
  // suno: suno,
  // tc: tc,
  // popok: popok,
};
const PROVIDER_ICONS = {
  spribe: Target,
  evolution: Film,
  pragmatic: Gem,
  "pragmatic play": Gem,
  netent: Globe,
  playtech: Joystick,
  microgaming: Dices,
  habanero: Flame,
  pgsoft: Sparkles,
  "pg soft": Sparkles,
  yggdrasil: Star,
  quickspin: Zap,
  nolimit: Flame,
  "nolimit city": Flame,
  relax: Star,
  "relax gaming": Star,
  hacksaw: Zap,
  push: Rocket,
  "push gaming": Rocket,
  betsoft: Spade,
  booongo: Crown,
  kagaming: Trophy,
  "ka gaming": Trophy,
  playson: Gamepad2,
  spinomenal: Shuffle,
  bgaming: Gamepad2,
  onlyplay: Dices,
  wazdan: Star,
  thunderkick: Zap,
  elk: Trophy,
  "elk studios": Trophy,
  blueprint: Grid2x2,
  redtiger: Crown,
  "red tiger": Crown,
  isoftbet: Monitor,
  ezugi: CircleDot,
  vivo: Tv2,
  "vivo gaming": Tv2,
  superspade: Spade,
  "super spade": Spade,
  jili: Sparkles,
  cq9: Target,
  fachai: Clover,
  joker: Spade,
  spadegaming: Spade,
  "spade gaming": Spade,
  aviator: Plane,
  mac88: Dices,
  "mac 88": Dices,
  rich88: Wallet2,
  jacktop: Crown,
  jackpot: Crown,
};
const getProviderDisplay = (name) => ({
  img: PROVIDER_IMAGES[name?.toLowerCase()] || null,
  IconComponent: PROVIDER_ICONS[name?.toLowerCase()] || Gamepad2,
});

const CATEGORY_ICONS = {
  "live casino": Tv2,
  live: Tv2,
  slots: Dices,
  slot: Dices,
  "table games": Spade,
  "card games": Spade,
  card: Spade,
  baccarat: Crown,
  blackjack: Spade,
  poker: Spade,
  roulette: CircleDot,
  crash: Zap,
  sports: Trophy,
  fishing: Fish,
  arcade: Joystick,
  lottery: Ticket,
  instant: Zap,
  virtual: Monitor,
  dice: Dices,
  indian: Star,
  "teen patti": Spade,
  "andar bahar": Spade,
  aviator: Zap,
  casino: Dices,
  game: Gamepad2,
  spin: RotateCcw,
  wheel: CircleDot,
  bet: Coins,
  win: Trophy,
  jackpot: Crown,
  bonus: Star,
  mega: Star,
  super: Star,
  royal: Crown,
  fire: Flame,
  classic: Grid2x2,
  bingo: Grid2x2,
  shooting: Swords,
  table: Layers,
};
const getCategoryIcon = (label) => {
  const lower = label?.toLowerCase() || "";
  if (CATEGORY_ICONS[lower]) return CATEGORY_ICONS[lower];
  for (const [key, Icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key) || key.includes(lower)) return Icon;
  }
  return Gamepad2;
};

const CatIcon = ({ name, size = 14, className = "" }) => {
  const Icon = getCategoryIcon(name);
  return <Icon size={size} className={className} />;
};

const ProviderImg = ({ src, name, IconComponent, isActive }) => {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <span
        className="text-[11px] font-semibold whitespace-nowrap flex items-center gap-1.5 px-2"
        style={{ color: isActive ? "#fff" : "#fff" }}
      >
        {IconComponent && <IconComponent size={14} />}
        {name}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      className="w-full h-full object-contain p-1.5 rounded-lg transition-all duration-200 group-hover:brightness-0 group-hover:invert"
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        filter: isActive ? 'brightness(0) invert(1)' : 'none'
      }}
    />
  );
};

const Casino = () => {
  const { user } = useAuth(true);
  const [searchParams] = useSearchParams();
  const [userAnnouncement, setUserAnnouncement] = useState("");
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const [allLoading, setAllLoading] = useState(false);
  const [catGames, setCatGames] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPagesCount, setTotalPagesCount] = useState(1);
  const [providerGames, setProviderGames] = useState([]);
  const [providerLoading, setProviderLoading] = useState(false);
  const [providerPage, setProviderPage] = useState(1);
  const [providerTotal, setProviderTotal] = useState(0);
  const providerCache = useRef({});
  const [launchingGameId, setLaunchingGameId] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [gameUrl, setGameUrl] = useState(null);
  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [activeProvider, setActiveProvider] = useState(null);
  const catCache = useRef({});
  const [lobbyGames, setLobbyGames] = useState([]);
  const [superCategories, setSuperCategories] = useState([]);
  const [activeSuperCat, setActiveSuperCat] = useState(null);
  // superCatSections: [{ category, games, count, page, loading }, ...]
  const [superCatSections, setSuperCatSections] = useState([]);
  const [superCatLoading, setSuperCatLoading] = useState(false);
  const superCatCache = useRef({});

  // Iframe game state
  const [gameIframe, setGameIframe] = useState(null);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const iframeRef = useRef(null);

  // Handle ?category= query param from dashboard strips
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (!categoryParam) return;
    // Try matching against superCategories first, then raw categories
    const scMatch = superCategories.find(
      (sc) => sc.name?.toLowerCase() === categoryParam.toLowerCase()
    );
    if (scMatch) {
      handleSuperCatClick(scMatch);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Fall back to raw category tab
    if (categories.length > 0) {
      const rawMatch = categories.find(
        (c) => (c.name || c.category || c)?.toLowerCase() === categoryParam.toLowerCase()
      );
      const tabName = rawMatch ? (rawMatch.name || rawMatch.category || rawMatch) : categoryParam;
      handleTabChange(tabName);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [superCategories, categories]);

  ////marqueee//
  useEffect(() => {
    const providerParam = searchParams.get("provider");
    if (providerParam && providers.length > 0) {
      const match = providers.find(
        (p) => (p.provider_name || p.name || p).toLowerCase() === providerParam.toLowerCase()
      );
      const name = match ? (match.provider_name || match.name || match) : providerParam;
      setActiveProvider(name);
      setActiveTab("");
      setActiveSuperCat(null);
      setSuperCatSections([]);
      fetchProviderGames(name, 1);
      // Scroll to top so user sees the provider strip + games immediately
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Scroll the provider button into view in the strip
      setTimeout(() => {
        const btn = document.getElementById(`provider-btn-${name}`);
        if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }, 400);
    }
  }, [providers]);

  ////marqueee//
  useEffect(() => {
    // Subscribe to API loading states
    const unsubscribe = subscribeToLoading((isLoading, requests) => {
      setApiLoading(isLoading);
      const gameLaunchRequest = requests.find((req) =>
        req.includes("/game/games/launch"),
      );
      if (!gameLaunchRequest && launchingGameId) {
        setLaunchingGameId(null);
      }
    });

    // Reset loading when user comes back from game
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setLaunchingGameId(null);
      }
    };

    // Prevent refresh when game is open
    const handleBeforeUnload = (e) => {
      if (isGameOpen) {
        e.preventDefault();
        e.returnValue =
          "Game is currently running. Are you sure you want to leave?";
        return "Game is currently running. Are you sure you want to leave?";
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    apiHelper
      .get("/announcement/getAnnouncement")
      .then((res) =>
        setUserAnnouncement(
          res?.data?.userAnnouncement || res?.userAnnouncement || "",
        ),
      )
      .catch(() => {});
    fetchCategories();
    fetchProviders();
    fetchLobbyGames();
    fetchSuperCategories();

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isGameOpen]);

  const fetchSuperCategories = async () => {
    try {
      const res = await apiHelper.get("/game/games/unique-categories");
      console.log("Categories response:", res?.data);

      const superCats = res?.data?.superCategories || [];
      const rawCats = res?.data?.rawCategories || [];

      setSuperCategories(superCats);

      // Combine super categories and raw categories for the category strip
      const allCategories = [...superCats, ...rawCats];
      setCategories(allCategories);

      console.log("Super categories:", superCats);
      console.log("Raw categories:", rawCats);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchSuperCatSection = async (category, pageNum = 1) => {
    const cacheKey = `sc_${category}_${pageNum}`;
    if (superCatCache.current[cacheKey]) return superCatCache.current[cacheKey];
    const res = await apiHelper
      .post("/game/games/by-category", {
        category,
        page: pageNum,
        pageSize: PAGE_SIZE,
      })
      .catch(() => null);
    const result = {
      games: res?.data?.data || [],
      count: res?.data?.count || 0,
    };
    superCatCache.current[cacheKey] = result;
    return result;
  };

  const handleSuperCatClick = async (sc) => {
    console.log("Super category clicked:", sc);
    setActiveSuperCat(sc);
    setActiveProvider(null);
    setActiveTab("");
    setSearch("");
    setSuperCatSections([]);
    setSuperCatLoading(true);

    try {
      // Call by-category API directly with the super category name/slug
      console.log("Calling by-category API for super category:", sc.name);

      const res = await apiHelper.post("/game/games/by-category", {
        category: sc.name, // or sc.slug if needed
        page: 1,
        pageSize: PAGE_SIZE,
      });

      console.log("Super category games response:", res?.data);

      // Handle the new response structure with gamesByCategory
      const gamesByCategory = res?.data?.gamesByCategory || [];
      const superCategory = res?.data?.superCategory || sc;

      console.log("Games by category:", gamesByCategory);

      // Create sections for each category in the response
      const sections = gamesByCategory.map((categoryData) => ({
        category: categoryData.category,
        games: categoryData.games || [],
        count: categoryData.total || 0,
        page: 1,
        loaded: true,
      }));

      console.log("Created sections:", sections);
      setSuperCatSections(sections);
    } catch (error) {
      console.error("Error in handleSuperCatClick:", error);
      // If no games found, show empty state
      setSuperCatSections([]);
    } finally {
      setSuperCatLoading(false);
    }
  };

  const loadMoreSection = async (cat, pageNum) => {
    const { games, count } = await fetchSuperCatSection(cat, pageNum);
    setSuperCatSections((prev) =>
      prev.map((s) =>
        s.category === cat ? { ...s, games, count, page: pageNum } : s,
      ),
    );
  };

  const fetchLobbyGames = async () => {
    try {
      const res = await apiHelper.get("/game/games/getLobbyGames");
      const providersList = res?.data?.providers || [];
      const games = providersList
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .flatMap((p) =>
          p.games
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map((g) => ({ ...g, provider_name: p.providerName })),
        );
      setLobbyGames(games);
    } catch (e) {
      console.error("Failed to fetch lobby games:", e);
    }
  };

  const fetchProviders = async () => {
    setProvidersLoading(true);
    const cached = sessionStorage.getItem("casino_providers_v6");
    if (cached) {
      try {
        const cachedProviders = JSON.parse(cached);
        setProviders(cachedProviders);
        setProvidersLoading(false);
        return;
      } catch {}
    }
    try {
      console.log('🔍 Fetching providers from unique-providers API...');
      
      // Use the direct unique-providers API endpoint
      const res = await apiHelper.get("/game/games/unique-providers");
      console.log('📋 Unique-providers API response:', res?.data);
      
      // Extract providers from response
      const providersData = res?.data?.providers || res?.providers || res?.data || [];
      console.log('📊 Raw providers data:', providersData);
      
      if (!Array.isArray(providersData)) {
        console.log('⚠️ Providers data is not an array:', typeof providersData);
        setProviders([]);
        return;
      }
      
      // Process providers - simple approach
      const processedProviders = providersData.map((provider, index) => {
        const providerName = typeof provider === 'string' ? provider : (provider.provider_name || provider.name || provider);
        
        return {
          provider_name: providerName,
          name: providerName,
          logo: typeof provider === 'object' ? (provider.logo || provider.image || provider.icon || provider.thumbnail) : null,
          icon: typeof provider === 'object' ? (provider.emoji || provider.icon_emoji) : '🎮',
          displayOrder: typeof provider === 'object' ? (provider.displayOrder || provider.order) : index,
          gameCount: typeof provider === 'object' ? (provider.gameCount || provider.count) : 0,
          ...provider // Keep all original data if it's an object
        };
      });
      
      // Sort by display order or alphabetically
      processedProviders.sort((a, b) => {
        if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
          return (a.displayOrder || 999) - (b.displayOrder || 999);
        }
        return a.name.localeCompare(b.name);
      });
      
      console.log('📊 Processed providers:', processedProviders.length);
      console.log('📋 Provider names:', processedProviders.map(p => p.name));
      
      setProviders(processedProviders);
      sessionStorage.setItem("casino_providers_v6", JSON.stringify(processedProviders));
      
    } catch (e) {
      console.error('❌ Failed to fetch providers from unique-providers API:', e);
      setProviders([]);
    } finally {
      setProvidersLoading(false);
    }
  };

  //category api//
  const fetchCategories = async () => {
    if (categoriesFetching) return;
    const cached = sessionStorage.getItem("casino_categories");
    if (cached) {
      try {
        setCategories(JSON.parse(cached));
        return;
      } catch {}
    }
    categoriesFetching = true;
    try {
      const res = await apiHelper.get("/game/games/unique-categories");
      const cats = res?.data?.categories || res?.categories || res?.data || [];
      const list = Array.isArray(cats) ? cats : [];
      setCategories(list);
      sessionStorage.setItem("casino_categories", JSON.stringify(list));
    } catch (e) {
      console.error("Failed to fetch categories:", e);
    } finally {
      categoriesFetching = false;
    }
  };

  const fetchProviderGames = async (providerName, pageNum = 1) => {
    const cacheKey = `${providerName}_${pageNum}`;
    if (providerCache.current[cacheKey]) {
      const c = providerCache.current[cacheKey];
      setProviderGames(c.games);
      setProviderTotal(c.count);
      setProviderPage(pageNum);
      return;
    }
    setProviderLoading(true);
    try {
      const res = await apiHelper.post("/game/games/by-provider", {
        provider_name: providerName,
        page: pageNum,
        pageSize: PAGE_SIZE,
      });
      const games = res?.data?.data || [];
      const count = res?.data?.pagination?.total || res?.data?.count || 0;
      providerCache.current[cacheKey] = { games, count };
      setProviderGames(games);
      setProviderTotal(count);
      setProviderPage(pageNum);
    } catch (e) {
      console.error("Failed to fetch provider games:", e);
    } finally {
      setProviderLoading(false);
    }
  };

  //pagination in game//
  const fetchCategoryGames = async (category, pageNum = 1) => {
    const cacheKey = `${category}_${pageNum}`;
    if (catCache.current[cacheKey]) {
      const c = catCache.current[cacheKey];
      setCatGames(c.games);
      setTotalCount(c.count);
      setTotalPagesCount(c.totalPages || Math.ceil(c.count / PAGE_SIZE));
      setPage(pageNum);
      return;
    }
    setCatLoading(true);
    try {
      const res = await apiHelper.post("/game/games/by-category", {
        category,
        page: pageNum,
        pageSize: PAGE_SIZE,
      });
      const games = res?.data?.data || [];
      const count = res?.data?.pagination?.total || res?.data?.count || 0;
      const totalPages =
        res?.data?.pagination?.totalPages || Math.ceil(count / PAGE_SIZE);
      catCache.current[cacheKey] = { games, count, totalPages };
      setCatGames(games);
      setTotalCount(count);
      setTotalPagesCount(totalPages);
      setPage(pageNum);
    } catch (e) {
      console.error("Failed to fetch category games:", e);
    } finally {
      setCatLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setActiveProvider(null);
    setActiveSuperCat(null);
    setSuperCatSections([]);
    if (tab !== "All") {
      setCatGames([]);
      setTotalCount(0);
      setTotalPagesCount(1);
      fetchCategoryGames(tab, 1);
    } else {
      setCatGames([]);
    }
  };

  const renderSuperCatGames = () => {
    if (!activeSuperCat) return null;

    return (
      <div className="space-y-6">
        {superCatLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          superCatSections.map((section) => (
            <div key={section.category} className="space-y-3">
              <h3 className="text-lg font-semibold text-white capitalize">
                {section.category} ({section.count})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {section.games.map((game) => (
                  <GameCard key={game._id} game={game} onPlay={handlePlay} />
                ))}
              </div>
              {section.games.length < section.count && (
                <button
                  onClick={() =>
                    loadMoreSection(section.category, section.page + 1)
                  }
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Load More
                </button>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  const getCatKey = (cat) =>
    typeof cat === "object" ? cat.category || cat._id : cat;
  const getCatLabel = (cat) =>
    typeof cat === "object"
      ? cat.category_name || cat.name || cat.category
      : cat;
  const getCatImage = (cat) =>
    typeof cat === "object" ? cat.image || cat.url_thumb || null : null;

  //----------handleLaunchGame---------------------------------------------------
  const handleLaunchGame = async (game) => {
    if (launchingGameId || apiLoading) return;

    setSelectedGameId(game.game_id);
    setLaunchingGameId(game.game_id);

    try {
      const payload = {
        gameId: game?.game_id,
        providerName: game?.provider_name,
        platformId: "desktop",
        lobby: false,
        balance: user?.walletBalance ?? user?.balance ?? 0,
      };

      console.log("🚀 Launch payload:", payload);

      const res = await apiHelper.post("/game/games/launch", payload, {
        trackLoading: true,
      });
      console.log("📡 Launch API response:", res);

      if (res?.data?.url) {
        setGameIframe({ url: res.data.url, gameName: game.game_name, gameId: game.game_id });
        setIsGameOpen(true);
        setLaunchingGameId(null);
        setSelectedGameId(null);
        window.dispatchEvent(new CustomEvent("gameOpen", { detail: true }));
      } else {
        setLaunchingGameId(null);
        setSelectedGameId(null);
      }
    } catch (e) {
      console.error("❌ Failed to launch game:", e);
      setLaunchingGameId(null);
      setSelectedGameId(null);
    }
  };

  // Close game iframe
  const closeGame = () => {
    setGameIframe(null);
    setIsGameOpen(false);
    window.dispatchEvent(new CustomEvent("gameOpen", { detail: false }));
  };

  // Refresh game iframe
  const refreshGame = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };
  //-------------------------------------------------------------

  const totalPages = totalPagesCount;
  const filteredCatGames = catGames.filter((g) => {
    const matchSearch = search
      ? g.game_name.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchSearch;
  });
  const filteredProviderGames = providerGames.filter((g) =>
    search ? g.game_name.toLowerCase().includes(search.toLowerCase()) : true,
  );
  const providerTotalPages = Math.ceil(providerTotal / PAGE_SIZE);
  const tabs = ["All", ...categories.slice(0, 20)];

  return (
    <div
      className="min-h-screen max-w-[769px] mx-auto"
      style={{ background: "#0e0e0e" }}
    >
      {/* Game Iframe Overlay */}
      {gameIframe && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Game Controls Header */}
          <div className="flex items-center justify-between p-3 bg-gray-900 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <button
                onClick={closeGame}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Casino
              </button>
              <div className="text-white">
                <h3 className="text-sm font-semibold">{gameIframe.gameName}</h3>
                <p className="text-xs text-gray-400">ID: {gameIframe.gameId}</p>
              </div>
            </div>

            {/* <div className="flex items-center gap-2">
              <button
                onClick={refreshGame}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Refresh Game"
              >
                <RefreshIcon size={16} />
              </button>
              <button
                onClick={() => {
                  if (iframeRef.current) {
                    if (iframeRef.current.requestFullscreen) {
                      iframeRef.current.requestFullscreen();
                    }
                  }
                }}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={closeGame}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                title="Close Game"
              >
                <X size={16} />
              </button>
            </div> */}
          </div>

          {/* Game Iframe */}
          <iframe
            ref={iframeRef}
            src={gameIframe.url}
            className="w-full h-full border-0"
            style={{ height: "calc(100vh - 60px)" }}
            allow="fullscreen; autoplay; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-orientation-lock allow-modals"
            title={gameIframe.gameName}
          />
        </div>
      )}

      {/* Main Casino Content */}
      <div
        className={`px-2 pt-0 pb-24 max-w-[769px] mx-auto ${isGameOpen ? "pointer-events-none" : ""}`}
      >
        {/* Header */}
        <div
          className="relative px-3 py-3 mb-3"
          style={{ background: "#0e0e0e" }}
        >
          {/* Row 1: Avatar + Marquee+Search + Lang - all in one line */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Avatar */}
            <Link
              to="/profile"
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <div
                className="w-8 h-8 border border-white rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(to bottom, #1477b0, #264e69)",
                }}
              >
                <span className="text-white font-semibold text-xs">
                  {user?.clientName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            </Link>

            {/* Marquee + Search together */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 rounded-lg sm:rounded-xl px-1.5 sm:px-2 py-1.5 flex-1 min-w-0 overflow-hidden">
              <span className="text-xs sm:text-sm flex-shrink-0">📢</span>
              <div className="overflow-hidden flex-1 min-w-0">
                <marquee
                  className="text-[10px] sm:text-xs font-medium text-white"
                  onMouseOver={(e) => e.target.stop()}
                  onMouseOut={(e) => e.target.start()}
                >
                  {userAnnouncement}
                </marquee>
              </div>
              {/* <button
                onClick={() => {
                  setSearchOpen((o) => !o);
                  if (!searchOpen)
                    setTimeout(() => searchInputRef.current?.focus(), 50);
                  else setSearch("");
                }}
                className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: searchOpen
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.15)",
                }}
              >
                <Search
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                  style={{ color: searchOpen ? "#1477b0" : "#fff" }}
                />
              </button> */}
            </div>

            {/* Lang - same size as avatar */}
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <LanguageSelector />
            </div>
          </div>

          {/* Expandable search */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: searchOpen ? "44px" : "0px",
              opacity: searchOpen ? 1 : 0,
            }}
          >
            <div
              className="flex items-center rounded-xl px-3 py-1.5 mb-2"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <Search className="w-3.5 h-3.5 text-white/60 flex-shrink-0 mr-2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search games..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-sm text-white placeholder-white/40 outline-none bg-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="ml-2 text-white/50 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Providers strip */}
          {providersLoading ? (
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              <div
                className="flex-shrink-0 px-3 py-1 rounded-lg bg-white/10 animate-pulse"
                style={{ width: "60px", height: "41px" }}
              ></div>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 rounded-lg bg-white/10 animate-pulse"
                  style={{ width: "130px", height: "41px" }}
                ></div>
              ))}
            </div>
          ) : providers.length > 0 ? (
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              <button
                onClick={() => {
                  setActiveProvider(null);
                  setActiveTab("All");
                  setActiveSuperCat(null);
                  setSuperCatSections([]);
                }}
                className="flex-shrink-0 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: !activeProvider
                    ? "linear-gradient(135deg, #1477b0 0%, #264e69 100%)"
                    : "rgba(255,255,255,0.12)",
                  color: !activeProvider ? "#fff" : "#fff",
                  border: !activeProvider ? "1px solid rgba(20,119,176,0.6)" : "1px solid rgba(255,255,255,0.2)",
                  boxShadow: !activeProvider ? "0 2px 8px rgba(20,119,176,0.4)" : "none",
                }}
              >
                🏠 Lobby
              </button>
              {providers.map((p) => {
                const name =
                  typeof p === "object" ? p.provider_name || p.name || p : p;
                const { img, IconComponent } = getProviderDisplay(name);
                const isActive = activeProvider === name;
                return (
                  <button
                    key={name}
                    id={`provider-btn-${name}`}
                    onClick={() => {
                      setActiveProvider(name);
                      setActiveTab("");
                      setActiveSuperCat(null);
                      setSuperCatSections([]);
                      setSearch("");
                      if (name !== activeProvider) {
                        setProviderGames([]);
                        fetchProviderGames(name, 1);
                      }
                    }}
                    className="flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200 overflow-hidden group hover:bg-gradient-to-r hover:from-[#1477b0] hover:to-[#264e69]"
                    style={{
                      width: img ? "130px" : "auto",
                      height: "41px",
                      padding: img ? "0" : "0 10px",
                      background: isActive
                        ? "linear-gradient(135deg, #1477b0 0%, #264e69 100%)"
                        : "rgba(255,255,255,0.12)",
                      border: isActive
                        ? "1px solid rgba(20,119,176,0.6)"
                        : "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                      boxShadow: isActive
                        ? "0 2px 8px rgba(20,119,176,0.4)"
                        : "none",
                    }}
                  >
                    {img ? (
                      <ProviderImg
                        src={img}
                        name={name}
                        IconComponent={IconComponent}
                        isActive={isActive}
                      />
                    ) : (
                      <span className="text-[11px] font-semibold whitespace-nowrap flex items-center gap-1.5">
                        {IconComponent && <IconComponent size={14} />}
                        {name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex gap-1.5 mt-2 pb-1">
              <div className="text-white/60 text-xs py-2">No providers available</div>
            </div>
          )}
        </div>

        {/* Category strip — super categories first, then raw categories */}
        <div className="flex gap-2 overflow-x-auto mb-3 pb-2 px-1">
          {/* <button
            onClick={() => handleTabChange("All")}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all duration-300 border transform hover:scale-105 ${
              activeTab === "All" && !activeSuperCat ? "text-white border-transparent shadow-lg" : "text-gray-700 border-gray-200 bg-white hover:bg-gray-50"
            }`}
            style={activeTab === "All" && !activeSuperCat ? { background: "linear-gradient(135deg, #1477b0 0%, #264e69 100%)", boxShadow: "0 4px 15px rgba(20,119,176,0.3)" } : {}}
          >
            <span className="text-sm">🎯</span>
            <span>All</span>
          </button> */}

          {/* Super Categories */}
          {superCategories.map((sc) => {
            const isActive = activeSuperCat?.slug === sc.slug;
            return (
              <button
                key={sc.slug}
                onClick={() => handleSuperCatClick(sc)}
                className="flex-shrink-0 flex flex-row items-center gap-2 px-3 py-1.5 rounded-2xl transition-all duration-200 border"
                style={{
                  background: isActive ? "linear-gradient(135deg, #1477b0 0%, #264e69 100%)" : "#1a1a1a",
                  borderColor: isActive ? "transparent" : "rgba(255,255,255,0.1)",
                  boxShadow: isActive ? "0 4px 14px rgba(20,119,176,0.35)" : "none",
                }}
              >
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: isActive ? "rgba(255,255,255,0.18)" : "rgba(20,119,176,0.2)" }}
                >
                  {sc.icon ? (
                    <img src={sc.icon} alt={sc.name} className="w-4 h-4 rounded object-cover" />
                  ) : (
                    <CatIcon name={sc.name} size={14} className={isActive ? "text-white" : "text-[#1477b0]"} />
                  )}
                </div>
                <span
                  className="whitespace-nowrap capitalize text-[11px] leading-tight"
                  style={{ color: isActive ? "#fff" : "#aaa", fontWeight: isActive ? 600 : 500 }}
                >
                  {sc.name}
                </span>
              </button>
            );
          })}

          {/* Raw Categories */}
          {categories
            .filter((cat) => cat.type === "raw")
            .map((cat) => {
              const isActive = activeTab === cat.name && !activeSuperCat;
              return (
                <button
                  key={cat.slug}
                  onClick={() => handleTabChange(cat.name)}
                  className="flex-shrink-0 flex flex-row items-center gap-2 px-3 py-1.5 rounded-2xl transition-all duration-200 border"
                  style={{
                    background: isActive ? "linear-gradient(135deg, #1477b0 0%, #264e69 100%)" : "#1a1a1a",
                    borderColor: isActive ? "transparent" : "rgba(255,255,255,0.1)",
                    boxShadow: isActive ? "0 4px 14px rgba(20,119,176,0.35)" : "none",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isActive ? "rgba(255,255,255,0.18)" : "rgba(20,119,176,0.2)" }}
                  >
                    <CatIcon name={cat.name} size={14} className="text-[#1477b0]" />
                  </div>
                  <span
                    className="whitespace-nowrap capitalize text-[11px] leading-tight"
                    style={{ color: isActive ? "#fff" : "#aaa", fontWeight: isActive ? 600 : 500 }}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
        </div>

        {/* SUPER CATEGORY — show games by category from API response */}
        {activeSuperCat && !activeProvider && (
          <div className="space-y-4 mb-4">
            {superCatLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mt-2">Loading games...</p>
              </div>
            ) : superCatSections.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm mb-2">No games found</p>
              </div>
            ) : (
              // Show all categories with games in single horizontal slides (like image layout)
              <div className="space-y-6">
                {superCatSections.map((section) => (
                  <div
                    key={section.category}
                    className="rounded-xl p-3 sm:p-4 border"
                    style={{ background: "#1b1b1b", borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <CatIcon name={section.category} size={16} className="text-[#1477b0]" />
                        <h3 className="text-sm sm:text-base font-bold text-white capitalize">{section.category}</h3>
                        <span className="text-[10px] sm:text-xs text-gray-500">({section.count})</span>
                      </div>
                      <button
                        onClick={() => { setActiveTab(section.category); setActiveSuperCat(null); fetchCategoryGames(section.category, 1); }}
                        className="text-[10px] sm:text-xs text-[#1477b0] hover:text-blue-400 font-semibold"
                      >
                        All →
                      </button>
                    </div>

                    {/* Horizontal scrollable games */}
                    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                      {section.games
                        .filter((g) =>
                          search
                            ? g.game_name
                                .toLowerCase()
                                .includes(search.toLowerCase())
                            : true,
                        )
                        .map((game) => (
                          <div
                            key={game?.game_id || game?._id}
                            className="flex-shrink-0 w-[110px] sm:w-[140px]"
                          >
                            <GameCard
                              game={game}
                              onClick={handleLaunchGame}
                              launchingGameId={launchingGameId}
                              selectedGameId={selectedGameId}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALL TAB */}
        {activeTab === "All" &&
          !activeProvider &&
          !activeSuperCat &&
          (allLoading ? (
            <Loader />
          ) : (
            <>
              {/* Featured Games */}
              {lobbyGames.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full" style={{ background: "#1477b0" }} />
                    <p className="text-sm font-bold text-white">🔥 Featured Games</p>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {lobbyGames.map((game) => (
                      <GameCard
                        key={game.game_id}
                        game={game}
                        onClick={handleLaunchGame}
                        launchingGameId={launchingGameId}
                        selectedGameId={selectedGameId}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ))}

        {/* PROVIDER GAMES */}
        {activeProvider && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full" style={{ background: "#1477b0" }} />
              <p className="text-sm font-bold text-white capitalize">{activeProvider}</p>
              <span className="text-xs text-gray-500">
                ({providerTotal > 0 ? providerTotal : providers.find((p) => (p.provider_name || p.name) === activeProvider)?.gameCount || 0} games)
              </span>
            </div>
            {providerLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ aspectRatio: "3/4", background: "#2a2a2a" }} />
                    <div className="px-2 py-1.5">
                      <div className="h-2.5 rounded bg-gray-700 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {filteredProviderGames.length === 0 ? (
                  <p className="text-center text-gray-500 py-10 text-sm">No games found</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {filteredProviderGames.map((game) => (
                      <GameCard
                        key={game?.game_id || game?._id}
                        game={game}
                        onClick={handleLaunchGame}
                        launchingGameId={launchingGameId}
                        selectedGameId={selectedGameId}
                      />
                    ))}
                  </div>
                )}
                <Pagination
                  page={providerPage}
                  totalPages={providerTotalPages}
                  total={providerTotal}
                  onPrev={() =>
                    fetchProviderGames(activeProvider, providerPage - 1)
                  }
                  onNext={() =>
                    fetchProviderGames(activeProvider, providerPage + 1)
                  }
                />
              </>
            )}
          </div>
        )}

        {/* SINGLE CATEGORY TAB */}
        {activeTab !== "All" && !activeProvider && !activeSuperCat && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full" style={{ background: "#1477b0" }} />
              <p className="text-sm font-bold text-white capitalize">{activeTab}</p>
              <span className="text-xs text-gray-500">({totalCount} games)</span>
            </div>
            {catLoading ? (
              <Loader />
            ) : (
              <>
                {filteredCatGames?.length === 0 ? (
                  <p className="text-center text-gray-500 py-10 text-sm">No games found</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {filteredCatGames?.map((game) => (
                      <GameCard
                        key={game?.game_id || game?._id}
                        game={game}
                        onClick={handleLaunchGame}
                        launchingGameId={launchingGameId}
                        selectedGameId={selectedGameId}
                      />
                    ))}
                  </div>
                )}
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={totalCount}
                  onPrev={() => fetchCategoryGames(activeTab, page - 1)}
                  onNext={() => fetchCategoryGames(activeTab, page + 1)}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation - Hidden when game is open */}
      {!isGameOpen && <BottomNavigation activePage="casino" />}
      {!isGameOpen && <WhatsAppButton />}
    </div>
  );
};

const Pagination = ({ page, totalPages, total, onPrev, onNext }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-col items-center justify-center mt-4 pt-4 rounded-xl p-4 mx-auto max-w-sm" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
      <span className="text-sm text-gray-400 font-medium mb-3">Page {page} of {totalPages}</span>
      <div className="flex items-center justify-center gap-2 mb-2">
        <button onClick={onPrev} disabled={page === 1} className="flex items-center gap-1 px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-white" style={{ background: "#2a2a2a" }}>
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <span className="px-4 py-2 text-sm text-white rounded-lg font-medium mx-2" style={{ background: "linear-gradient(135deg, #1477b0 0%, #264e69 100%)" }}>{page}</span>
        <button onClick={onNext} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-white" style={{ background: "#2a2a2a" }}>
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <span className="text-xs text-gray-600">{total} total games</span>
    </div>
  );
};

const LazyCategoryCard = ({ label, img, onClick }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const CategoryIcon = getCategoryIcon(label);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="rounded-xl cursor-pointer group overflow-hidden relative transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      style={{
        background: "linear-gradient(135deg, #0f2a3d 0%, #1a3a52 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        minHeight: "100px",
      }}
    >
      {visible ? (
        <>
          {img ? (
            <div className="relative overflow-hidden">
              <img
                src={img}
                alt={label}
                className="w-full h-24 object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-2 right-2 opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                <CategoryIcon size={18} className="text-white" />
              </div>
            </div>
          ) : (
            <div
              className="w-full h-24 flex items-center justify-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1477b0 0%, #264e69 100%)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CategoryIcon
                size={36}
                className="text-white transition-all duration-300 group-hover:scale-125"
              />
            </div>
          )}
          <div
            className="px-3 py-2 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0a1e2e 0%, #0f2a3d 100%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <p className="text-white text-[11px] font-semibold text-center capitalize truncate relative z-10 transition-all duration-300 group-hover:text-blue-200 flex items-center justify-center gap-1">
              <CategoryIcon size={10} className="flex-shrink-0" />
              {label}
            </p>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100"
            style={{ background: "rgba(0,0,0,0.7)" }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center transform transition-all duration-300 group-hover:rotate-360"
              style={{
                background: "linear-gradient(135deg, #1477b0, #264e69)",
                boxShadow: "0 0 20px rgba(20,119,176,0.5)",
              }}
            >
              <span className="text-white text-lg ml-0.5">▶</span>
            </div>
          </div>
        </>
      ) : (
        <div
          className="w-full h-24 animate-pulse"
          style={{ background: "#1a3a52" }}
        />
      )}
    </div>
  );
};

const Loader = () => (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-3" style={{ borderColor: "#1477b0" }}></div>
    <p className="text-gray-500 text-sm">Loading...</p>
  </div>
);

const GameCard = ({ game, onClick, launchingGameId, selectedGameId }) => {
  const isLaunching = launchingGameId === game.game_id;
  const isSelected = selectedGameId === game.game_id;
  const isAnyGameLaunching = launchingGameId !== null;

  return (
    <div
      onClick={() => !isAnyGameLaunching && onClick(game)}
      className={`rounded-lg sm:rounded-xl overflow-hidden cursor-pointer group relative transition-all duration-200 ${
        isAnyGameLaunching
          ? isLaunching
            ? "opacity-100 scale-[0.97]"
            : "opacity-40 cursor-not-allowed"
          : isSelected
          ? "scale-[0.97]"
          : "hover:scale-105"
      }`}
      style={{
        background: "#1a1a1a",
        border: isSelected || isLaunching
          ? "2px solid #1477b0"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isSelected || isLaunching
          ? "0 0 12px rgba(20,119,176,0.6)"
          : "none",
      }}
    >
      {/* Thumbnail */}
      <div className="relative" style={{ aspectRatio: "3/4" }}>
        {game.url_thumb ? (
          <img
            src={game.url_thumb}
            alt={game.game_name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl sm:text-4xl"
            style={{
              background: "linear-gradient(135deg, #1477b0 0%, #264e69 100%)",
            }}
          >
            🎮
          </div>
        )}

        {/* Loading overlay */}
        {isLaunching && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            style={{ background: "rgba(0,0,0,0.85)" }}
          >
            <div className="relative">
              <div className="w-6 h-6 sm:w-10 sm:h-10 border-2 sm:border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-2 sm:mb-3"></div>
              <div
                className="absolute inset-0 w-6 h-6 sm:w-10 sm:h-10 border-2 sm:border-4 border-transparent border-r-blue-300 rounded-full animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              ></div>
            </div>
            <span className="text-white text-[10px] sm:text-xs font-bold tracking-wide">
              LAUNCHING
            </span>
            <div className="flex space-x-1 mt-1 sm:mt-2">
              <div
                className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: "200ms" }}
              ></div>
              <div
                className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: "400ms" }}
              ></div>
            </div>
          </div>
        )}

        {/* Hover overlay - only show when not launching */}
        {!isAnyGameLaunching && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{ background: "rgba(0,0,0,0.55)" }}
          >
            <div
              className="w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #1477b0, #264e69)",
                boxShadow: "0 0 16px rgba(20,119,176,0.7)",
              }}
            >
              <span className="text-white text-xs sm:text-base ml-0.5">▶</span>
            </div>
          </div>
        )}

        {/* Provider badge */}
        {game.sub_provider_name && (
          <div
            className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-1 sm:px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] font-bold uppercase tracking-wide"
            style={{
              background: "rgba(0,0,0,0.65)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {game.sub_provider_name}
          </div>
        )}
      </div>

      {/* Name */}
      <div className="px-1.5 py-1 sm:px-2 sm:py-1.5" style={{ background: "#111" }}>
        <p className="text-white text-[9px] sm:text-[11px] font-semibold truncate leading-tight">
          {game.game_name}
        </p>
      </div>
    </div>
  );
};

export default Casino;
