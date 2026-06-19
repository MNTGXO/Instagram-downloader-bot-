import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  Terminal,
  Globe,
  Key,
  Webhook,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { generateTelegramBotCode, generateVercelApiCode } from '../services/instagram';

export default function TelegramBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bot' | 'api'>('bot');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = [
    {
      icon: Bot,
      title: 'Create Telegram Bot',
      desc: 'Message @BotFather on Telegram, use /newbot command, and get your bot token.',
      color: 'text-blue-400',
    },
    {
      icon: Globe,
      title: 'Deploy to Vercel',
      desc: 'Create a new Vercel project and add the api/telegram.js file to it.',
      color: 'text-green-400',
    },
    {
      icon: Key,
      title: 'Set Environment Variables',
      desc: 'Add TELEGRAM_BOT_TOKEN to your Vercel project environment variables.',
      color: 'text-yellow-400',
    },
    {
      icon: Webhook,
      title: 'Set Webhook',
      desc: 'Call the Telegram API to set your webhook URL to your Vercel deployment.',
      color: 'text-purple-400',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full max-w-4xl mx-auto px-4 mt-8 mb-16"
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.005 }}
        className="w-full flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 hover:border-blue-500/30 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              Telegram Bot Integration
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Pro
              </span>
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Deploy your own Instagram downloader bot on Telegram
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-5 rounded-2xl bg-gray-900/80 border border-gray-800/50 space-y-6">
              {/* Setup Steps */}
              <div>
                <h4 className="text-white font-bold text-sm mb-4">Quick Setup Guide</h4>
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <div key={step.title} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-800/80 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-500">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <step.icon className={`w-4 h-4 ${step.color}`} />
                          <h5 className="text-white font-semibold text-sm">{step.title}</h5>
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Webhook Setup Command */}
              <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Set Webhook URL
                  </span>
                  <button
                    onClick={() => handleCopy(
                      'https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram',
                      'webhook'
                    )}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    {copied === 'webhook' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === 'webhook' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <code className="text-xs text-green-400 break-all leading-relaxed font-mono">
                  https://api.telegram.org/bot&lt;YOUR_BOT_TOKEN&gt;/setWebhook?url=https://your-app.vercel.app/api/telegram
                </code>
              </div>

              {/* Code Tabs */}
              <div>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setActiveTab('bot')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'bot'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-gray-800/50 text-gray-500 border border-gray-700/30 hover:text-gray-300'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    api/telegram.js
                  </button>
                  <button
                    onClick={() => setActiveTab('api')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'api'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-gray-800/50 text-gray-500 border border-gray-700/30 hover:text-gray-300'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    api/download.js
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={() => handleCopy(
                        activeTab === 'bot' ? generateTelegramBotCode() : generateVercelApiCode(),
                        'code'
                      )}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 text-xs font-medium transition-colors"
                    >
                      {copied === 'code' ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Code
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-gray-950 border border-gray-800/50 overflow-x-auto max-h-80 text-xs text-gray-400 font-mono leading-relaxed custom-scrollbar">
                    <code>
                      {activeTab === 'bot'
                        ? generateTelegramBotCode().slice(0, 2000) + '\n\n// ... (click "Copy Code" to get full code)'
                        : generateVercelApiCode()
                      }
                    </code>
                  </pre>
                </div>
              </div>

              {/* Vercel Deploy */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span className="text-white font-medium">Pro Tip:</span>{' '}
                  Create a new directory, add these files to <code className="text-purple-400 bg-purple-500/10 px-1 rounded">api/</code> folder, 
                  then deploy with <code className="text-purple-400 bg-purple-500/10 px-1 rounded">vercel deploy</code>. 
                  The download API also serves as the backend for this website, solving CORS issues.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
