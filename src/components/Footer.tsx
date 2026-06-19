import { motion } from 'framer-motion';
import { Heart, Download, Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="w-full border-t border-gray-800/30 mt-8"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
              <Download className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-400">
              Insta<span className="text-purple-400">Grab</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>No cookies needed</span>
            <span>•</span>
            <span>Vercel-powered</span>
            <span>•</span>
            <span>Open Source</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#"
              className="p-2 rounded-lg bg-gray-800/50 text-gray-500 hover:text-white transition-colors"
              title="GitHub"
            >
              <Code2 className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800/20 text-center">
          <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the community
          </p>
          <p className="text-[10px] text-gray-700 mt-1">
            Not affiliated with Instagram or Meta. For personal use only. Respect content creators' rights.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
