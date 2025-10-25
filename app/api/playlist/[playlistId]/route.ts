import { NextRequest, NextResponse } from "next/server";

type PlaylistVideo = {
  videoId: string;
  title: string;
  thumbnail: string;
};

// Fetch playlist videos from YouTube using server-side headers
async function fetchPlaylistVideos(playlistId: string): Promise<PlaylistVideo[]> {
  try {
    const url = `https://www.youtube.com/playlist?list=${playlistId}&disable_polymer=true`;
    const resp = await fetch("https://corsproxy.io/?" + encodeURIComponent(url), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.90 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = await resp.text();
    const videos: PlaylistVideo[] = [];

    // Extract videoIds
    const videoPattern = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    const titlePattern = /"title":{"runs":\[{"text":"(.*?)"}\]}/g;

    const ids: string[] = [];
    const titles: string[] = [];

    let match;
    while ((match = videoPattern.exec(html))) {
      if (!ids.includes(match[1])) ids.push(match[1]);
    }

    let titleMatch;
    while ((titleMatch = titlePattern.exec(html))) {
      titles.push(titleMatch[1]);
    }

    for (let i = 0; i < ids.length; i++) {
      videos.push({
        videoId: ids[i],
        title: titles[i] || `Video ${i + 1}`,
        thumbnail: `https://img.youtube.com/vi/${ids[i]}/mqdefault.jpg`,
      });
    }

    return videos;
  } catch (err) {
    console.error("Error fetching playlist:", err);
    return [];
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  const { playlistId } = params;

  const videos = await fetchPlaylistVideos(playlistId);

  return NextResponse.json({ videos });
}