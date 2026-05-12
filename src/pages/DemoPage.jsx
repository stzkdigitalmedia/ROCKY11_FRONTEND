import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Plus,
  BarChart3,
  Gamepad2,
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  ArrowUp,
  ArrowDown,
  LinkIcon,
  ArrowRight,
} from "lucide-react";
import BottomNavigation from "../components/BottomNavigation";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { apiHelper } from "../utils/apiHelper";
import { useToastContext } from "../App";

const DemoPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToastContext();
  const [userAnnouncement, setUserAnnouncement] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dynamicStrips, setDynamicStrips] = useState([]);
  const [stripsLoading, setStripsLoading] = useState(false);
  const [topProviders, setTopProviders] = useState([]);
  const [mac88Games, setMac88Games] = useState([]);
  const [mac88Loading, setMac88Loading] = useState(false);
  const [spribeGames, setSpribeGames] = useState([]);
  const [spribeLoading, setSpribeLoading] = useState(false);
  const [ezugiGames, setEzugiGames] = useState([]);
  const [ezugiLoading, setEzugiLoading] = useState(false);
  const [jackpotGames, setJackpotGames] = useState([]);
  const [jackpotLoading, setJackpotLoading] = useState(false);
  const [gameIframe, setGameIframe] = useState(null);

  const fetchDynamicStrips = async () => {
    setStripsLoading(true);
    try {
      const res = await apiHelper.get("/game/games/strips");
      const strips = res?.data?.strips || [];
      setDynamicStrips(
        strips
          .filter((s) => s.isActive !== false)
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      );
    } catch {
      setDynamicStrips([]);
    } finally {
      setStripsLoading(false);
    }
  };

  const fetchProviderGames = async (variations, setter, loadingSetter) => {
    loadingSetter(true);
    try {
      let found = [];
      for (const name of variations) {
        try {
          const res = await apiHelper.post("/game/games/by-provider", { provider_name: name, page: 1, pageSize: 20 });
          const games = res?.data?.data || res?.data?.games || (Array.isArray(res?.data) ? res.data : []);
          if (games.length > 0) { found = games; break; }
        } catch { }
      }
      setter(found);
    } catch { setter([]); }
    finally { loadingSetter(false); }
  };

  useEffect(() => {
    toast.showToast("You can access casino games only. This is a demo ID.", "info");

    fetchDynamicStrips();
    apiHelper.get("/game/featured/getTopProviders").then(res => setTopProviders(res?.data?.providers || [])).catch(() => { });
    fetchProviderGames(["mac88", "Mac88", "MAC88"], setMac88Games, setMac88Loading);
    fetchProviderGames(["spribe", "Spribe", "SPRIBE"], setSpribeGames, setSpribeLoading);
    fetchProviderGames(["ezugi", "Ezugi", "EZUGI"], setEzugiGames, setEzugiLoading);
    fetchProviderGames(["jackpot", "Jackpot", "JACKPOT", "jacktop", "Jacktop"], setJackpotGames, setJackpotLoading);
  }, []);

  useEffect(() => {
    apiHelper
      .get("/announcement/getAnnouncement")
      .then((res) =>
        setUserAnnouncement(
          res?.data?.userAnnouncement || res?.userAnnouncement || "",
        ),
      )
      .catch(() => { });
  }, []);

  // Auto scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const maxSlide =
          dummySubAccounts.length - (window.innerWidth >= 640 ? 2 : 1);
        return prev >= maxSlide ? 0 : prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Dummy data with demo credentials
  const dummyUser = {
    clientName: "DemoUser",
    fullName: "Demo User",
    balance: 0,
    branchName: "Demo Branch",
  };

  const dummySubAccounts = [
    {
      id: 1,
      clientName: "****",
      password: "****",
      status: "Accept",
      gameId: {
        name: "WILLSEXCH",
        image: "/will1.png",
        gameUrl: "https://**",
      },
    },
    {
      id: 2,
      clientName: "****",
      password: "****",
      status: "Accept",
      gameId: {
        name: "R9EXCH",
        image: "/r9x.png",
        gameUrl: "https://**",
      },
    },
    {
      id: 3,
      clientName: "****",
      password: "****",
      status: "Accept",
      gameId: {
        name: "DIAMOND99",
        image: "/diamond.png",
        gameUrl: "https://**",
      },
    },
    {
      id: 4,
      clientName: "****",
      password: "****",
      status: "Accept",
      gameId: {
        name: "ALLPANEL",

        image: "/ALL.png",
        gameUrl: "https://****",
      },
    },
    {
      id: 5,
      clientName: "****",
      password: "****",
      status: "Accept",
      gameId: {
        name: "WILLSWIN",
        image: "/will1.png",
        gameUrl: "https://**",
      },
    },
    {
      id: 6,
      clientName: "****",
      password: "****",
      status: "Accept",
      gameId: {
        name: "DURGA247",
        image: "/Durga.png",
        gameUrl: "https://**",
      },
    },
  ];

  const getProviderIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("evolution")) return "🎬";
    if (n.includes("pragmatic")) return "🔥";
    if (n.includes("spribe")) return "✈️";
    if (n.includes("mac88") || n.includes("mac 88")) return "🎰";
    if (n.includes("ezugi")) return "🃏";
    if (n.includes("jackpot") || n.includes("jacktop")) return "💰";
    if (n.includes("jili")) return "🎯";
    if (n.includes("pgsoft") || n.includes("pg soft")) return "🐉";
    if (n.includes("rich88")) return "💎";
    if (n.includes("betcore")) return "⚡";
    if (n.includes("aura")) return "🌟";
    if (n.includes("turbo")) return "🚀";
    if (n.includes("crash")) return "💥";
    if (n.includes("aviator")) return "✈️";
    return "🎮";
  };

  const handleDepositWithdraw = () => {
    navigate("/login");
  };

  const handleGameLaunch = async (game) => {
    try {
      // Launch game with dummy credentials
      const launchData = {
        gameId: game.game_id,
        providerName: game.provider_name,
        // user_id: "demo_user",
        platformId: "desktop",
        lobby: false,
        balance: 0,
        currency: "INR",
        isDemo: true
      };

      const response = await apiHelper.post("/game/games/launch", launchData);

      if (response?.data?.url || response?.data?.game_url || response?.game_url) {
        const gameUrl = response.data?.url || response.data?.game_url || response.game_url;
        setGameIframe(gameUrl);
        window.dispatchEvent(new CustomEvent("gameOpen", { detail: true }));
      }
    } catch (error) {
      console.error("Failed to launch game:", error);
      // Fallback to demo URL if available
      if (game.demo_url) {
        setGameIframe(game.demo_url);
        window.dispatchEvent(new CustomEvent("gameOpen", { detail: true }));
      }
    }
  };

  const closeGame = () => {
    setGameIframe(null);
    window.dispatchEvent(new CustomEvent("gameOpen", { detail: false }));
  };

  if (gameIframe) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="flex items-center justify-between p-4 bg-gray-900">
          <h3 className="text-white font-semibold">Demo id</h3>
          <button
            onClick={closeGame}
            className="text-white hover:text-red-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <iframe
          src={gameIframe}
          className="w-full h-[calc(100vh-64px)]"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] max-w-[769px] mx-auto">
      {/* Main Content */}
      <div className="max-w-[769px] mx-auto">
        {/* Modern Wallet Section */}
        <div
          className="relative w-full pt-10 pb-8 flex justify-center items-center"
          style={{
            background: 'url(/bghero.svg)',
            backgroundSize: '400px'
          }}
        >

          <div
            onClick={handleDepositWithdraw}
            className="absolute top-0 left-4 cursor-pointer"
          >
            <div className="w-7 h-7 p-4 sm:w-9 sm:h-9 border-1 border-white mt-3 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-md sm:text-md">
                {dummyUser?.clientName?.charAt(0)?.toUpperCase() || 'D'}
              </span>
            </div>
          </div>

          <div className='absolute top-3 right-4 flex items-center gap-2' onClick={e => e.stopPropagation()}>
            <button
              onClick={() => navigate("/login")}
              className="text-[10px] sm:text-[12px] h-5 sm:h-7 bg-black text-white px-2 border-1 rounded-lg border-black"
            >
              {t("loginSignup")}
            </button>
            <LanguageSelector />
          </div>

          {/* CENTER WRAPPER */}
          <div className="relative flex items-center mt-4">

            {/* LEFT – DEPOSIT */}
            <div
              onClick={handleDepositWithdraw}
              className="w-[80px] h-[100px] mr-2 bg-[#1a1a1a] rounded-l-2xl
      flex flex-col items-center justify-center gap-2
      cursor-pointer shadow-2xl"
            >
              <span className="text-white text-sm">{t('deposit')}</span>
              <img src='/arrowup.svg' className="h-7 leading-none" />
            </div>

            {/* CENTER – MAIN WALLET */}
            <div
              onClick={handleDepositWithdraw}
              className="w-[150px] h-[160px] bg-[#141414] rounded-3xl
      flex flex-col items-center justify-center
      mx-[-14px] z-10 shadow-2xl shadow-black cursor-pointer"
            >
              <img
                src="/logoforlogin.png"
                alt="Logo"
                className="h-12 mb-4"
              />

              <p className="text-white/70 text-xs tracking-widest mb-1">
                WALLET BALANCE
              </p>

              <div className="flex items-center gap-2 text-white text-xl font-semibold">
                <img src="/coinsicon.png" className='w-5' alt="" />
                <span>{dummyUser.balance.toLocaleString()}</span>
              </div>
            </div>

            {/* RIGHT – WITHDRAW */}
            <div
              onClick={handleDepositWithdraw}
              className="w-[80px] h-[100px] ml-2 bg-[#1a1a1a] rounded-r-2xl
      flex flex-col items-center justify-center gap-2
      cursor-pointer shadow-2xl"
            >
              <span className="text-white text-sm">{t('withdraw')}</span>
              <img src='/arrowdown.svg' className="h-7 leading-none" />
            </div>

          </div>
        </div>

        <div className="mt-3 mx-2 overflow-hidden rounded-lg bg-[#1a1a2e] border border-[#1477b0]/30 py-1 flex items-center gap-2 px-3">
          <span className="text-sm flex-shrink-0">📢</span>
          <div className="overflow-hidden flex-1">
            <marquee
              className="text-xs font-medium text-white"
              onMouseOver={(e) => e.target.stop()}
              onMouseOut={(e) => e.target.start()}
            >
              {userAnnouncement}
            </marquee>
          </div>
        </div>

        {/* Sub Accounts Slider */}
        <div className="m-1 rounded-2xl mt-[14px] mx-2 p-4 sm:p-6 bg-[#1b1b1b] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Demo IDs ({dummySubAccounts.length})
              </h2>
              <p className="text-sm text-nowrap text-blue-200">
                Demo accounts for testing
              </p>
            </div>

            {dummySubAccounts.length > 1 && (
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="px-2 h-9 rounded-lg bg-[#005993] sm:text:[16px] text-[14px] text-white font-semibold"
                >
                  Get Real Account
                </button>
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide((prev) => Math.max(0, prev - 1));
                    }}
                    className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
                  >
                    <ChevronLeft className="mx-auto" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const maxSlide =
                        dummySubAccounts.length -
                        (window.innerWidth >= 640 ? 2 : 1);
                      setCurrentSlide((prev) => Math.min(maxSlide, prev + 1));
                    }}
                    className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
                  >
                    <ChevronRight className="mx-auto" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * (100 / (window.innerWidth >= 640 ? 2 : 1))}%)`,
              }}
            >
              {dummySubAccounts.map((account, index) => {
                const game = account.gameId?.name;
                return (
                  <div
                    key={account.id || index}
                    className="flex-shrink-0 px-2"
                    style={{ width: window.innerWidth >= 640 ? "50%" : "100%" }}
                  >
                    <div className="rounded-2xl p-5 bg-[#3f3f3f] text-white">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-12 h-12 overflow-hidden rounded-full bg-black flex items-center justify-center">
                            <img
                              src={account.gameId?.image}
                              alt={account.gameId?.name}
                              className="w-full h-full m-auto rounded"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm sm:text-lg notranslate">
                              {game || "Game"}
                            </h3>
                          </div>
                        </div>
                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            DEMO
                          </span>
                        </div>
                      </div>

                      {/* Account Details */}
                      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 rounded flex items-center justify-center">
                            <span className="text-xs">👤</span>
                          </div>
                          <span className="text-xs sm:text-sm notranslate">
                            ID:
                          </span>
                          <span className="text-xs sm:text-sm font-mono truncate notranslate">
                            {account?.clientName || "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 rounded flex items-center justify-center">
                            <span className="text-xs">🔒</span>
                          </div>
                          <span className="text-xs sm:text-sm notranslate">
                            {t("password")}:
                          </span>
                          <span className="text-xs sm:text-sm font-mono truncate flex-1 notranslate">
                            {account?.password || "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 rounded flex items-center justify-center">
                            <span className="text-xs">🌐</span>
                          </div>
                          <span className="text-xs sm:text-sm notranslate">
                            {t("platform")}:
                          </span>
                          <span className="text-xs sm:text-sm font-mono truncate">
                            {account?.gameId?.gameUrl || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 sm:gap-3 flex-wrap">
                        <button
                          onClick={handleDepositWithdraw}
                          className="flex-1 py-2 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors bg-green-600 hover:bg-green-700 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-medium">
                            {t("deposit")}
                          </span>
                        </button>
                        <button
                          onClick={handleDepositWithdraw}
                          className="flex-1 py-2 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors bg-red-600 hover:bg-red-700 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-medium">
                            {t("withdraw")}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Casino Providers */}
        {topProviders.length > 0 && (
          <div
            className="mb-3 mx-2 mt-3 rounded-xl p-3"
            style={{ background: "#1b1b1b", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white border-b-2 border-[#1477b0] pb-1">🎰 Casino Providers</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {topProviders.map((p) => (
                <button
                  key={p.providerName}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-medium transition-all hover:scale-[1.03]"
                  style={{ background: "#2a2a2a", border: "1px solid rgba(20,119,176,0.4)" }}
                >
                  {getProviderIcon(p.providerName)} {p.providerName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Strips */}
        {dynamicStrips.map((strip, index) => (
          <div
            key={strip._id || index}
            className="px-1 pb-2 rounded-xl py-1 mx-2 mb-1"
            style={{
              background:
                "linear-gradient(135deg, rgba(20,119,176,0.15) 0%, rgba(38,78,105,0.15) 100%)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-gray-300 font-bold text-sm border-b-2 border-[#f59e0b] pb-1">
                  {strip.title}
                </h3>
                {strip.games?.length > 0 && (
                  <span className="bg-[#f59e0b] text-white text-xs px-2 py-1 rounded-full font-semibold">
                    {strip.games.length}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
              {stripsLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[120px] sm:w-[140px] h-[150px] sm:h-[175px] rounded-2xl bg-gray-700 animate-pulse"
                  />
                ))
              ) : strip.games?.length > 0 ? (
                strip.games.map((game, gameIndex) => (
                  <div
                    key={`${strip._id}-${game.game_id || gameIndex}`}
                    onClick={() => handleGameLaunch(game)}
                    className="flex-shrink-0 w-[120px] sm:w-[140px] h-[150px] sm:h-[175px] rounded-2xl overflow-hidden relative cursor-pointer group border border-white/10 hover:border-[#f59e0b] transition-all duration-300 hover:scale-[1.04]"
                  >
                    {game.url_thumb ? (
                      <img
                        src={game.url_thumb}
                        alt={game.game_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full bg-gradient-to-b from-blue-600 to-indigo-900 flex items-center justify-center"
                      style={{ display: game.url_thumb ? "none" : "flex" }}
                    >
                      <span className="text-3xl sm:text-4xl">🎮</span>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md rounded-full px-2 py-0.5">
                      <span className="text-white text-[9px] sm:text-[10px] font-medium">
                        🎯 {game.provider_name || "GAME"}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 text-center">
                      <h3 className="text-white font-bold text-[10px] sm:text-[11px] uppercase leading-tight tracking-wide drop-shadow-md line-clamp-2">
                        {game.game_name || "Game"}
                      </h3>
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <div className="bg-[#f59e0b] w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-black text-base sm:text-lg font-bold ml-1">▶</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-shrink-0 w-full text-center py-8">
                  <p className="text-gray-400 text-sm">No games available in {strip.title}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <BottomNavigation activePage="home" onNavigate={() => navigate('/login')} />
    </div>
  );
};

export default DemoPage;