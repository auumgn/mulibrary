import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EMPTY, Subject, combineLatest, first, switchMap, take, takeUntil } from "rxjs";
import { AlbumService } from "src/app/core/services/album.service";
import { ArtistService } from "src/app/core/services/artist.service";
import { Album } from "src/app/shared/models/album.model";
import { Artist } from "src/app/shared/models/artist.model";
import { calculateBarWidth } from "src/app/shared/utils/calculate-bar-width";
import { FormatDuration } from "src/app/shared/pipes/format-track-duration";
import { normalizeName } from "src/app/shared/utils/normalize-name.util";
import { debug } from "src/app/shared/utils/debug-util";
import { FlatNode } from "../sidebar/sidebar-library.component";
import { TreeviewService } from "src/app/core/services/treeview-service";

@Component({
  selector: "app-artist",
  templateUrl: "./artist.component.html",
  styleUrls: ["./artist.component.css"],
  standalone: false,
})
export class ArtistComponent implements OnInit, OnDestroy {
  constructor(
    private artistService: ArtistService,
    private albumService: AlbumService,
    private treeviewService: TreeviewService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router
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
        })
      )
      .subscribe((data) => {
        debug("artist component returning artist and albums:", data);
        const [artist, albums] = data;
        this.albums = albums;
        this.artist = artist;
        //if (artist) this.treeviewService.updateActiveNode(new FlatNode(artist.name, 1, artist, true, true, true))
        this.albums.map((album) => {
          if (album && album.artwork && album.artwork.length > 0 && album.artwork![0].slice(2).slice(0, -2)) {
            album.artwork = ["http://localhost:3000/artwork/" + album.artwork![0].slice(2).slice(0, -2)];
          }
        });

        /*this.tracks = coll[1];
        coll[1].map(track => {
          this.length += track.duration ? track.duration : 0;
          this.trackPlays += track.playcount ? track.playcount : 0
        })
        this.albumPlays = Math.floor((this.trackPlays / this.tracks.length) * 100) / 100;   */
      });
  }

  setPlaceholderAlbumCover() {}

  navigateToAlbumPage(album: Album) {
    // TODO: album.artist shouldn't be optional?
    this.router.navigate(["library", "album", normalizeName(album.artist!.join("-")), normalizeName(album.name)]);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
