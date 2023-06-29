import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, filter, map, of, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SERVER_API_URL } from "src/app/app.constants";
import { Artist } from "src/app/shared/models/artist.model";
import { Scrobble } from "src/app/shared/models/scrobble.model";

@Injectable({ providedIn: "root" })
export class ArtistService {
  artists: BehaviorSubject<Artist[]> = new BehaviorSubject<Artist[]>([]);

  constructor(private http: HttpClient) {}

  getArtists(forceReload = false): Observable<any> {
    if (!this.artists.value || forceReload) {
      this.fetchArtists().subscribe();
    }
    return this.artists.asObservable();
  }

  fetchArtists(): any {
    return this.http
      .get<Scrobble[]>(`${SERVER_API_URL}/artist/all`, {
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
        tap((response) => {
          this.artists.next(response);
        })
      );
  }
  getArtistsByCategory(category: string, forceReload = false): Observable<Artist[]> {
    if (
      this.artists.value.length === 0 ||
      forceReload ||
      !this.artists.value.find((artist) => artist.category === category)
    ) {
      this.fetchArtistsByCategory(category).subscribe();
    }

    return this.artists.pipe(
      map((artists) => artists.filter((artist) => artist.category === category)),
      filter((artists) => artists.length > 0)
    );
  }

  fetchArtistsByCategory(category: string): any {
    return this.http
      .get<Artist[]>(`${SERVER_API_URL}/artist/category`, {
        params: {
          category,
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
        tap((response) => {
          this.artists.next(Array.from(new Set([...this.artists.value, ...response])));
        })
      );
  }
}
