import fetch from 'node-fetch';
import * as config from '../controllers/config.json';
import { deleteScrobblesAndTimestamp, getLatestScrobbleTimestamp, getRecentTimestamp, insertScrobble, insertSyncTimestamp, rollbackScrobbleImport, addPlaycount} from '../controllers/database-access';
import { IRecentTracks, Scrobble } from '../models/lastfm.model';

export const getToken = async () => {
  return await fetch(`https://ws.audioscrobbler.com/2.0/?method=auth.gettoken&api_key=${config.lastfm_api_key}&format=json`).then(response => response.json())
    .then(json => { return json })
    .catch(err => console.error(err));
}

export const getSession = async () => {
  fetch(`https://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=${config.lastfm_api_key}&token=FCnt6ZrXPKkdhNWoaM0vX9z-ddZY0HTI`).then(response => response.json())
    .then(json => { console.log(json) })
    .catch(err => console.error(err));
}

export const getTracks = async () => {
  let timestamp = 0;
  let scrobbleTimestamp = 0;
  const tsRes: any = await getRecentTimestamp();
  const tsScrobbleRes: any = await getLatestScrobbleTimestamp();
  if (tsRes.length > 0) {
    timestamp = tsRes[0].timestamp / 1000;
  }
  if (tsScrobbleRes.length > 0) {
    scrobbleTimestamp = tsScrobbleRes[0].timestamp / 1000;
  }
  try {
    //await insertSyncTimestamp(Date.now());
    let page = 1;
    let lastPage = 2;
    let nowPlaying = '';
    
    while (page <= lastPage) {
      const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&api_key=${config.lastfm_api_key}&token=FCnt6ZrXPKkdhNWoaM0vX9z-ddZY0HTI&user=auumgn&limit=200&format=json&page=${page}`)
      const tracks: IRecentTracks = await res.json();
      lastPage = tracks.recenttracks['@attr'].totalPages;

      for (let i = 0; i < tracks.recenttracks.track.length; i++) {
        const res = tracks.recenttracks.track[i];

        if (res['@attr'] && res['@attr'].nowplaying) {
          if (nowPlaying !== res.id) {
            const scrobble = new Scrobble(res.name, res.artist['#text'], res.album['#text'], Math.ceil(Date.now() / 1000))
            //await insertScrobble(scrobble);
            await addPlaycount(scrobble);
          }
          nowPlaying = res.id;
        } else if (timestamp < +res.date.uts) {
          const scrobble = new Scrobble(res.name, res.artist['#text'], res.album['#text'], res.date.uts)
          //await insertScrobble(scrobble);
          await addPlaycount(scrobble);
        } else {
          lastPage = 0;
          break;
        }
      }
      console.log(page);
      page++;
    }
  }
  catch (err) {
    console.error("Rolling back, error:", err)
    const res = rollbackScrobbleImport(timestamp, scrobbleTimestamp);
    console.log(res);
  }

}

deleteScrobblesAndTimestamp();
getTracks();