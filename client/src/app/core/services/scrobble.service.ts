import { Injectable } from "@angular/core";
import { BehaviorSubject, EMPTY, Observable, catchError, filter, from, map, of, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SERVER_API_URL } from "src/app/app.constants";
import { ICategoryScrobbles, Scrobble as IScrobble } from "src/app/shared/models/scrobble.model";
import { Album } from "src/app/shared/models/album.model";
import { SupabaseService } from "./supabase.service";

@Injectable({ providedIn: "root" })
export class ScrobbleService {
  private topArtists: { [period: number]: BehaviorSubject<IScrobble[]> } = {};
  private topAlbums: { [period: number]: BehaviorSubject<IScrobble[]> } = {};
  private topTracks: { [period: number]: BehaviorSubject<IScrobble[]> } = {};
  private scrobblesPerYear: BehaviorSubject<{
    [artist: string]: {
      scrobbles?: { [year: string]: number };
      albums: {
        [album: string]: {
          scrobbles: { [year: string]: number };
        };
      };
    };
  }> = new BehaviorSubject({});
  private recentScrobbles: BehaviorSubject<IScrobble[] | null> = new BehaviorSubject<IScrobble[] | null>(null);
  private categoryScrobbles: BehaviorSubject<ICategoryScrobbles | null> =
    new BehaviorSubject<ICategoryScrobbles | null>(null);

  constructor(private http: HttpClient, private supabaseService: SupabaseService) {}

  getTopArtists(period: any, forceReload = false): Observable<any> {
    if (!this.topArtists[period] || forceReload) {
      this.topArtists[period] = new BehaviorSubject<IScrobble[]>([]);
      this.fetchTopArtists(period).subscribe();
    }
    return this.topArtists[period].asObservable();
  }

  private fetchTopArtists(period: any): any {
    return this.http
      .get<IScrobble[]>(`${SERVER_API_URL}/scrobbles/top-artists`, {
        params: {
          range: String(period),
        },
        observe: "response",
      })
      .pipe(
        catchError((error) => {
          return of("Error occurred:", error);
        }),
        map((response) => {
          if (response.status === 200) {
            return response.body;
          } else {
            console.error("Request failed with status:", response.status);
          }
        }),
        tap((response) => {
          this.topArtists[period].next(response);
        })
      );
  }

  getTopAlbums(period: any, forceReload = false): Observable<any> {
    if (!this.topAlbums[period] || forceReload) {
      this.topAlbums[period] = new BehaviorSubject<IScrobble[]>([]);
      this.fetchTopAlbums(period).subscribe();
    }
    return this.topAlbums[period].asObservable();
  }

  private fetchTopAlbums(period: any): any {
    return this.http
      .get<IScrobble[]>(`${SERVER_API_URL}/scrobbles/top-albums`, {
        params: {
          range: String(period),
        },
        observe: "response",
      })
      .pipe(
        catchError((error) => {
          return of("Error occurred:", error);
        }),
        map((response) => {
          if (response.status === 200) {
            return response.body;
          } else {
            console.error("Request failed with status:", response.status);
          }
        }),
        tap((response) => {
          this.topAlbums[period].next(response);
        })
      );
  }

  getTopTracks(period: any, forceReload = false): Observable<any> {
    if (!this.topTracks[period] || forceReload) {
      this.topTracks[period] = new BehaviorSubject<IScrobble[]>([]);
      this.fetchTopTracks(period).subscribe();
    }
    return this.topTracks[period].asObservable();
  }

  private fetchTopTracks(period: any): any {
    return this.http
      .get<IScrobble[]>(`${SERVER_API_URL}/scrobbles/top-tracks`, {
        params: {
          range: String(period),
        },
        observe: "response",
      })
      .pipe(
        catchError((error) => {
          return of("Error occurred:", error);
        }),
        map((response) => {
          if (response.status === 200) {
            return response.body;
          } else {
            console.error("Request failed with status:", response.status);
          }
        }),
        tap((response) => {
          this.topTracks[period].next(response);
        })
      );
  }

