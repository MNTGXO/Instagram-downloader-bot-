// api/telegram.js - Vercel Serverless Function for Telegram Bot
// Deploy this file to your Vercel project's /api directory
// Set TELEGRAM_BOT_TOKEN in your Vercel environment variables
// Then set webhook: https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const X_IG_APP_ID = '936619743392459';
const LSD_TOKEN = 'AVqbxe3J_YA';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function extractShortcode(url) {
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

function findInstagramUrl(text) {
  const urlPattern = /https?:\/\/(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:p|reel|reels|tv|stories)\/[A-Za-z0-9_-]+\/?[^\s]*/i;
  const match = text.match(urlPattern);
  return match ? match[0] : null;
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

  if (!response.ok) throw new Error(`Instagram API error: ${response.status}`);
  const json = await response.json();
  return json?.data?.xdt_shortcode_media;
}

async function telegramApi(method, body) {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
}

async function sendMessage(chatId, text, options = {}) {
  return telegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...options,
  });
}

async function sendPhoto(chatId, photoUrl, caption = '') {
  return telegramApi('sendPhoto', {
    chat_id: chatId,
    photo: photoUrl,
    caption: caption.slice(0, 1024),
    parse_mode: 'HTML',
  });
}

async function sendVideo(chatId, videoUrl, caption = '', thumbUrl = '') {
  return telegramApi('sendVideo', {
    chat_id: chatId,
    video: videoUrl,
    caption: caption.slice(0, 1024),
    parse_mode: 'HTML',
    thumb: thumbUrl || undefined,
    supports_streaming: true,
  });
}

async function sendMediaGroup(chatId, mediaItems, caption = '') {
  const media = mediaItems.slice(0, 10).map((item, i) => ({
    type: item.is_video ? 'video' : 'photo',
    media: item.is_video ? (item.video_url || item.display_url) : item.display_url,
    ...(i === 0 ? { caption: caption.slice(0, 1024), parse_mode: 'HTML' } : {}),
  }));

  return telegramApi('sendMediaGroup', {
    chat_id: chatId,
    media,
  });
}

async function sendChatAction(chatId, action = 'upload_photo') {
  return telegramApi('sendChatAction', {
    chat_id: chatId,
    action,
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({
      ok: true,
      message: 'InstaGrab Telegram Bot is running! 🚀',
      usage: 'Set this URL as your Telegram bot webhook.',
    });
  }

  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not set');
    return res.status(500).json({ error: 'Bot token not configured' });
  }

  try {
    const update = req.body;
    const message = update?.message;

    if (!message?.text) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const firstName = message.from?.first_name || 'there';

    // Handle /start command
    if (text === '/start') {
      await sendMessage(chatId,
        `👋 <b>Hey ${firstName}!</b>\n\n` +
        `🎬 I'm <b>InstaGrab Bot</b> — your personal Instagram downloader!\n\n` +
        `Just send me any Instagram link and I'll download it for you.\n\n` +
        `<b>✅ What I support:</b>\n` +
        `📸 Posts (single & carousel)\n` +
        `🎬 Reels\n` +
        `📖 Stories\n` +
        `📺 IGTV\n` +
        `🎠 Multi-photo/video carousels\n\n` +
        `<b>🔗 Just paste the link!</b>`
      );
      return res.status(200).json({ ok: true });
    }

    // Handle /help command
    if (text === '/help') {
      await sendMessage(chatId,
        `<b>📖 InstaGrab Bot Help</b>\n\n` +
        `<b>How to use:</b>\n` +
        `1. Open Instagram app\n` +
        `2. Find the post/reel/story you want\n` +
        `3. Tap the share button (⤴️)\n` +
        `4. Copy the link\n` +
        `5. Paste it here!\n\n` +
        `<b>Supported URL formats:</b>\n` +
        `• instagram.com/p/...\n` +
        `• instagram.com/reel/...\n` +
        `• instagram.com/reels/...\n` +
        `• instagram.com/tv/...\n` +
        `• instagram.com/stories/...\n\n` +
        `⚠️ Only <b>public</b> content can be downloaded.`
      );
      return res.status(200).json({ ok: true });
    }

    // Look for Instagram URL
    const igUrl = findInstagramUrl(text);
    if (!igUrl) {
      if (text.includes('instagram') || text.includes('instagr')) {
        await sendMessage(chatId, '❌ That doesn\'t look like a valid Instagram URL.\n\nPlease send a full link like:\n<code>https://www.instagram.com/reel/xxxxx/</code>');
      } else {
        await sendMessage(chatId,
          '🔗 Send me an Instagram link to download!\n\nExamples:\n' +
          '• <code>https://www.instagram.com/p/xxxxx/</code>\n' +
          '• <code>https://www.instagram.com/reel/xxxxx/</code>\n\n' +
          'Type /help for more info.'
        );
      }
      return res.status(200).json({ ok: true });
    }

    const shortcode = extractShortcode(igUrl);
    if (!shortcode) {
      await sendMessage(chatId, '❌ Could not parse that Instagram URL. Please try again.');
      return res.status(200).json({ ok: true });
    }

    // Show typing/uploading indicator
    await sendChatAction(chatId, 'upload_document');

    // Fetch Instagram data
    let data;
    try {
      data = await fetchInstagramData(shortcode);
    } catch (error) {
      console.error('Fetch error:', error);
      await sendMessage(chatId,
        '❌ <b>Download failed!</b>\n\n' +
        'Possible reasons:\n' +
        '• The content is from a private account\n' +
        '• The post was deleted\n' +
        '• Instagram is temporarily blocking requests\n\n' +
        'Please try again in a moment.'
      );
      return res.status(200).json({ ok: true });
    }

    if (!data) {
      await sendMessage(chatId, '❌ Content not found. It may be private or deleted.');
      return res.status(200).json({ ok: true });
    }

    // Build caption
    const owner = data.owner?.username || 'unknown';
    const postCaption = data.edge_media_to_caption?.edges?.[0]?.node?.text || '';
    const truncatedCaption = postCaption.length > 600 ? postCaption.slice(0, 600) + '...' : postCaption;
    const caption = `📸 <b>@${owner}</b>\n${truncatedCaption ? '\n' + truncatedCaption : ''}`;

    // Handle different media types
    const sidecar = data.edge_sidecar_to_children?.edges;

    try {
      if (sidecar && sidecar.length > 1) {
        // Carousel - send as media group (max 10 items per Telegram)
        await sendMediaGroup(chatId, sidecar.map(e => e.node), caption);
      } else if (data.is_video && data.video_url) {
        // Single video/reel
        await sendVideo(chatId, data.video_url, caption, data.display_url);
      } else if (data.display_url) {
        // Single photo
        await sendPhoto(chatId, data.display_url, caption);
      } else {
        await sendMessage(chatId, '❌ No downloadable media found in this post.');
      }
    } catch (sendError) {
      console.error('Send media error:', sendError);
      // Fallback: send URLs as text
      const urls = [];
      if (sidecar) {
        sidecar.forEach((edge, i) => {
          const node = edge.node;
          const mediaUrl = node.is_video ? (node.video_url || node.display_url) : node.display_url;
          urls.push(`${i + 1}. ${node.is_video ? '🎬' : '📸'} ${mediaUrl}`);
        });
      } else {
        urls.push(data.is_video ? `🎬 ${data.video_url}` : `📸 ${data.display_url}`);
      }

      await sendMessage(chatId,
        `${caption}\n\n` +
        `<b>📥 Download links:</b>\n` +
        urls.join('\n')
      );
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Bot error:', error);
    return res.status(200).json({ ok: true });
  }
}
