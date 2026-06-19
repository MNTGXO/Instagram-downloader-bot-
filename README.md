# InstaGrab — Instagram Downloader Website & Telegram Bot

InstaGrab is a modern Instagram media downloader built with React, Vite, Tailwind CSS, and Vercel Serverless Functions. It includes a responsive website for downloading public Instagram media and a ready-to-deploy Telegram bot webhook that can send downloaded media directly in Telegram chats.

> **Respect creators:** Use this project only for content you own, have permission to download, or are allowed to save for personal use. InstaGrab does not bypass private profiles or Instagram privacy controls.

## Features

- **Website downloader** for public Instagram posts, reels, stories, IGTV, and carousel posts.
- **Telegram bot integration** using a Vercel serverless webhook.
- **No Instagram login required** for public content.
- **Carousel support** for multiple photos and videos.
- **Video and image downloads** with thumbnails and metadata where available.
- **Responsive UI** powered by React, Framer Motion, and Tailwind CSS.
- **Vercel-ready backend** with `/api/download` and `/api/telegram` functions.
- **Demo mode** to preview the UI when Instagram requests are blocked or unavailable.

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- Framer Motion
- Lucide React icons
- Vercel Serverless Functions
- Telegram Bot API

## Project Structure

```text
.
├── api/
│   ├── download.js      # Website download API proxy for Instagram GraphQL data
│   └── telegram.js      # Telegram bot webhook handler
├── public/
│   └── images/          # Static Open Graph/preview assets
├── src/
│   ├── components/      # UI sections and reusable components
│   ├── services/        # Instagram fetch/parsing helpers
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app shell
│   └── main.tsx         # React entry point
├── index.html
├── package.json
├── vercel.json
└── README.md
```

## Requirements

- Node.js 20 or newer recommended
- npm
- A Vercel account for production deployment
- A Telegram bot token from [@BotFather](https://t.me/BotFather) if you want to deploy the Telegram bot

## Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/Instagram-downloader-bot-.git
   cd Instagram-downloader-bot-
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL shown by Vite, usually:

   ```text
   http://localhost:5173
   ```

## Build for Production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deploy the Website on Vercel

This project is configured for Vercel. The included `vercel.json` routes the React app and the serverless API functions.

### Option 1: Deploy from the Vercel Dashboard

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com/new).
3. Import your GitHub repository.
4. Keep the default framework settings for Vite.
5. Deploy.

### Option 2: Deploy with Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

After deployment, your website will be available at a URL like:

```text
https://your-app.vercel.app
```

## API Endpoints

### `GET /api/download`

Fetches public Instagram media metadata and direct media URLs.

Query parameters:

- `url` — full Instagram URL
- `shortcode` — Instagram shortcode, if you already have it

Example:

```bash
curl "https://your-app.vercel.app/api/download?url=https://www.instagram.com/reel/SHORTCODE/"
```

Example response shape:

```json
{
  "success": true,
  "data": {
    "shortcode": "SHORTCODE",
    "typename": "GraphVideo",
    "caption": "Example caption",
    "owner": {
      "username": "instagram_user",
      "fullName": "Instagram User",
      "profilePicUrl": "https://...",
      "isVerified": false
    },
    "mediaItems": [
      {
        "type": "video",
        "url": "https://...",
        "thumbnailUrl": "https://...",
        "videoUrl": "https://..."
      }
    ]
  }
}
```

### `POST /api/telegram`

Telegram webhook endpoint. Telegram sends bot updates to this route after you set the webhook.

Health check in browser:

```text
https://your-app.vercel.app/api/telegram
```

## Deploy the Telegram Bot

### 1. Create a Telegram Bot

1. Open Telegram.
2. Message [@BotFather](https://t.me/BotFather).
3. Run `/newbot`.
4. Choose a bot name and username.
5. Copy the bot token.

### 2. Add Environment Variable on Vercel

In your Vercel project:

1. Go to **Settings** → **Environment Variables**.
2. Add this variable:

   ```text
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```

3. Redeploy the project after saving the variable.

### 3. Set the Webhook

Replace `<YOUR_BOT_TOKEN>` and `https://your-app.vercel.app` with your real values:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram"
```

Expected result:

```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### 4. Test the Bot

1. Open your bot in Telegram.
2. Send `/start`.
3. Send a public Instagram post, reel, TV, story, or carousel URL.
4. The bot should reply with the downloaded media or a helpful error message.

## Environment Variables

| Variable | Required | Used by | Description |
| --- | --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | Only for bot | `api/telegram.js` | Telegram bot token from BotFather. |

The website download API does not require a token by default.

## Supported Instagram URL Formats

- `https://www.instagram.com/p/SHORTCODE/`
- `https://www.instagram.com/reel/SHORTCODE/`
- `https://www.instagram.com/reels/SHORTCODE/`
- `https://www.instagram.com/tv/SHORTCODE/`
- `https://www.instagram.com/stories/username/STORY_ID/`
- `https://instagr.am/p/SHORTCODE/`

## Limitations

- Only public Instagram content is supported.
- Private, deleted, age-restricted, or region-restricted content may fail.
- Instagram may rate-limit or block requests temporarily.
- Browser-side requests can be affected by CORS, so production deployments should use the included Vercel API.
- Telegram media sending is subject to Telegram file size and URL fetching limits.

## Troubleshooting

### Website says the download failed

- Confirm the Instagram URL is public and valid.
- Try another public post or reel.
- Deploy the project to Vercel so the serverless API can proxy requests.
- Wait a few minutes if Instagram is rate-limiting requests.

### Telegram bot does not respond

- Confirm `TELEGRAM_BOT_TOKEN` is set in Vercel.
- Redeploy after adding the environment variable.
- Re-run the `setWebhook` command with your production deployment URL.
- Visit `/api/telegram` in the browser and confirm the function returns a running message.

### Telegram bot responds but media fails

- Try a public post with a smaller video.
- Check Vercel function logs.
- Confirm Instagram is not blocking or rate-limiting the request.

## Useful Commands

```bash
npm install       # Install dependencies
npm run dev       # Start local development server
npm run build     # Build production assets
npm run preview   # Preview production build locally
```

## Credits

Special thanks and credits to:

- Telegram channel: [t.me/mnbots](https://t.me/mnbots)
- Support: [t.me/mnbots_support](https://t.me/mnbots_support)
- GitHub: [github.com/mntgxo](https://github.com/mntgxo)
- Telegram: [t.me/mntgxo](https://t.me/mntgxo)

## License

This project is provided under the license included in the repository. See [`LICENSE`](./LICENSE) for details.
