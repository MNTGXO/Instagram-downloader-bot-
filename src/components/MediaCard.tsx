import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Play,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Eye,
  Music,
  MapPin,
  ExternalLink,
  CheckCircle,
  Copy,
  Clock,
  User,
} from 'lucide-react';
import type { InstagramPost, MediaItem } from '../types/instagram';

interface MediaCardProps {
  post: InstagramPost;
}

export default function MediaCard({ post }: MediaCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const currentMedia = post.mediaItems[currentIndex];
  const isCarousel = post.mediaItems.length > 1;

  const handlePrev = () => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : post.mediaItems.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((i) => (i < post.mediaItems.length - 1 ? i + 1 : 0));
  };

  const handleDownload = async (item: MediaItem, index: number) => {
    const downloadUrl = item.type === 'video' ? (item.videoUrl || item.url) : item.url;
    if (!downloadUrl) return;

    try {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = `instagrab_${post.shortcode}_${index + 1}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleDownloadAll = () => {
    post.mediaItems.forEach((item, index) => {
      setTimeout(() => handleDownload(item, index), index * 500);
    });
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(post.caption).then(() => {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    });
  };

  const formatCount = (count?: number) => {
    if (!count) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeLabel = () => {
    if (isCarousel) return 'Carousel';
    if (post.productType === 'clips') return 'Reel';
    if (post.productType === 'igtv') return 'IGTV';
    if (post.typename === 'GraphVideo') return 'Video';
    return 'Post';
  };

  const getTypeColor = () => {
    const type = getTypeLabel();
    switch (type) {
      case 'Reel': return 'from-pink-500 to-red-500';
      case 'Carousel': return 'from-blue-500 to-purple-500';
      case 'IGTV': return 'from-orange-500 to-yellow-500';
      case 'Video': return 'from-green-500 to-teal-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto px-4 mt-8"
    >
      <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800/50 overflow-hidden shadow-2xl">
        {/* Post Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              {post.owner.profilePicUrl ? (
                <img
                  src={post.owner.profilePicUrl}
                  alt={post.owner.username}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center ${post.owner.profilePicUrl ? 'hidden' : ''}`}>
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-semibold text-sm">@{post.owner.username}</span>
                {post.owner.isVerified && (
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {post.owner.fullName && <span>{post.owner.fullName}</span>}
                {post.owner.followersCount && (
                  <span>• {formatCount(post.owner.followersCount)} followers</span>
                )}
              </div>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full bg-gradient-to-r ${getTypeColor()} text-white text-xs font-bold`}>
            {getTypeLabel()}
          </div>
        </div>

        {/* Media Preview */}
        <div className="relative bg-black aspect-square max-h-[500px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex items-center justify-center"
            >
              {currentMedia?.type === 'video' && currentMedia.videoUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={currentMedia.thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-contain"
                    onError={() => setImageError(prev => ({ ...prev, [currentIndex]: true }))}
                  />
                  {!imageError[currentIndex] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                      </div>
                    </div>
                  )}
                  {post.videoDuration && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 text-white text-xs font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(post.videoDuration)}
                    </div>
                  )}
                </div>
              ) : (
                <img
                  src={currentMedia?.url || currentMedia?.thumbnailUrl}
                  alt="Post media"
                  className="w-full h-full object-contain"
                  onError={() => setImageError(prev => ({ ...prev, [currentIndex]: true }))}
                />
              )}
              {imageError[currentIndex] && (
                <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                  <ImageIcon className="w-16 h-16" />
                  <span className="text-sm">Preview unavailable</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Carousel Navigation */}
          {isCarousel && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.mediaItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === currentIndex
                        ? 'w-4 bg-white'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>

              {/* Counter */}
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs font-medium">
                {currentIndex + 1}/{post.mediaItems.length}
              </div>
            </>
          )}

          {/* Media type badge */}
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs">
              {currentMedia?.type === 'video' ? (
                <Video className="w-3 h-3" />
              ) : (
                <ImageIcon className="w-3 h-3" />
              )}
              <span className="capitalize">{currentMedia?.type}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-800/50">
          {post.likeCount !== undefined && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium">{formatCount(post.likeCount)}</span>
            </div>
          )}
          {post.commentCount !== undefined && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">{formatCount(post.commentCount)}</span>
            </div>
          )}
          {post.viewCount !== undefined && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <Eye className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">{formatCount(post.viewCount)}</span>
            </div>
          )}
          {post.musicInfo && (
            <div className="flex items-center gap-1.5 text-gray-400 ml-auto">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs truncate max-w-[120px]">
                {post.musicInfo.songName} - {post.musicInfo.artistName}
              </span>
            </div>
          )}
        </div>

        {/* Caption & Meta */}
        <div className="px-4 py-3 space-y-2">
          {post.caption && (
            <div className="relative">
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                <span className="font-semibold text-white">@{post.owner.username}</span>{' '}
                {post.caption}
              </p>
              <button
                onClick={handleCopyCaption}
                className="inline-flex items-center gap-1 mt-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                {copiedCaption ? (
                  <>
                    <CheckCircle className="w-3 h-3" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy caption
                  </>
                )}
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {post.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {post.location}
              </span>
            )}
            {post.timestamp && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDate(post.timestamp)}
              </span>
            )}
          </div>
        </div>

        {/* Download Buttons */}
        <div className="p-4 border-t border-gray-800/50 space-y-3">
          {/* Individual downloads for carousel */}
          {isCarousel && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {post.mediaItems.length} files in this carousel
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                {post.mediaItems.map((item, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload(item, i)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      i === currentIndex
                        ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                        : 'bg-gray-800/50 border border-gray-700/30 text-gray-400 hover:text-white hover:border-gray-600'
                    }`}
                  >
                    {item.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                    <span>{item.type === 'video' ? 'Video' : 'Photo'} {i + 1}</span>
                    <Download className="w-3 h-3 ml-auto" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Main Download Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={isCarousel ? handleDownloadAll : () => handleDownload(currentMedia, 0)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold text-sm shadow-xl shadow-purple-600/20 hover:shadow-purple-600/30 transition-shadow"
          >
            <Download className="w-5 h-5" />
            {isCarousel ? `Download All (${post.mediaItems.length} files)` : 'Download HD'}
          </motion.button>

          {/* Open in Instagram */}
          <a
            href={`https://www.instagram.com/p/${post.shortcode}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/30 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Instagram
          </a>
        </div>
      </div>
    </motion.div>
  );
}
