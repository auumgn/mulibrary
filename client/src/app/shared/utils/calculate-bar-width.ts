import { IScrobble } from "../models/scrobble.model";

export function calculateBarWidth(scrobbles: IScrobble[], count: number | undefined): number {
  const maxCount: number = Math.max(...scrobbles.map((track) => track.count || 0));
  if (!count || maxCount === 0) {
    return 0;
  }
  return (count / maxCount) * 100;
}
