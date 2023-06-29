import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, map, of, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SERVER_API_URL } from "src/app/app.constants";
import { ICategoryScrobbles, Scrobble as IScrobble } from "src/app/shared/models/scrobble.model";



@Injectable({ providedIn: "root" })
export class ScrobbleService {
  private topArtists: { [period: number]: BehaviorSubject<IScrobble[]> } = {};
  private topAlbums: { [period: number]: BehaviorSubject<IScrobble[]> } = {};
  private topTracks: { [period: number]: BehaviorSubject<IScrobble[]> } = {};
  private recentScrobbles: BehaviorSubject<IScrobble[] | null> = new BehaviorSubject<IScrobble[] | null>(null);
  private categoryScrobbles: BehaviorSubject<ICategoryScrobbles | null> =
    new BehaviorSubject<ICategoryScrobbles | null>(null);

  constructor(private http: HttpClient) {}

  getTopArtists(period: any, forceReload = false): Observable<any> {
    
    if (!this.topArtists[period] || forceReload) {
      this.topArtists[period] = new BehaviorSubject<IScrobble[]>([]);
      this.fetchTopArtists(period).subscribe();
    }
    return this.topArtists[period].asObservable();
  }

  private fetchTopArtists(period: any): any {
    return this.http
      .get<IScrobble[]>(`${SERVER_API_URL}/scrobbles/artists`, {
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
      .get<IScrobble[]>(`${SERVER_API_URL}/scrobbles/albums`, {
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
      .get<IScrobble[]>(`${SERVER_API_URL}/scrobbles/tracks`, {
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
    return this.http
      .get<ICategoryScrobbles>(`${SERVER_API_URL}/scrobbles/category`, {
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
}
