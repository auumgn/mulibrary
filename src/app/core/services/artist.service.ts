import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, filter, from, map, of, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SERVER_API_URL } from "src/app/app.constants";
import { Artist } from "src/app/shared/models/artist.model";
import { Scrobble } from "src/app/shared/models/scrobble.model";
import { ITreenode } from "src/app/shared/models/treenode.model";
import { normalizeName } from "src/app/shared/utils/normalize-name.util";
import { debug } from "src/app/shared/utils/debug-util";
import { SupabaseService } from "./supabase.service";

@Injectable({ providedIn: "root" })
export class ArtistService {
  artists: BehaviorSubject<Artist[]> = new BehaviorSubject<Artist[]>([]);
  // TODO: this is huh what?    v
  artistNodes: BehaviorSubject<ITreenode[]> = new BehaviorSubject<ITreenode[]>([]);

  constructor(private http: HttpClient, private supabaseService: SupabaseService) {}

  getArtists(forceReload = false): Observable<any> {
    if (this.artistNodes.value.length === 0 || forceReload) {
      this.fetchArtists().subscribe();
    }
    return this.artistNodes.pipe(filter((artists) => artists && artists.length > 0));
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
          if (response.status === 200) {
            this.artistNodes.next(response.body);
          } else {
            console.error("Request failed with status:", response.status);
          }
        })
      );
  }

  getArtistByName(name: string, forceReload = false): Observable<Artist> {
    if (
      this.artists.value.length === 0 ||
      forceReload ||
      !this.artists.value.find((artist) => artist.category === name)
    ) {
      this.fetchArtistByName(name).subscribe();
    }
    // TODO: add interceptor for various calls to see if anything is being returned incorrectly e.g. this function returns two artists when you should only have one
    return this.artists.pipe(map((artists) => artists.filter((artist) => normalizeName(artist.name) === name)[0]));
  }

  fetchArtistByName(artist: string): any {
    return from(this.supabaseService.getArtistByName(artist)).pipe(
      catchError((error) => {
        return of(error);
      }),
      map((response) => {
        if (response.status === 200) {
          return response.data;
        } else {
          console.error("fetchArtistByName() Request failed:", response, "Error:", response.error);
        }
      }),
      tap((response) => {
        this.artists.next(Array.from(new Set([...this.artists.value, ...response])));
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
      map((artists) => {
        return artists.filter((artist) => {
          return artist.category && normalizeName(artist.category) === category;
        });
      }),
      filter((artists) => {
        debug("Getting artists:", artists, "by category", category);
        return artists.length > 0;
      })
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
            console.error("Request failed with status:", response.status);
          }
        }),
        tap((response) => {
          this.artists.next(Array.from(new Set([...this.artists.value, ...response])));
        })
      );
  }
}
