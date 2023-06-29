import { IScrobble } from "../models/scrobble.model";
import { Track } from "../models/track.model";

export function calculateBarWidth(scrobbles: IScrobble[] | Track[], count: number | undefined): number {
  const maxCount: number = Math.max(...scrobbles.map((track) => track.playcount || 0));
  if (!count || maxCount === 0) {
    return 0;
  }
  return (count / maxCount) * 100;
}
