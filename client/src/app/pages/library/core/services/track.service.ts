import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, map, of, tap } from "rxjs";
import { Track } from "../../../../shared/models/track.model";
import { HttpClient } from "@angular/common/http";
import { SERVER_API_URL } from "src/app/app.constants";
import { Scrobble } from "src/app/shared/models/scrobble.model";

@Injectable({ providedIn: "root" })
export class TrackService {
  private recentTracks: BehaviorSubject<Scrobble[] | null> = new BehaviorSubject<Scrobble[] | null>(null);

  constructor(private http: HttpClient) {}

  getRecentTracks(page: number, pageSize: number, forceReload = false): Observable<Scrobble[] | null> {
    if (!this.recentTracks.value || forceReload) {
      this.getRecentScrobbles(page, pageSize).subscribe();
    }
    return this.recentTracks.asObservable();
  }

  private getRecentScrobbles(page: number, pageSize: number): any {
    return this.http
      .get<Scrobble[]>(`${SERVER_API_URL}/track/recent`, {
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
            console.log("Request failed with status:", response.status);
          }
        }),
        tap((response) => this.recentTracks.next(response))
      );
  }
}
