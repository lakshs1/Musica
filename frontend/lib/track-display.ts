export function trimTrackTitle(title: string): string {
  const withoutBrackets = title
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^)]*(official|video|lyrics|lyric|audio|visualizer|mv|hd|4k)[^)]*\)/gi, '')
    .replace(/official\s+(video|audio|lyrics?)/gi, '')
    .replace(/full\s+video/gi, '')
    .replace(/video\s+song/gi, '')
    .replace(/lyrical\s+video/gi, '')
    .replace(/music\s+video/gi, '');

  const primary = withoutBrackets
    .replace(/\s+[|:•].*$/g, '')
    .replace(/\s+-\s+(official.*|lyrics?.*|audio.*|video.*|hd.*|4k.*)$/gi, '')
    .trim();

  return primary.replace(/\s+/g, ' ').trim() || title.trim();
}
