import { Injectable } from "@angular/core";
import { BehaviorSubject, EMPTY, Observable, catchError, filter, from, map, of, skip, take, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SERVER_API_URL } from "src/app/app.constants";
import { ICategoryScrobbles, Scrobble as IScrobble } from "src/app/shared/models/scrobble.model";
import { Album } from "src/app/shared/models/album.model";
import { SupabaseService } from "./supabase.service";
import { TimeRangeService } from "./time-range.service";

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
  private timelineScrobbles: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  private categoryScrobbles: BehaviorSubject<ICategoryScrobbles | null> =
    new BehaviorSubject<ICategoryScrobbles | null>(null);
  normalized = false;

  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService,
    private timeRangeService: TimeRangeService
  ) {
    this.timeRangeService.sliderRange$.pipe(skip(1)).subscribe(() => {
      this.fetchCategoryScrobbles();
    });
  }

  getTopArtists(period: number, forceReload = false): Observable<any> {
    if (!this.topArtists[period] || forceReload) {
      this.topArtists[period] = new BehaviorSubject<IScrobble[]>([]);
      this.fetchTopArtists(period).subscribe();
    }
    return this.topArtists[period].asObservable();
  }

  private fetchTopArtists(period: number): any {
    const { start_ts, end_ts } = this.timeRangeService.getSliderRange();
    return from(this.supabaseService.getTopArtists(start_ts, end_ts)).pipe(
      catchError((error) => {
        return of("Error occurred:", error);
      }),
      map((response) => {
        if (response.status === 200) {
          return response.data;
        } else {
          console.error("Unable to fetch top artists, status:", response.status, "Error:", response.error);
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

  getTopTracks(period: number, forceReload = false): Observable<any> {
    if (!this.topTracks[period] || forceReload) {
      this.topTracks[period] = new BehaviorSubject<IScrobble[]>([]);
      this.fetchTopTracks(period).subscribe();
    }
    return this.topTracks[period].asObservable();
  }

  private fetchTopTracks(period: number): any {
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
      this.fetchCategoryScrobbles();
    }
    return this.categoryScrobbles.asObservable();
  }

  private fetchCategoryScrobbles() {
    const { start_ts, end_ts } = this.timeRangeService.getSliderRange();
    const startYear = new Date(start_ts * 1000).getUTCFullYear();
    const endYear = new Date(end_ts * 1000).getUTCFullYear();

    from(this.supabaseService.getCategoryScrobbles(this.normalized, start_ts, end_ts))
      .pipe(
        take(1),
        map((response) => {
          if (response.status == 200) {
            const categoryPercentages: ICategoryScrobbles = {};
            response.data.forEach((r: any) => {
              const { category, year, count } = r;

              if (!categoryPercentages[category]) {
                categoryPercentages[category] = [];
                let range = this.timeRangeService.getSliderRangeMonths();
                let step = 1;
                if (range > 12 && range <= 24) {
                  step = 2;
                }
                if (range > 24) {
                  step = 3;
                }
                if (range > 36) {
                  step = 5;
                }
                if (range > 48) {
                  step = 6;
                }
                for (let year = startYear; year <= endYear; year++) {
                  for (let month = 0; month <= 11; month += step) {
                    categoryPercentages[category].push({ date: new Date(Date.UTC(year, month, 1)), count: 0 });
                  }
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
      )
      .subscribe();
  }

  getTimelineSliderScrobbles(forceReload = false): Observable<IScrobble[] | null> {
    if (!this.timelineScrobbles.value || forceReload) {
      this.fetchTimelineSliderScrobbles().subscribe();
    }
    return this.timelineScrobbles.asObservable();
  }

  private fetchTimelineSliderScrobbles(): any {
    return from(this.supabaseService.getTimelineSliderScrobbles()).pipe(
      catchError((error) => {
        return of("Error occurred:", error);
      }),
      map((response) => {
        if (response.status === 200) {
          return response.data;
        } else {
          console.error("Request failed with status:", response.status);
        }
      }),
      tap((response) => this.timelineScrobbles.next(response))
    );
  }

  getRecentTracks(page: number, pageSize: number, forceReload = false): Observable<IScrobble[] | null> {
    if (!this.recentScrobbles.value || forceReload) {
      this.fetchRecentScrobbles(page, pageSize).subscribe();
    }
    return this.recentScrobbles.asObservable();
  }

  private fetchRecentScrobbles(page: number, pageSize: number): any {
    return from(this.supabaseService.getRecentScrobbles(page, pageSize)).pipe(
      catchError((error) => {
        return of("Error occurred:", error);
      }),
      map((response) => {
        if (response.status === 200) {
          return response.data;
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
