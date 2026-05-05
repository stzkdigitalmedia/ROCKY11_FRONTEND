import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { X, RotateCcw, Home, Maximize2, Minimize2 } from 'lucide-react';

const GamePage = () => {
  const { gameId, gameName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [gameUrl, setGameUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    const url = searchParams.get('url');
    if (url) {
      setGameUrl(decodeURIComponent(url));
      setIsLoading(false);
    } else {
      setError('Game URL not found');
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleClose = () => {
    window.close();
    // Fallback if window.close() doesn't work
    setTimeout(() => {
      navigate('/');
    }, 100);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError('');
    // Reload the iframe
    const iframe = document.getElementById('game-iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleHome = () => {
    navigate('/');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setShowHeader(false);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      setShowHeader(true);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement;
      setIsFullscreen(isFS);
      setShowHeader(!isFS);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-hide header after 3 seconds for better gaming experience
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isFullscreen) {
        setShowHeader(false);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-2xl font-bold mb-4">Game Not Available</h1>
          <p className="mb-6 text-gray-300">{error}</p>
          <button
            onClick={handleHome}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            🏠 Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Header - toggleable */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        } absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-2 flex items-center justify-between`}
        onMouseEnter={() => setShowHeader(true)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">🎮</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">
              {decodeURIComponent(gameName || 'Game')}
            </h1>
            <p className="text-gray-400 text-xs">ID: {gameId}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            title="Refresh Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleHome}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            title="Go Home"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            title="Close Game"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Container - Full viewport */}
      <div 
        className="flex-1 relative w-full h-full"
        onMouseMove={() => setShowHeader(true)}
        onClick={() => setShowHeader(false)}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center z-40">
            <div className="text-center text-white bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-300 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-xl font-bold mb-2">🎮 Loading Game...</p>
              <p className="text-gray-400 text-sm">Please wait while we prepare your gaming experience</p>
              <div className="flex justify-center space-x-1 mt-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {gameUrl && (
          <iframe
            id="game-iframe"
            src={gameUrl}
            className="w-full h-full border-0 absolute inset-0"
            title={decodeURIComponent(gameName || 'Game')}
            onLoad={() => {
              setIsLoading(false);
              // Auto-click to handle "Tap to continue" overlays
              setTimeout(() => {
                const iframe = document.getElementById('game-iframe');
                if (iframe && iframe.contentWindow) {
                  try {
                    // Try to click in the center of the iframe
                    iframe.contentWindow.postMessage({ type: 'click', x: '50%', y: '50%' }, '*');
                  } catch (e) {
                    console.log('Cross-origin iframe, cannot auto-click');
                  }
                }
              }, 1000);
            }}
            onError={() => {
              setIsLoading(false);
              setError('Failed to load game');
            }}
            allow="fullscreen; autoplay; encrypted-media; microphone; camera; payment; geolocation; accelerometer; gyroscope"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-pointer-lock allow-orientation-lock"
            style={{
              minHeight: '100vh',
              minWidth: '100vw',
              background: 'linear-gradient(135deg, #1477b0 0%, #264e69 100%)'
            }}
          />
        )}
      </div>

      {/* Floating mini controls - always visible in corner */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-lg p-1 border border-white/20 opacity-30 hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-white hover:bg-white/20 rounded transition-all duration-200"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </button>
        <button
          onClick={handleRefresh}
          className="p-1.5 text-white hover:bg-white/20 rounded transition-all duration-200"
          title="Refresh"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="p-1.5 text-white hover:bg-red-500/20 rounded transition-all duration-200"
          title="Close"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default GamePage;