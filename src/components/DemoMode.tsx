import { motion } from 'framer-motion';
import { Info, ExternalLink, Server, Code2 } from 'lucide-react';

interface DemoModeProps {
  onUseDemoData: () => void;
}

export default function DemoMode({ onUseDemoData }: DemoModeProps) {
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="w-full max-w-2xl mx-auto px-4 mt-6"
    >
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="text-amber-300 font-semibold text-sm mb-1">Browser Limitations</h4>
              <p className="text-amber-400/60 text-xs leading-relaxed">
                Direct Instagram API calls from the browser are blocked by CORS. For full functionality, deploy the backend API to Vercel.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onUseDemoData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                Try Demo Preview
              </button>
              
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 text-xs font-medium transition-colors"
              >
                <Server className="w-3.5 h-3.5" />
                Deploy Backend
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
