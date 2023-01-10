import fetch from 'node-fetch';
import * as config from '../controllers/config.json';
import { insertScrobble, insertSyncTimestamp } from '../controllers/database-access';
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
  let page = 1;
  let lastPage = 2;
  insertSyncTimestamp(Date.now());
  while (page <= lastPage) {
    const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&api_key=${config.lastfm_api_key}&token=FCnt6ZrXPKkdhNWoaM0vX9z-ddZY0HTI&user=auumgn&limit=200&format=json&page=${page}`)
    const tracks: IRecentTracks = await res.json();
    for (let i = 0; i < tracks.recenttracks.track.length; i++) {
      const res = tracks.recenttracks.track[i];
      if (!res['@attr'] || (res['@attr'] && !res['@attr'].nowplaying)) {
        const scrobble = new Scrobble(res.name, res.artist['#text'], res.album['#text'], res.date.uts)
        await insertScrobble(scrobble);
      }
    }
    console.log(tracks.recenttracks['@attr']);
    lastPage = tracks.recenttracks['@attr'].totalPages;
    page++;
  }
}

getTracks();