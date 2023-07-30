import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, filter, map, of, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SERVER_API_URL } from "src/app/app.constants";
import { Scrobble } from "src/app/shared/models/scrobble.model";
import { Album } from "src/app/shared/models/album.model";
import { normalizeName } from "src/app/shared/utils/normalize-name.util";
import { ITreenode } from "src/app/shared/models/treenode.model";
import { debug } from "src/app/shared/utils/debug-util";

@Injectable({ providedIn: "root" })
export class AlbumService {
  albums: BehaviorSubject<{ [artist_id: string]: Album[] }> = new BehaviorSubject<{ [artist_id: string]: Album[] }>({});
  albumNodes: BehaviorSubject<ITreenode[]> = new BehaviorSubject<ITreenode[]>([]);
  // activeAlbum: Subject<>;
  constructor(private http: HttpClient) {}

  getAlbumNodes(forceReload = false): Observable<ITreenode[]> {
    if (this.albumNodes.value.length === 0 || forceReload) {
      this.fetchAlbumNodes().subscribe();
    }    
    return this.albumNodes.pipe(
      filter((albums) => albums && albums.length > 0)
    );
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
        debug("fetchAlbumNodes() response", response)

        if (response.status === 200) {
          this.albums.next(response.body);
        } else {
          console.log("Request failed with status:", response.status);
        }
      })
    );
  }

  getAlbumsByArtistName(artistName: string, forceReload = false): Observable<Album[]> {
    debug("getting albums by artist", artistName, "force reload", forceReload)
    if (!this.albums.value[artistName] || forceReload) {
      if (forceReload) this.albums.value[artistName] = []
      this.fetchAlbumsByArtistName(artistName).subscribe();
    }
    return this.albums.pipe(
      map((albums) => {debug("mapping albums", albums, "by", artistName); return albums[artistName]}),
      filter((albums) => {debug("Returning albums", albums, "by artist", artistName); return albums && albums.length > 0})
    );
  }

  getAlbumByName(album: string, artist: string, forceReload = false): Observable<Album | undefined> {
    if (!this.albums.value[artist] || forceReload) {
      this.fetchAlbumByName(album, artist).subscribe();
    }
    return this.albums.pipe(
      map((albums) => albums[artist]),
      filter((albums) => {return albums && albums.length > 0}),
      map((albums) => albums.find(existingAlbum => normalizeName(existingAlbum.name) === album)),
      
    );
  }

  getAlbumById(id: number, artist_id: number): Observable<Album | undefined> {
    const existingAlbum = this.albums.value[artist_id].find((album) => album.id === id);
    if (!existingAlbum) {
      console.log("Album doesn't exist lol");
    }
    return this.albums.pipe(
      map((albums) => albums[artist_id]),
      map((albums) => albums.find((album) => album.id === id))
    );
  }

  private fetchAlbumByName(album: string, artist: string): any {
    return this.http
      .get<Album>(`${SERVER_API_URL}/album/name`, {
        params: {
          album,
          artist
        },
        observe: "response",
      })
      .pipe(
        catchError((error) => {
          return of("Error occurred:", error);
        }),
        map((response) => {
          debug("fetchAlbumByName() response", response)
          if (response.status === 200) {
            if (this.albums.value[artist]) this.albums.value[artist] = [...this.albums.value[artist], ...response.body];
            else this.albums.value[artist] = response.body;
            this.albums.next(this.albums.value);
          } else {
            console.log("Request failed with status:", response.status);
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
            console.log("Request failed with status:", response.status);
          }
        })
      );
  } */

  fetchAlbumsByArtistName(artistName: string): any {
    return this.http
      .get<Album[]>(`${SERVER_API_URL}/album/artist`, {
        params: {
          artistName,
        },
        observe: "response",
      })
      .pipe(
        catchError((error) => {
          return of("Error occurred:", error);
        }),
        map((response) => {
          debug("fetchAlbumsByArtistName() response", response)
          
          if (response.status === 200) {
            this.albums.value[artistName] = response.body;
            console.log("NEXT!", artistName, "updated!");
            this.albums.next(this.albums.value);
          } else {
            console.log("Request failed with status:", response.status);
          }
        })
      );
  }

}
