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
} from "lucide-react";
import BottomNavigation from "../components/BottomNavigation";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dummy data
  const dummyUser = {
    clientName: "RemoUser",
    fullName: "Demo User",
    balance: 0,
    branchName: "Demo Branch",
  };

  const dummyGames = [
    { id: 1, name: "BETFAIR", image: "/logoforlogin.png" },
    { id: 2, name: "DIAMOND", image: "/logoforlogin.png" },
    { id: 3, name: "LOTUS365", image: "/logoforlogin.png" },
    { id: 4, name: "SKYEXCH", image: "/logoforlogin.png" },
  ];

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const maxSlides =
          dummySubAccounts.length - (window.innerWidth >= 640 ? 2 : 1);
        return prev >= maxSlides ? 0 : prev + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRedirectToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] max-w-[769px] mx-auto">
        {/* Main Content */}
        <div className="max-w-[769px] mx-auto">
          {/* Modern Wallet Section */}
          <div
            className="relative w-full pt-10 pb-8 flex justify-center items-center"
            style={{
              background: "url(/bghero.svg)",
              backgroundSize: "400px",
            }}
          >
            <div
              onClick={handleRedirectToLogin}
              className="absolute top-0 left-4 cursor-pointer"
            >
              <div className="w-7 h-7 p-4 sm:w-9 sm:h-9 border-1 border-white mt-3 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-md sm:text-md">
                  {dummyUser?.clientName?.charAt(0)?.toUpperCase() || "D"}
                </span>
              </div>
            </div>

            <div className="absolute top-0 right-0 flex">
              <button className=" text-[10px] sm:text-[12px] h-5 sm:h-7 bg-black text-white mr-3 sm:mr-1.5 px-2 mt-5 sm:mt-4 boeder border-1 rounded-lg border-black">
                {t("loginSignup")}
              </button>
              <LanguageSelector />
            </div>

            {/* CENTER WRAPPER */}
            <div className="relative flex items-center mt-4">
              {/* LEFT – DEPOSIT */}
              <div
                onClick={handleRedirectToLogin}
                className="w-[80px] h-[100px] mr-2 bg-[#1a1a1a] rounded-l-2xl
      flex flex-col items-center justify-center gap-2
      cursor-pointer shadow-2xl"
              >
                <span className="text-white text-sm">{t("deposit")}</span>
                <img src="/arrowup.svg" className="h-7 leading-none" />
              </div>

              {/* CENTER – MAIN WALLET */}
              <div
                onClick={handleRedirectToLogin}
                className="w-[150px] h-[160px] bg-[#141414] rounded-3xl
      flex flex-col items-center justify-center
      mx-[-14px] z-10 shadow-2xl shadow-black cursor-pointer"
              >
                <img src="/logoforlogin.png" alt="Logo" className="h-12 mb-4" />

                <p className="text-white/70 text-xs tracking-widest mb-1">
                  WALLET BALANCE
                </p>

                <div className="flex items-center gap-2 text-white text-xl font-semibold">
                  <img src="/coinsicon.png" className="w-5" alt="" />
                  <span>{dummyUser.balance.toLocaleString()}</span>
                </div>
              </div>

              {/* RIGHT – WITHDRAW */}
              <div
                onClick={handleRedirectToLogin}
                className="w-[80px] h-[100px] ml-2 bg-[#1a1a1a] rounded-r-2xl
      flex flex-col items-center justify-center gap-2
      cursor-pointer shadow-2xl"
              >
                <span className="text-white text-sm">{t("withdraw")}</span>
                <img src="/arrowdown.svg" className="h-7 leading-none" />
              </div>
            </div>
          </div>

          {/* Sub Accounts Slider */}
          <div className="m-1 rounded-2xl mt-[22px] mx-2 p-4 sm:p-6 bg-[#1b1b1b] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {t("myIds")} ({dummySubAccounts.length})
                </h2>
                <p className="text-sm text-nowrap text-blue-200">
                  {t("manageAccounts")}
                </p>
              </div>

              {dummySubAccounts.length > 1 && (
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    onClick={handleRedirectToLogin}
                    className="px-2 h-9 rounded-lg bg-[#005993] sm:text:[16px] text-[14px] text-white font-semibold"
                  >
                    Get New Id
                  </button>
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={handleRedirectToLogin}
                      className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
                    >
                      <ChevronLeft className="mx-auto" />
                    </button>
                    <button
                      onClick={handleRedirectToLogin}
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
                className="flex transition-transform duration-300 ease-in-out"
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
                      style={{
                        width: window.innerWidth >= 640 ? "50%" : "100%",
                      }}
                    >
                      <div
                        onClick={handleRedirectToLogin}
                        className="rounded-2xl p-5 bg-[#3f3f3f] text-white cursor-pointer"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-12 h-12 overflow-hidden rounded-full bg-black flex items-center justify-center">
                              <img
                                src={account.gameId?.image}
                                alt={account.gameId?.name}
                                className="w-full h-full m-auto  rounded"
                              />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm sm:text-lg notranslate">
                                {game || "Game"}
                              </h3>
                            </div>
                          </div>
                          <div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {t("active")}
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRedirectToLogin();
                              }}
                              className="ml-auto p-1 hover:bg-gray-800 rounded"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRedirectToLogin();
                              }}
                              className="p-1 hover:bg-gray-800 rounded"
                              title="Copy Password"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRedirectToLogin();
                              }}
                              className="ml-auto p-1 hover:bg-gray-800 rounded"
                              title="Open Platform"
                            >
                              <LinkIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 sm:gap-3 flex-wrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRedirectToLogin();
                            }}
                            className="flex-1 py-2 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors bg-green-600 hover:bg-green-700 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm font-medium">
                              {t("deposit")}
                            </span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRedirectToLogin();
                            }}
                            className="flex-1 py-2 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors bg-red-600 hover:bg-red-700 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm font-medium">
                              {t("withdraw")}
                            </span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRedirectToLogin();
                            }}
                            className="flex-1 py-2 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors cursor-pointer"
                            style={{ backgroundColor: "#1477b0" }}
                            title="Reset Password"
                          >
                            <span className="text-xs sm:text-sm font-medium">
                              {t("resetPassword")}
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
        </div>

        {/* Bottom padding to prevent content overlap */}
        <BottomNavigation activePage="home" />
    </div>
  );
};

export default LandingPage;
