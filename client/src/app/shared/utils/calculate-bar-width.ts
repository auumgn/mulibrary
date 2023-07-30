import { Album } from "../models/album.model";
import { IScrobble } from "../models/scrobble.model";
import { Track } from "../models/track.model";
// TODO: change scrobbles to "scrobbles: IScrobble[] | Track[] | Album[]" after playcount in models is renamed to scrobbles
export function calculateBarWidth(scrobbles: any, count: number | undefined): number {
  
  const maxCount: number = Math.max(...scrobbles.map((item: any) => (item.playcount ? item.playcount : item.scrobbles) || 0));
  if (!count || maxCount === 0) {
    return 0;
  }
  return (count / maxCount) * 100;
}
