import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EMPTY, Subject, combineLatest, switchMap, take, takeUntil } from "rxjs";
import { AlbumService } from "src/app/core/services/album.service";
import { ArtistService } from "src/app/core/services/artist.service";
import { Album } from "src/app/shared/models/album.model";
import { Artist } from "src/app/shared/models/artist.model";
import { calculateBarWidth } from "src/app/shared/utils/calculate-bar-width";
import { FormatDuration } from "src/app/shared/pipes/format-track-duration";

@Component({
  selector: "app-artist",
  templateUrl: "./artist.component.html",
  styleUrls: ["./artist.component.css"],
})
export class ArtistComponent implements OnInit, OnDestroy {
  constructor(
    private artistService: ArtistService,
    private albumService: AlbumService,
    private activatedRoute: ActivatedRoute
  ) {}
  calculateBarWidth = calculateBarWidth;
  destroy$ = new Subject();
  albums: Album[] = [];
  artist: Artist | undefined;
  trackPlays = 0;
  albumPlays = 0;
  length = 0;
  tags: string[] | undefined;
  cover = "";

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        switchMap((params) => {
          if (params["artist"]) {
            const { artist } = params;
            return combineLatest([
              this.artistService.getArtistByName(artist),
              this.albumService.getAlbumsByArtistName(artist),
            ]);
          }
          return EMPTY;
        }),
      take(1)
      )
      .subscribe((data) => {
        const [artist, albums] = data;
        this.albums = albums;
        this.artist = artist;
        this.albums.map((album) => {
          if (album && album.artwork && album.artwork.length > 0 && album.artwork![0].slice(2).slice(0, -2)) {
            
            album.artwork = ["http://localhost:3000/artwork/" + album.artwork![0].slice(2).slice(0, -2)];
          } 
        });

        console.log(this.albums);
        

        /*this.tracks = coll[1];
        coll[1].map(track => {
          this.length += track.duration ? track.duration : 0;
          this.trackPlays += track.playcount ? track.playcount : 0
        })
        this.albumPlays = Math.floor((this.trackPlays / this.tracks.length) * 100) / 100;   */
      });
  }

  setPlaceholderAlbumCover() {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
