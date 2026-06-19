import { motion } from 'framer-motion';
import { Link, Search, Download, ArrowDown } from 'lucide-react';

const steps = [
  {
    icon: Link,
    title: 'Copy the Link',
    desc: 'Open Instagram, find the post/reel/story you want, and copy its share link.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Search,
    title: 'Paste & Search',
    desc: 'Paste the Instagram URL into the search box above and click Download.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Download,
    title: 'Download',
    desc: 'Choose individual files or download all at once in HD quality.',
    color: 'from-pink-500 to-orange-500',
  },
];

export default function HowToUse() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full max-w-3xl mx-auto px-4 mt-14"
    >
      <h3 className="text-center text-lg font-bold text-white mb-8">How It Works</h3>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {steps.map((step, i) => (
          <div key={step.title} className="flex flex-col sm:flex-row items-center gap-4 flex-1">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="flex flex-col items-center text-center p-5 rounded-2xl bg-gray-900/50 border border-gray-800/30 flex-1 w-full"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 shadow-lg`}>
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                <span className="text-xs font-bold text-gray-400">{i + 1}</span>
              </div>
              <h4 className="text-white font-semibold text-sm mb-1">{step.title}</h4>
              <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
            </motion.div>
            
            {i < steps.length - 1 && (
              <ArrowDown className="w-4 h-4 text-gray-700 sm:rotate-[-90deg] flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
