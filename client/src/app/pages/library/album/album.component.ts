import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EMPTY, Subject, combineLatest, of, switchMap, takeUntil } from "rxjs";
import { AlbumService } from "src/app/core/services/album.service";
import { TrackService } from "src/app/core/services/track.service";
import { Album } from "src/app/shared/models/album.model";
import { Track } from "src/app/shared/models/track.model";
import { calculateBarWidth } from "src/app/shared/utils/calculate-bar-width";

@Component({
  selector: "app-album",
  templateUrl: "./album.component.html",
  styleUrls: ["./album.component.css"],
})
export class AlbumComponent implements OnInit, OnDestroy {
  constructor(private albumService: AlbumService, private trackService: TrackService, private activatedRoute: ActivatedRoute) {}
  calculateBarWidth = calculateBarWidth;
  destroy$ = new Subject();
  album: Album | undefined;
  tracks: Track[] = [];
  trackPlays = 0;
  albumPlays = 0;
  length = 0;
  tags: string[] | undefined;
  cover = '';

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        switchMap((params) => {
          if (params["artist"] && params["album"]) {
            const { artist, album } = params;
            return combineLatest([this.albumService.getAlbumByName(album, artist), this.trackService.getAlbumTracks(album, artist)]);
          }
          return EMPTY;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((coll) => {      
        this.length = 0;
        this.trackPlays = 0;
        this.length = 0;   
        this.album = coll[0];
        if (this.album && this.album.artwork && this.album.artwork.length > 0) this.cover = 'http://localhost:3000/artwork/' + this.album.artwork![0].slice(2).slice(0, -2);       
        this.tracks = coll[1];
        coll[1].map(track => {
          this.length += track.duration ? track.duration : 0;
          this.trackPlays += track.playcount ? track.playcount : 0
        })
        this.albumPlays = Math.floor((this.trackPlays / this.tracks.length) * 100) / 100;  
      });
  }

  setPlaceholderAlbumCover() {

  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}