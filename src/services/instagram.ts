import type { InstagramPost, MediaItem } from '../types/instagram';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const X_IG_APP_ID = '936619743392459';
const LSD_TOKEN = 'AVqbxe3J_YA';

// Extract shortcode from Instagram URL
export function extractShortcode(url: string): string | null {
  const patterns = [
    /instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/stories\/[^/]+\/(\d+)/,
    /instagr\.am\/p\/([A-Za-z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

// Validate Instagram URL
export function isValidInstagramUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|reels|tv|stories)\//.test(url);
}

// Method 1: GraphQL API (No cookies needed)
async function fetchViaGraphQL(shortcode: string): Promise<any> {
  const params = new URLSearchParams({
    variables: JSON.stringify({ shortcode }),
    doc_id: '10015901848480474',
    lsd: LSD_TOKEN,
  });

  const response = await fetch('https://www.instagram.com/api/graphql', {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-IG-App-ID': X_IG_APP_ID,
      'X-FB-LSD': LSD_TOKEN,
      'X-ASBD-ID': '129477',
      'Sec-Fetch-Site': 'same-origin',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const json = await response.json();
  return json?.data?.xdt_shortcode_media;
}

// Method 2: Embed page fallback
async function fetchViaEmbed(shortcode: string): Promise<any> {
  const response = await fetch(`https://www.instagram.com/p/${shortcode}/embed/`, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Embed request failed: ${response.status}`);
  }

  const html = await response.text();
  
  // Try to extract media from embed page
  const videoMatch = html.match(/"video_url":"([^"]+)"/);
  const imageMatch = html.match(/"display_url":"([^"]+)"/) || html.match(/class="Content[^"]*"[^>]*>[^<]*<img[^>]+src="([^"]+)"/);
  const captionMatch = html.match(/"caption":"([^"]*)"/) || html.match(/<div class="Caption"[^>]*>.*?<a[^>]*>[^<]*<\/a>\s*([^<]*)/s);
  
  return {
    shortcode,
    video_url: videoMatch ? videoMatch[1].replace(/\\u0026/g, '&') : null,
    display_url: imageMatch ? imageMatch[1].replace(/\\u0026/g, '&') : null,
    caption: captionMatch ? captionMatch[1] : '',
    is_video: !!videoMatch,
  };
}

// Parse GraphQL response into our format
function parseGraphQLResponse(data: any): InstagramPost {
  const mediaItems: MediaItem[] = [];
  
  // Check for carousel (sidecar)
  const sidecarEdges = data?.edge_sidecar_to_children?.edges;
  
  if (sidecarEdges && sidecarEdges.length > 0) {
    for (const edge of sidecarEdges) {
      const node = edge.node;
      mediaItems.push({
        type: node.is_video ? 'video' : 'image',
        url: node.is_video ? (node.video_url || node.display_url) : node.display_url,
        thumbnailUrl: node.display_url,
        width: node.dimensions?.width,
        height: node.dimensions?.height,
        videoUrl: node.video_url,
      });
    }
  } else {
    // Single post/reel
    mediaItems.push({
      type: data.is_video ? 'video' : 'image',
      url: data.is_video ? (data.video_url || data.display_url) : data.display_url,
      thumbnailUrl: data.display_url,
      width: data.dimensions?.width,
      height: data.dimensions?.height,
      videoUrl: data.video_url,
    });
  }

  const caption = data.edge_media_to_caption?.edges?.[0]?.node?.text || '';

  return {
    shortcode: data.shortcode,
    typename: data.__typename || 'GraphImage',
    caption,
    owner: {
      username: data.owner?.username || 'unknown',
      fullName: data.owner?.full_name || '',
      profilePicUrl: data.owner?.profile_pic_url || '',
      isVerified: data.owner?.is_verified || false,
      followersCount: data.owner?.edge_followed_by?.count,
    },
    mediaItems,
    likeCount: data.edge_media_preview_like?.count,
    commentCount: data.edge_media_to_comment?.count || data.edge_media_preview_comment?.count,
    viewCount: data.video_view_count || data.video_play_count,
    videoDuration: data.video_duration,
    musicInfo: data.clips_music_attribution_info ? {
      artistName: data.clips_music_attribution_info.artist_name,
      songName: data.clips_music_attribution_info.song_name,
    } : undefined,
    timestamp: data.taken_at_timestamp,
    productType: data.product_type,
    location: data.location?.name,
  };
}

// Main fetch function with fallback strategy
export async function fetchInstagramPost(url: string): Promise<InstagramPost> {
  const shortcode = extractShortcode(url);
  if (!shortcode) {
    throw new Error('Invalid Instagram URL. Please provide a valid post, reel, or story URL.');
  }

  // Strategy: Try multiple third-party APIs as CORS-friendly alternatives
  const errors: string[] = [];

  // Try method: Third-party API services (CORS-friendly)
  try {
    const data = await fetchViaThirdParty(shortcode, url);
    if (data) return data;
  } catch (e: any) {
    errors.push(`Third-party API: ${e.message}`);
  }

  // Try GraphQL directly (may fail due to CORS in browser)
  try {
    const graphqlData = await fetchViaGraphQL(shortcode);
    if (graphqlData) {
      return parseGraphQLResponse(graphqlData);
    }
  } catch (e: any) {
    errors.push(`GraphQL: ${e.message}`);
  }

  // Try embed fallback
  try {
    const embedData = await fetchViaEmbed(shortcode);
    if (embedData) {
      return {
        shortcode,
        typename: embedData.is_video ? 'GraphVideo' : 'GraphImage',
        caption: embedData.caption || '',
        owner: {
          username: 'instagram_user',
          fullName: '',
          profilePicUrl: '',
          isVerified: false,
        },
        mediaItems: [{
          type: embedData.is_video ? 'video' : 'image',
          url: embedData.video_url || embedData.display_url || '',
          thumbnailUrl: embedData.display_url || '',
          videoUrl: embedData.video_url,
        }],
      };
    }
  } catch (e: any) {
    errors.push(`Embed: ${e.message}`);
  }

  throw new Error(
    `Unable to fetch Instagram content. This may be due to CORS restrictions in the browser. ` +
    `For production use, deploy the API backend on Vercel. Details: ${errors.join('; ')}`
  );
}

// Third-party API approach using public APIs
async function fetchViaThirdParty(shortcode: string, _originalUrl: string): Promise<InstagramPost | null> {
  // Try using a public CORS proxy or serverless function approach
  // In production, this would be your own Vercel serverless function
  
  // Attempt 1: Try the direct oembed API (limited but CORS-friendly)
  try {
    const oembedUrl = `https://api.instagram.com/oembed/?url=https://www.instagram.com/p/${shortcode}/`;
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = await response.json();
      return {
        shortcode,
        typename: 'GraphImage',
        caption: data.title || '',
        owner: {
          username: data.author_name || 'unknown',
          fullName: data.author_name || '',
          profilePicUrl: '',
          isVerified: false,
        },
        mediaItems: [{
          type: 'image',
          url: data.thumbnail_url || '',
          thumbnailUrl: data.thumbnail_url || '',
        }],
      };
    }
  } catch {
    // Continue to next method
  }

  return null;
}

// Generate Telegram bot webhook handler code
export function generateTelegramBotCode(): string {
  return `// api/telegram.js - Vercel Serverless Function for Telegram Bot
// Deploy this file to your Vercel project's /api directory

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const X_IG_APP_ID = '936619743392459';
const LSD_TOKEN = 'AVqbxe3J_YA';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function extractShortcode(url) {
  const patterns = [
    /instagram\\.com\\/(?:p|reel|reels|tv)\\/([A-Za-z0-9_-]+)/,
    /instagram\\.com\\/stories\\/[^/]+\\/(\\d+)/,
    /instagr\\.am\\/p\\/([A-Za-z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

async function fetchInstagramData(shortcode) {
  const params = new URLSearchParams({
    variables: JSON.stringify({ shortcode }),
    doc_id: '10015901848480474',
    lsd: LSD_TOKEN,
  });

  const response = await fetch('https://www.instagram.com/api/graphql', {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-IG-App-ID': X_IG_APP_ID,
      'X-FB-LSD': LSD_TOKEN,
      'X-ASBD-ID': '129477',
      'Sec-Fetch-Site': 'same-origin',
    },
    body: params.toString(),
  });

  if (!response.ok) throw new Error('Failed to fetch');
  const json = await response.json();
  return json?.data?.xdt_shortcode_media;
}

async function sendTelegramMessage(chatId, text, parseMode = 'HTML') {
  await fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendMessage\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  });
}

async function sendTelegramPhoto(chatId, photoUrl, caption = '') {
  await fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendPhoto\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption: caption.slice(0, 1024) }),
  });
}

async function sendTelegramVideo(chatId, videoUrl, caption = '', thumbUrl = '') {
  await fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendVideo\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      video: videoUrl,
      caption: caption.slice(0, 1024),
      thumb: thumbUrl,
      supports_streaming: true,
    }),
  });
}

async function sendMediaGroup(chatId, mediaItems, caption = '') {
  const media = mediaItems.map((item, i) => ({
    type: item.type === 'video' ? 'video' : 'photo',
    media: item.type === 'video' ? (item.videoUrl || item.url) : item.url,
    ...(i === 0 ? { caption: caption.slice(0, 1024) } : {}),
  }));

  await fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendMediaGroup\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, media }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Bot is running' });
  }

  try {
    const { message } = req.body;
    if (!message?.text) return res.status(200).json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text.trim();

    if (text === '/start') {
      await sendTelegramMessage(chatId,
        '🎬 <b>InstaGrab Bot</b>\\n\\n' +
        'Send me any Instagram link and I\\'ll download it for you!\\n\\n' +
        '✅ Supported:\\n' +
        '• Posts (single & carousel)\\n' +
        '• Reels\\n' +
        '• IGTV\\n' +
        '• Stories\\n\\n' +
        'Just paste the link! 🔗'
      );
      return res.status(200).json({ ok: true });
    }

    const shortcode = extractShortcode(text);
    if (!shortcode) {
      await sendTelegramMessage(chatId, '❌ Please send a valid Instagram URL.');
      return res.status(200).json({ ok: true });
    }

    await sendTelegramMessage(chatId, '⏳ Downloading...');

    const data = await fetchInstagramData(shortcode);
    if (!data) {
      await sendTelegramMessage(chatId, '❌ Could not fetch this content. It may be private.');
      return res.status(200).json({ ok: true });
    }

    const caption = \`📸 @\${data.owner?.username || 'unknown'}\\n\${(data.edge_media_to_caption?.edges?.[0]?.node?.text || '').slice(0, 800)}\`;

    // Handle carousel
    const sidecar = data.edge_sidecar_to_children?.edges;
    if (sidecar && sidecar.length > 1) {
      const mediaItems = sidecar.map(edge => ({
        type: edge.node.is_video ? 'video' : 'image',
        url: edge.node.display_url,
        videoUrl: edge.node.video_url,
      }));
      await sendMediaGroup(chatId, mediaItems, caption);
    } else if (data.is_video && data.video_url) {
      await sendTelegramVideo(chatId, data.video_url, caption, data.display_url);
    } else {
      await sendTelegramPhoto(chatId, data.display_url, caption);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Bot error:', error);
    return res.status(200).json({ ok: true });
  }
}`;
}

// Generate Vercel API route code
export function generateVercelApiCode(): string {
  return `// api/download.js - Vercel Serverless Function for Instagram Download API
// This handles CORS and acts as a proxy to Instagram's GraphQL API

const X_IG_APP_ID = '936619743392459';
const LSD_TOKEN = 'AVqbxe3J_YA';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, shortcode } = req.query;
  
  if (!shortcode && !url) {
    return res.status(400).json({ error: 'Missing shortcode or url parameter' });
  }

  const code = shortcode || extractShortcode(url);
  if (!code) {
    return res.status(400).json({ error: 'Invalid Instagram URL' });
  }

  try {
    const params = new URLSearchParams({
      variables: JSON.stringify({ shortcode: code }),
      doc_id: '10015901848480474',
      lsd: LSD_TOKEN,
    });

    const response = await fetch('https://www.instagram.com/api/graphql', {
      method: 'POST',
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-IG-App-ID': X_IG_APP_ID,
        'X-FB-LSD': LSD_TOKEN,
        'X-ASBD-ID': '129477',
        'Sec-Fetch-Site': 'same-origin',
      },
      body: params.toString(),
    });

    const json = await response.json();
    const data = json?.data?.xdt_shortcode_media;

    if (!data) {
      return res.status(404).json({ error: 'Content not found or private' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch Instagram content' });
  }
}

function extractShortcode(url) {
  if (!url) return null;
  const patterns = [
    /instagram\\.com\\/(?:p|reel|reels|tv)\\/([A-Za-z0-9_-]+)/,
    /instagram\\.com\\/stories\\/[^/]+\\/(\\d+)/,
    /instagr\\.am\\/p\\/([A-Za-z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}`;
}
