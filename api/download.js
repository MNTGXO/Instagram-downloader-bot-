// api/download.js - Vercel Serverless Function for Instagram Download API
// This handles CORS and acts as a proxy to Instagram's GraphQL API
// Deploy this alongside the frontend for full functionality

const X_IG_APP_ID = '936619743392459';
const LSD_TOKEN = 'AVqbxe3J_YA';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function extractShortcode(url) {
  if (!url) return null;
  const patterns = [
    /instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/stories\/[^/]+\/(\d+)/,
    /instagr\.am\/p\/([A-Za-z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

function parseMediaItems(data) {
  const items = [];
  const sidecar = data.edge_sidecar_to_children;

  if (sidecar && sidecar.edges && sidecar.edges.length > 0) {
    for (const edge of sidecar.edges) {
      const node = edge.node;
      items.push({
        type: node.is_video ? 'video' : 'image',
        url: node.is_video ? (node.video_url || node.display_url) : node.display_url,
        thumbnailUrl: node.display_url,
        width: node.dimensions ? node.dimensions.width : undefined,
        height: node.dimensions ? node.dimensions.height : undefined,
        videoUrl: node.video_url || undefined,
      });
    }
  } else {
    items.push({
      type: data.is_video ? 'video' : 'image',
      url: data.is_video ? (data.video_url || data.display_url) : data.display_url,
      thumbnailUrl: data.display_url,
      width: data.dimensions ? data.dimensions.width : undefined,
      height: data.dimensions ? data.dimensions.height : undefined,
      videoUrl: data.video_url || undefined,
    });
  }

  return items;
}

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

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Instagram API returned ${response.status}`,
      });
    }

    const json = await response.json();
    const data = json?.data?.xdt_shortcode_media;

    if (!data) {
      return res.status(404).json({ error: 'Content not found or private' });
    }

    const caption = data.edge_media_to_caption?.edges?.[0]?.node?.text || '';
    const mediaItems = parseMediaItems(data);

    const result = {
      success: true,
      data: {
        shortcode: data.shortcode,
        typename: data.__typename,
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
      },
    };

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(result);
  } catch (error) {
    console.error('Download API error:', error);
    return res.status(500).json({ error: 'Failed to fetch Instagram content' });
  }
}
