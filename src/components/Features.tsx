import { motion } from 'framer-motion';
import {
  Zap,
  Shield,
  Infinity,
  Smartphone,
  Film,
  Images,
  BookOpen,
  MonitorPlay,
} from 'lucide-react';

const features = [
  {
    icon: Film,
    title: 'Reels',
    desc: 'Download Reels in full HD quality',
    color: 'from-pink-500 to-red-500',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Images,
    title: 'Carousels',
    desc: 'All photos & videos in one click',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: BookOpen,
    title: 'Stories',
    desc: 'Save stories before they vanish',
    color: 'from-orange-500 to-yellow-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: MonitorPlay,
    title: 'IGTV',
    desc: 'Long-form videos with ease',
    color: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Zap,
    title: 'Blazing Fast',
    desc: 'Powered by edge functions',
    color: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: Shield,
    title: 'No Login',
    desc: 'Zero credentials required',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-500/10',
  },
  {
    icon: Infinity,
    title: 'Unlimited',
    desc: 'No download limits ever',
    color: 'from-indigo-500 to-blue-500',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: Smartphone,
    title: 'All Devices',
    desc: 'Works on any device & browser',
    color: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-500/10',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function Features() {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-4xl mx-auto px-4 mt-16 mb-12"
    >
      <motion.h3
        variants={item}
        className="text-center text-lg font-bold text-white mb-8"
      >
        Everything You Need
      </motion.h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={item}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`relative p-4 rounded-2xl ${feature.bg} border border-gray-800/30 backdrop-blur-sm cursor-default group`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-white font-semibold text-sm mb-0.5">{feature.title}</h4>
            <p className="text-gray-500 text-xs leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
