import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, filter, map, of, tap } from "rxjs";
import { Track } from "../../shared/models/track.model";
import { HttpClient } from "@angular/common/http";
import { SERVER_API_URL } from "src/app/app.constants";
import { Scrobble } from "src/app/shared/models/scrobble.model";

/* 3: {
  "animal-collective": {
    "strawberry-jam": Scrobble[]
  }
}
*/
type Tracks = {
  [artist: string]: {
    [album: string]: Track[];
  };
};
@Injectable({ providedIn: "root" })
export class TrackService {
  private tracks: BehaviorSubject<Tracks> = new BehaviorSubject<Tracks>({});

  constructor(private http: HttpClient) {}

  getAlbumTracks(album: string, artist: string, forceReload = false): Observable<Track[]> {
    if (!(artist in this.tracks.value) || !(album in this.tracks.value[artist]) || forceReload) {
      this.fetchAlbumTracks(album, artist).subscribe();
    }
    return this.tracks.pipe(
      filter((coll) => artist in coll && album in coll[artist]),
      map((coll) => coll[artist][album])
    );
  }

  private fetchAlbumTracks(album: string, artist: string): any {
    return this.http
      .get<Track[]>(`${SERVER_API_URL}/track/album`, {
        params: {
          album,
          artist,
        },
        observe: "response",
      })
      .pipe(
        catchError((error) => {
          return of("Error occurred:", error);
        }),
        map((response) => {
          if (response.status === 200) {
            if (!this.tracks.value[artist]) this.tracks.value[artist] = {};
            this.tracks.value[artist][album] = response.body;
            this.tracks.next(this.tracks.value);
          } else {
            console.error("Request failed with status:", response.status);
          }
        })
      );
  }
}
