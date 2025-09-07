import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, filter, from, map, of, tap } from "rxjs";
import { Track } from "../../shared/models/track.model";
import { HttpClient } from "@angular/common/http";
import { SERVER_API_URL } from "src/app/app.constants";
import { Scrobble } from "src/app/shared/models/scrobble.model";
import { SupabaseService } from "./supabase.service";

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

  constructor(private supabaseService: SupabaseService) {}

  getAlbumTracks(artist: string, album: string, forceReload = false): Observable<Track[]> {
    if (!(artist in this.tracks.value) || !(album in this.tracks.value[artist]) || forceReload) {
      this.fetchAlbumTracks(artist, album);
    }

    return this.tracks.pipe(
      filter((coll) => artist in coll && album in coll[artist]),
      map((coll) => coll[artist][album])
    );
  }

  private fetchAlbumTracks(artist: string, album: string): any {
    return from(this.supabaseService.getAlbumTracks(artist, album))
      .pipe(
        catchError((error) => {
          return of("Error occurred:", error);
        }),
        map((response) => {
          if (response.status === 200) {
            if (!this.tracks.value[artist]) this.tracks.value[artist] = {};
            this.tracks.value[artist][album] = response.data;
            this.tracks.next(this.tracks.value);
          } else {
            console.error("fetchAlbumTracks() failed with status:", response.status, "Error:", response.error);
          }
        })
      )
      .subscribe();
  }
}
