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

    if (!resp.ok) {
      throw new Error(`Failed to fetch playlist, status: ${resp.status}`);
    }

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

    const count = Math.min(ids.length, titles.length);

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
  context: { params: any }
): Promise<NextResponse> {
  const params = await context.params;
  const { playlistId } = params;

  try {
    const videos = await fetchPlaylistVideos(playlistId);
    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json({ videos: [] }, { status: 500 });
  }
}