import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import UrlInput from './components/UrlInput';
import MediaCard from './components/MediaCard';
import ErrorMessage from './components/ErrorMessage';
import HowToUse from './components/HowToUse';
import Features from './components/Features';
import TelegramBot from './components/TelegramBot';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import DemoMode from './components/DemoMode';
import { fetchInstagramPost, isValidInstagramUrl } from './services/instagram';
import type { InstagramPost, DownloadState } from './types/instagram';

// Demo data for when API is blocked by CORS
const DEMO_POST: InstagramPost = {
  shortcode: 'DEMO123',
  typename: 'GraphSidecar',
  caption: '🌅 Beautiful sunset carousel post! This is a demo showing how InstaGrab handles multi-media carousel posts with both photos and videos. #instagrab #demo #sunset',
  owner: {
    username: 'instagrab_demo',
    fullName: 'InstaGrab Demo',
    profilePicUrl: '',
    isVerified: true,
    followersCount: 125000,
  },
  mediaItems: [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1350&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=800&fit=crop',
      width: 1080,
      height: 1350,
    },
    {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1080&h=1350&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=640&h=800&fit=crop',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      width: 1080,
      height: 1920,
    },
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1080&h=1350&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=640&h=800&fit=crop',
      width: 1080,
      height: 1350,
    },
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1470770841497-7b3909ac59e0?w=1080&h=1350&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1470770841497-7b3909ac59e0?w=640&h=800&fit=crop',
      width: 1080,
      height: 1350,
    },
  ],
  likeCount: 48293,
  commentCount: 1247,
  viewCount: 385000,
  videoDuration: 15.5,
  musicInfo: {
    artistName: 'Lo-Fi Beats',
    songName: 'Sunset Dreams',
  },
  timestamp: Math.floor(Date.now() / 1000) - 86400,
  productType: 'carousel_container',
  location: 'Swiss Alps',
};

function App() {
  const [state, setState] = useState<DownloadState>({ status: 'idle' });
  const [lastUrl, setLastUrl] = useState('');

  const handleSubmit = useCallback(async (url: string) => {
    if (!isValidInstagramUrl(url)) {
      setState({
        status: 'error',
        error: 'Please enter a valid Instagram URL (post, reel, story, or IGTV).',
      });
      return;
    }

    setLastUrl(url);
    setState({ status: 'loading' });

    try {
      const post = await fetchInstagramPost(url);
      setState({ status: 'success', data: post });
    } catch (error: any) {
      setState({
        status: 'error',
        error: error.message || 'Failed to download. Please check the URL and try again.',
      });
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastUrl) {
      handleSubmit(lastUrl);
    }
  }, [lastUrl, handleSubmit]);

  const handleUseDemoData = useCallback(() => {
    setState({ status: 'success', data: DEMO_POST });
  }, []);

  const handleReset = useCallback(() => {
    setState({ status: 'idle' });
    setLastUrl('');
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 font-['Inter',sans-serif] relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-pink-600/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 flex flex-col items-center pt-8 sm:pt-16 pb-8">
          <UrlInput onSubmit={handleSubmit} isLoading={state.status === 'loading'} />

          <AnimatePresence mode="wait">
            {state.status === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-12 flex flex-col items-center gap-4"
              >
                {/* Animated loading spinner */}
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-gray-800" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 border-r-pink-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-orange-500 border-l-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm font-medium">Fetching content...</p>
                  <p className="text-gray-600 text-xs mt-1">Analyzing Instagram post</p>
                </div>
              </motion.div>
            )}

            {state.status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ErrorMessage message={state.error || 'Unknown error'} onRetry={handleRetry} />
                <DemoMode onUseDemoData={handleUseDemoData} />
              </motion.div>
            )}

            {state.status === 'success' && state.data && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <MediaCard post={state.data} />
                
                {/* Download another button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center mt-6"
                >
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/30 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    ← Download Another
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {state.status === 'idle' && (
            <>
              <DemoMode onUseDemoData={handleUseDemoData} />
              <HowToUse />
              <Features />
              <TelegramBot />
              <FAQ />
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
