import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EMPTY, Subject, combineLatest, distinct, distinctUntilChanged, distinctUntilKeyChanged, first, of, switchMap, take, takeUntil } from "rxjs";
import { AlbumService } from "src/app/core/services/album.service";
import { TrackService } from "src/app/core/services/track.service";
import { TreeviewService } from "src/app/core/services/treeview-service";
import { Album } from "src/app/shared/models/album.model";
import { Track } from "src/app/shared/models/track.model";
import { calculateBarWidth } from "src/app/shared/utils/calculate-bar-width";
import { FlatNode } from "../sidebar/sidebar-library.component";

@Component({
  selector: "app-album",
  templateUrl: "./album.component.html",
  styleUrls: ["./album.component.css"],
})
export class AlbumComponent implements OnInit, OnDestroy {
  constructor(
    private albumService: AlbumService,
    private trackService: TrackService,
    private treeviewService: TreeviewService,
    private activatedRoute: ActivatedRoute
  ) {}
  calculateBarWidth = calculateBarWidth;
  destroy$ = new Subject();
  album: Album | undefined;
  tracks: Track[] = [];
  trackPlays = 0;
  albumPlays = 0;
  length = 0;
  tags: string[] | undefined;
  cover = "";

  ngOnInit(): void {
    
    this.activatedRoute.params
      .pipe(
        switchMap((params) => {
          console.log(params);
          
          if (params["artist"] && params["album"]) {
            const { artist, album } = params;
            return combineLatest([
              this.albumService.getAlbumByName(album, artist),
              this.trackService.getAlbumTracks(album, artist),
            ]).pipe(take(1));
          }
          return EMPTY;
        }),
      )
      .subscribe(([album, tracks]) => {
        console.log(album,tracks);
        
        this.length = 0;
        this.trackPlays = 0;
        this.album = album;
        
        if (album) this.treeviewService.updateActiveNode(new FlatNode(album.name, 2, album, false, false, true))
        if (this.album && this.album.artwork && this.album.artwork.length > 0)
          this.cover = "http://localhost:3000/artwork/" + this.album.artwork![0].slice(2).slice(0, -2);
        this.tracks = tracks;
        tracks.map((track) => {
          this.length += track.duration ? track.duration : 0;
          this.trackPlays += track.playcount ? track.playcount : 0;
        });
        this.albumPlays = Math.floor((this.trackPlays / this.tracks.length) * 100) / 100;
      });
  }

  setPlaceholderAlbumCover() {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
