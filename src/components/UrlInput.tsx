import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Search, X, Loader2, Clipboard, ArrowRight } from 'lucide-react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onSubmit(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      if (text.includes('instagram.com') || text.includes('instagr.am')) {
        onSubmit(text.trim());
      }
    } catch {
      // Clipboard API not available
    }
  };

  const handleClear = () => {
    setUrl('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-2xl mx-auto px-4"
    >
      {/* Hero Text */}
      <div className="text-center mb-8">
        <motion.h2
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight"
        >
          Download{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Instagram
          </span>{' '}
          Content
        </motion.h2>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-sm sm:text-base max-w-md mx-auto"
        >
          Reels, Posts, Stories, Carousels — all in HD quality.
          <br className="hidden sm:block" />
          No login required. 100% free.
        </motion.p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          className={`relative rounded-2xl transition-all duration-300 ${
            isFocused
              ? 'shadow-[0_0_0_2px] shadow-purple-500/50 bg-gray-800/80'
              : 'shadow-[0_0_0_1px] shadow-gray-700/50 bg-gray-800/50'
          }`}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center px-4 py-1">
            <div className={`transition-colors duration-200 ${isFocused ? 'text-purple-400' : 'text-gray-500'}`}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Link className="w-5 h-5" />
              )}
            </div>
            
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Paste Instagram URL here..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 px-3 py-3.5 text-sm sm:text-base font-medium"
              disabled={isLoading}
            />

            <div className="flex items-center gap-1.5">
              <AnimatePresence>
                {url && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
              
              {!url && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handlePaste}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-all"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Paste</span>
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!url.trim() || isLoading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  url.trim() && !isLoading
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40'
                    : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Loading</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                    <ArrowRight className="w-3.5 h-3.5 hidden sm:block" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </form>

      {/* Quick Examples */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 flex flex-wrap justify-center gap-2"
      >
        {['Posts', 'Reels', 'Carousels', 'Stories', 'IGTV'].map((type) => (
          <span
            key={type}
            className="px-3 py-1 rounded-full bg-gray-800/50 text-gray-500 text-xs font-medium border border-gray-800"
          >
            ✓ {type}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}