  getCategoryScrobbles(forceReload = false): Observable<ICategoryScrobbles | null> {
    if (!this.categoryScrobbles.value || forceReload) {
      this.fetchCategoryScrobbles().subscribe();
    }
    return this.categoryScrobbles.asObservable();
  }

  private fetchCategoryScrobbles(): any {
    return from(this.supabaseService.getCategoryScrobbles()).pipe(
      map((response) => {
        if (response.status == 200) {
          const categoryPercentages: ICategoryScrobbles = {};
          response.data.forEach((r: any) => {
            const { category, year, count } = r;

            if (!categoryPercentages[category]) {
              categoryPercentages[category] = [];

              for (let year = 2009; year <= new Date().getFullYear(); year++) {
                for (let month = 0; month <= 11; month = month + 6) {
                  categoryPercentages[category].push({
                    date: new Date(Date.UTC(year, month, 1)),
                    count: 0,
                  });
                }
                /* categoryPercentages[r.category].push({
              date: new Date(Date.UTC(year, 0, 1)),
              count: 0,
            })  */
              }
            }

            const categoryYear = categoryPercentages[category].find(
              (entry) =>
                entry.date.getTime() ===
                new Date(Date.UTC(r.year ? r.year : r.date, r.month ? r.month - 1 : 0, 1)).getTime()
            );

            if (categoryYear) categoryYear.count = r.count;
          });

          return categoryPercentages;
        } else {
          console.error("Request failed with status:", response.status, "Error:", response.error);
          return null;
        }
      }),
      tap((response) => this.categoryScrobbles.next(response))
    );
  }

  getRecentTracks(page: number, pageSize: number, forceReload = false): Observable<IScrobble[] | null> {
    if (!this.recentScrobbles.value || forceReload) {
      this.fetchRecentScrobbles(page, pageSize).subscribe();
    }
    return this.recentScrobbles.asObservable();
  }

  private fetchRecentScrobbles(page: number, pageSize: number): any {
    return this.http
      .get<IScrobble[]>(`${SERVER_API_URL}/scrobbles/recent`, {
        params: {
          page: String(page),
          pageSize: String(pageSize),
        },
        observe: "response",
      })
      .pipe(
        catchError((error) => {
          return of("Error occurred:", error);
        }),
        map((response) => {
          if (response.status === 200) {
            return response.body;
          } else {
            console.error("Request failed with status:", response.status);
          }
        }),
        tap((response) => this.recentScrobbles.next(response))
      );
  }

  getAlbumScrobblesPerYear(album: string, artist: string, forceReload = false): Observable<any> {
    if (!this.scrobblesPerYear.value[artist] || !this.scrobblesPerYear.value[artist].albums[album] || forceReload) {
      this.fetchAlbumScrobblesPerYear(album, artist).subscribe();
    }

    return this.scrobblesPerYear.pipe(
      map((scrobbles) => {
        if (scrobbles[artist] && scrobbles[artist].albums && scrobbles[artist].albums[album].scrobbles) {
          return scrobbles[artist].albums[album].scrobbles;
        } else {
          return EMPTY;
        }
      })
    );
  }

  private fetchAlbumScrobblesPerYear(album: string, artist: string): any {
    console.log("roar");

    return this.http
      .get<IScrobble[]>(`${SERVER_API_URL}/scrobbles/album`, {
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
            const scrobbles: { [year: string]: number } = {};
            response.body.forEach((entry: any) => (scrobbles[entry.year] = entry.scrobbles));
            // if there's no artist in the behaviorsubject
            if (!this.scrobblesPerYear.value[artist]) {
              this.scrobblesPerYear.value[artist] = { albums: { [album]: { scrobbles } } };
              // if there's no album in the behaviorsubject
            } else if (!this.scrobblesPerYear.value[artist].albums[album]) {
              this.scrobblesPerYear.value[artist].albums[album] = { scrobbles };
            }
            this.scrobblesPerYear.next(this.scrobblesPerYear.value);
          } else {
            console.error("Request failed with status:", response.status);
          }
        })
      );
  }
}
