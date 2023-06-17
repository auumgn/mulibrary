import fetch from 'node-fetch';
import * as config from '../db/config.json';
import {
  deleteScrobblesAndTimestamp,
  getLatestScrobbleTimestamp,
  getRecentTimestamp,
  insertScrobble,
  insertSyncTimestamp,
  rollbackScrobbleImport,
  addPlaycount,
} from '../controllers/database-access';
import { IRecentTracks } from '../models/lastfm.model';
import { Scrobble } from '../models/scrobble.model';
import { Track } from 'src/models/track.model';

export const getToken = async () => {
  return await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=auth.gettoken&api_key=${config.lastfm_api_key}&format=json`,
  )
    .then((response) => response.json())
    .then((json) => {
      return json;
    })
    .catch((err) => console.error(err));
};

export const getSession = async () => {
  fetch(
    `https://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=${config.lastfm_api_key}&token=FCnt6ZrXPKkdhNWoaM0vX9z-ddZY0HTI`,
  )
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
    })
    .catch((err) => console.error(err));
};

export const getTracks = async () => {
  let timestamp = 0;
  let scrobbleTimestamp = 0;
  const tsRes: any = await getRecentTimestamp();
  console.log(tsRes);

  const tsScrobbleRes: any = await getLatestScrobbleTimestamp();
  if (tsRes.length > 0) {
    timestamp = tsRes[0].timestamp / 1000;
  }
  if (tsScrobbleRes.length > 0) {
    scrobbleTimestamp = tsScrobbleRes[0].timestamp / 1000;
  }
  console.log(timestamp, scrobbleTimestamp);

  try {
    await insertSyncTimestamp(Date.now());
    let page = 1;
    let lastPage = 2;
    let nowPlaying = '';

    while (page <= lastPage) {
      const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&api_key=${config.lastfm_api_key}&token=FCnt6ZrXPKkdhNWoaM0vX9z-ddZY0HTI&user=auumgn&limit=200&format=json&page=${page}`,
      );
      const tracks: IRecentTracks = await res.json();
      lastPage = tracks.recenttracks['@attr'].totalPages;

      for (let i = 0; i < tracks.recenttracks.track.length; i++) {
        const res = tracks.recenttracks.track[i];

        if (res['@attr'] && res['@attr'].nowplaying) {
          if (nowPlaying !== res.id) {
            const scrobble = new Scrobble(
              res.name,
              res.artist['#text'],
              res.album['#text'],
              Math.ceil(Date.now() / 1000),
            );
            const track = await addPlaycount(scrobble);
            scrobble.artist_id = track.artist_id;
            scrobble.album_id = track.album_id;
            scrobble.track_id = track.id;
            scrobble.category = track.category;
            await insertScrobble(scrobble);
          }
          nowPlaying = res.id;
        } else if (timestamp < +res.date.uts) {
          const scrobble = new Scrobble(
            res.name,
            res.artist['#text'],
            res.album['#text'],
            res.date.uts,
          );
          const track: Track = await addPlaycount(scrobble);
          scrobble.artist_id = track.artist_id;
          scrobble.album_id = track.album_id;
          scrobble.track_id = track.id;
          scrobble.category = track.category;
          await insertScrobble(scrobble);
        } else {
          lastPage = 0;
          break;
        }
      }
      console.log('page no ', page);
      page++;
    }
  } catch (err) {
    console.error('Rolling back, error:', err);
    // TODO: recalculate scrobbles after rolling back
    const res = rollbackScrobbleImport(timestamp, scrobbleTimestamp);
    console.log(res);
  }
};

async function main() {
  //await deleteScrobblesAndTimestamp();
  getTracks();
}

main();
