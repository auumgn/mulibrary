import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, filter, from, map, of, skip } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SERVER_API_URL } from "src/app/app.constants";
import { Album } from "src/app/shared/models/album.model";
import { normalizeName } from "src/app/shared/utils/normalize-name.util";
import { ITreenode } from "src/app/shared/models/treenode.model";
import { debug } from "src/app/shared/utils/debug-util";
import { SupabaseService } from "./supabase.service";
import { TimeRangeService } from "./time-range.service";

@Injectable({ providedIn: "root" })
export class AlbumService {
  albums: BehaviorSubject<{ [artist_id: string]: Album[] }> = new BehaviorSubject<{ [artist_id: string]: Album[] }>({});
  discographyFetched: BehaviorSubject<{ [artist_id: string]: boolean }> = new BehaviorSubject<{
    [artist_id: string]: boolean;
  }>({});
  albumNodes: BehaviorSubject<ITreenode[]> = new BehaviorSubject<ITreenode[]>([]);
  recentReviews: BehaviorSubject<Album[]> = new BehaviorSubject<Album[]>([]);
  backlog: BehaviorSubject<Album[]> = new BehaviorSubject<Album[]>([]);
  // activeAlbum: Subject<>;
  // TODO: move range slider from scrobble service and replace the service here
  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService,
    private timeRangeService: TimeRangeService
  ) {
    this.timeRangeService.sliderRange$
      .pipe(
        skip(1) // Skip initial value to avoid unnecessary load on service init
      )
      .subscribe(() => {
        this.fetchBacklog();
      });
  }

  upsertReview(artist: string, albumName: string, album_id: number, rating: number, review: string) {
    return from(this.supabaseService.upsertReview(album_id, rating, review)).pipe(
      map((res) => {
        if (this.albums.value[artist]) {
          const updatedAlbums = this.albums.value[artist].map((album) =>
            normalizeName(album.name) === albumName
              ? { ...album, rating: res.data[0].rating, review: res.data[0].review }
              : album
          );

          this.albums.next({
            ...this.albums.value,
            [artist]: updatedAlbums,
          });
        }
        return res; // Return the response
      })
    );
  }

  getBacklog(forceReload = false): Observable<Album[]> {
    if (this.backlog.value.length === 0 || forceReload) {
      this.fetchBacklog();
    }
    return this.backlog.pipe(filter((albums) => albums && albums.length > 0));
  }

  fetchBacklog() {
    const { start_ts, end_ts } = this.timeRangeService.getSliderRange();
    from(this.supabaseService.getListeningBacklog(start_ts, end_ts))
      .pipe(
        catchError((error) => {
          return of("Error occurred:", error);
        }),
        map((response) => {
          debug("fetchBacklog() response", response);
          if (response.status === 200) {
            this.backlog.next(response.data);
          } else {
            console.error("fetchBacklog() request failed with status:", response.status, "Error:", response.error);
          }
        })
      )
      .subscribe();
  }

  getRecentReviews(forceReload = false): Observable<Album[]> {
    if (this.recentReviews.value.length === 0 || forceReload) {
      this.fetchRecentReviews().subscribe();
    }
    return this.recentReviews.pipe(filter((reviews) => reviews && reviews.length > 0));
  }

  fetchRecentReviews(): Observable<void> {
    return from(this.supabaseService.getRecentReviews()).pipe(
      catchError((error) => {
        return of("Error occurred:", error);
      }),
      map((response) => {
        debug("fetchRecentReviews() response", response);
        if (response.status === 200) {
          this.recentReviews.next(response.data);
        } else {
          console.error("fetchRecentReviews() request failed with status:", response.status, "Error:", response.error);
        }
      })
    );
  }

  getAlbumNodes(forceReload = false): Observable<ITreenode[]> {
    if (this.albumNodes.value.length === 0 || forceReload) {
      this.fetchAlbumNodes().subscribe();
    }
    return this.albumNodes.pipe(filter((albums) => albums && albums.length > 0));
  }

  fetchAlbumNodes(): Observable<void> {
    return this.http
      .get<ITreenode[]>(`${SERVER_API_URL}/album/all`, {
        observe: "response",
      })
      .pipe(
        catchError((error) => {
          return of("Error occurred:", error);
        }),
        map((response) => {
          debug("fetchAlbumNodes() response", response);

          if (response.status === 200) {
            this.albums.next(response.body);
          } else {
            console.error("Request failed with status:", response.status);
          }
        })
      );
  }

  getAlbumsByArtistName(artistName: string, forceReload = false): Observable<Album[]> {
    debug("getting albums by artist", artistName, "force reload", forceReload);
    if (!this.discographyFetched.value[artistName] || forceReload) {
      if (forceReload) this.albums.value[artistName] = [];
      this.fetchAlbumsByArtistName(artistName).subscribe();
    }
    return this.albums.pipe(
      map((albums) => {
        debug("mapping albums", albums, "by", artistName);
        return albums[artistName];
      }),
      filter((albums) => {
        debug("Returning albums", albums, "by artist", artistName);
        return albums && albums.length > 0;
      })
    );
  }

  getAlbumByName(artist: string, album: string, forceReload = false): Observable<Album | undefined> {
    if (!this.albums.value[artist] || forceReload) {
      this.fetchAlbumByName(artist, album).subscribe();
    }

    return this.albums.pipe(
      map((albums) => albums[artist]),
      filter((albums) => {
        return albums && albums.length > 0;
      }),
      map((albums) => albums.find((existingAlbum) => normalizeName(existingAlbum.name) === album))
    );
  }

  getAlbumById(id: number, artist_id: number): Observable<Album | undefined> {
    const existingAlbum = this.albums.value[artist_id].find((album) => album.id === id);
    if (!existingAlbum) {
    }
    return this.albums.pipe(
      map((albums) => albums[artist_id]),
      map((albums) => albums.find((album) => album.id === id))
    );
  }

  private fetchAlbumByName(artist: string, album: string): any {
    return from(this.supabaseService.getAlbumByName(artist, album)).pipe(
      catchError((error) => {
        return of("Error occurred:", error);
      }),
      map((response) => {
        debug("fetchAlbumByName() response", response);
        if (response.status === 200) {
          if (this.albums.value[artist]) this.albums.value[artist] = [...this.albums.value[artist], ...response.data];
          else this.albums.value[artist] = response.data;
          this.albums.next(this.albums.value);
        } else {
          console.error("Request failed with status:", response.status);
        }
      })
    );
  }

  /* fetchAlbumById(artist: string, album: string): any {
    return this.http
      .get<Album[]>(`${SERVER_API_URL}/album/name`, {
        params: {
          artist,
          album
        },
        observe: "response",
      })
      .pipe(
        catchError((error) => {
          return of("Error occurred:", error);
        }),
        map((response) => {
          if (response.status === 200) {
            this.albums.value[artist_id] = response.body;
            this.albums.next(this.albums.value);
          } else {
            console.error("Request failed with status:", response.status);
          }
        })
      );
  } */

  fetchAlbumsByArtistName(artistName: string): any {
    return from(this.supabaseService.getAlbumsByArtistName(artistName)).pipe(
      catchError((error) => {
        return of("Error occurred:", error);
      }),
      map((response) => {
        debug("fetchAlbumsByArtistName() response", response);

        if (response.status === 200) {
          this.albums.value[artistName] = response.data;
          this.discographyFetched.value[artistName] = true;
          this.albums.next(this.albums.value);
          this.discographyFetched.next(this.discographyFetched.value);
        } else {
          console.error("Request failed with status:", response.status);
        }
      })
    );
  }
}
