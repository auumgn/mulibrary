import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, filter, map, of, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SERVER_API_URL } from "src/app/app.constants";
import { Scrobble } from "src/app/shared/models/scrobble.model";
import { Album } from "src/app/shared/models/album.model";
import { normalizeName } from "src/app/shared/utils/normalize-name.util";
import { ITreenode } from "src/app/shared/models/treenode.model";

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
        if (response.status === 200) {
          this.albums.next(response.body);
        } else {
          console.log("Request failed with status:", response.status);
        }
      })
    );
  }

  getAlbumsByArtistName(artistName: string, forceReload = false): Observable<Album[]> {
    if (!this.albums.value[artistName] || forceReload) {
      if (forceReload) this.albums.value[artistName] = []
      this.fetchAlbumsByArtistName(artistName).subscribe();
    }
    
    return this.albums.pipe(
      map((albums) => {console.log(albums); return albums[artistName]}),
      filter((albums) => {console.log(albums); return albums && albums.length > 0})
    );
  }

  getAlbumByName(album: string, artist: string, forceReload = false): Observable<Album | undefined> {
    if (!this.albums.value[artist] || forceReload) {
      console.log(album, artist);
      
      this.fetchAlbumByName(album, artist).subscribe();
    }
    console.log("asdflkjsdf");
    
    return this.albums.pipe(
      map((albums) => albums[artist]),
      filter((albums) => {console.log("getAlbumByName", albums); return albums && albums.length > 0}),
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
          console.log(response);
          
          if (response.status === 200) {
            this.albums.value[artist] = [...this.albums.value[artist], ...response.body];
            console.log(response.body);
            
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
          console.log(response);
          
          if (response.status === 200) {
            this.albums.value[artistName] = response.body;
            this.albums.next(this.albums.value);
          } else {
            console.log("Request failed with status:", response.status);
          }
        })
      );
  }
  /* getArtistsByCategory(range: any, forceReload = false): Observable<any> {
    if (!this.topArtists.value || forceReload) {
      this.getArtistScrobbles(range).subscribe();
    }
    console.log(this.topArtists.value);
    
    return this.topArtists.asObservable();
  }

  getArtistScrobbles(range: any): any {
    return this.http
      .get<Scrobble[]>(`${SERVER_API_URL}/scrobbles/artist`, {
        params: {
          range: String(range)
        },
        observe: 'response',
      })
      .pipe(
        catchError((error) => {
          return of('Error occurred:', error);
        }),
        map((response) => {
          console.log(response);
          
          if (response.status === 200) {
            return response.body;
          } else {
            console.log('Request failed with status:', response.status);
          }
        }),
        tap((response) => {this.topArtists.next(response); console.log(response);
        })
      );
  } */
}
