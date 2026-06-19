import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Is InstaGrab free to use?',
    a: 'Yes! InstaGrab is completely free with no hidden charges, no ads, and no download limits.',
  },
  {
    q: 'Do I need an Instagram account?',
    a: 'No. InstaGrab works without any login or Instagram credentials. We only access publicly available content.',
  },
  {
    q: 'What content types are supported?',
    a: 'We support Posts (single images/videos), Reels, Carousels (multi-photo/video posts), Stories, and IGTV videos.',
  },
  {
    q: 'Can I download private account content?',
    a: 'No. InstaGrab only works with public Instagram profiles. We cannot and do not bypass privacy settings.',
  },
  {
    q: 'What quality are the downloads?',
    a: 'All media is downloaded in the highest resolution available — typically 1080p for videos and full resolution for images.',
  },
  {
    q: 'How does the Telegram bot work?',
    a: 'You can deploy your own Telegram bot using the provided Vercel serverless function code. Just send any Instagram link to your bot and it will download and send the content directly in the chat.',
  },
  {
    q: 'Is this legal?',
    a: 'InstaGrab accesses only publicly available content. However, please respect content creators\' rights and only download content for personal use.',
  },
  {
    q: 'Why might some downloads fail?',
    a: 'Downloads may fail if the content is from a private account, has been deleted, or if Instagram temporarily rate-limits requests. Try again after a few minutes.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="w-full max-w-2xl mx-auto px-4 mt-16 mb-12"
    >
      <div className="flex items-center justify-center gap-2 mb-8">
        <HelpCircle className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Frequently Asked Questions</h3>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.05 }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-800/30 hover:border-gray-700/50 transition-all text-left group"
            >
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors pr-4">
                {faq.q}
              </span>
              <motion.div
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="px-4 py-3 text-sm text-gray-500 leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
