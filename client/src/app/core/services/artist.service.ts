import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, filter, map, of, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SERVER_API_URL } from "src/app/app.constants";
import { Artist } from "src/app/shared/models/artist.model";
import { Scrobble } from "src/app/shared/models/scrobble.model";
import { ITreenode } from "src/app/shared/models/treenode.model";

@Injectable({ providedIn: "root" })
export class ArtistService {
  artists: BehaviorSubject<Artist[]> = new BehaviorSubject<Artist[]>([]);
  artistNodes: BehaviorSubject<ITreenode[]> = new BehaviorSubject<ITreenode[]>([]);

  constructor(private http: HttpClient) {}

  getArtists(forceReload = false): Observable<any> {
    if (this.artistNodes.value.length === 0 || forceReload) {
      this.fetchArtists().subscribe();
    }
    return this.artistNodes.pipe(filter(artists => artists && artists.length > 0));
  }

  fetchArtists(): any {
    return this.http
      .get<ITreenode[]>(`${SERVER_API_URL}/artist/all`, {
        observe: "response",
      })
      .pipe(
        catchError((error) => {
          return of("Error occurred:", error);
        }),
        map((response) => {
          console.log(response);

          if (response.status === 200) {
            this.artistNodes.next(response.body);
          } else {
            console.log("Request failed with status:", response.status);
          }
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
      map((artists) => {console.log("artists:", artists); return artists.filter((artist) => {console.log("Art", artist);return artist.category === category})}),
      filter((artists) => {console.log("artistos filter:", artists); return artists.length > 0})
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
          console.log(this.artists.value);
        })
      );
  }
}
