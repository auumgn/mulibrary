import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SERVER_API_URL } from 'src/app/app.constants';
import { Artist } from 'src/app/shared/models/artist.model';
import { Scrobble } from 'src/app/shared/models/scrobble.model';

@Injectable({ providedIn: 'root' })
export class ArtistService {
  topArtists: BehaviorSubject<Scrobble[] | null> = new BehaviorSubject<
  Scrobble[] | null
  >(null);

  constructor(private http: HttpClient) {}

  getTopArtists(range: any, forceReload = false): Observable<any> {
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
  }
}
