import { Component, OnInit } from "@angular/core";
import { FlatNode } from "../sidebar/sidebar-library.component";
import { debug } from "src/app/shared/utils/debug-util";
import { EMPTY, Subject, combineLatest, switchMap, take } from "rxjs";
import { ArtistService } from "src/app/core/services/artist.service";
import { TreeviewService } from "src/app/core/services/treeview-service";
import { ActivatedRoute, Router } from "@angular/router";
import { calculateBarWidth } from "src/app/shared/utils/calculate-bar-width";
import { Artist } from "src/app/shared/models/artist.model";
import { normalizeName } from "src/app/shared/utils/normalize-name.util";

@Component({
    selector: "app-category",
    templateUrl: "./category.component.html",
    styleUrls: ["./category.component.css"],
    standalone: false
})
export class CategoryComponent implements OnInit {
  constructor(
    private artistService: ArtistService,
    private treeviewService: TreeviewService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router
  ) {}
  calculateBarWidth = calculateBarWidth;
  destroy$ = new Subject();
  artists: Artist[] = [];
  trackPlays = 0;
  albumPlays = 0;
  length = 0;
  tags: string[] | undefined;
  category: string | undefined;

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        switchMap((params) => {
          if (params["category"]) {
            const { category } = params;
            this.category = category;
            this.treeviewService.updateActiveNode(new FlatNode(category, 0, undefined, false, true, true));
            return this.artistService.getArtistsByCategory(category).pipe(take(1));
          }
          return EMPTY;
        })
      )
      .subscribe((artists) => {
        debug("category component returning relevant artists:", artists);
        this.artists = artists;

        /*this.tracks = coll[1];
        coll[1].map(track => {
          this.length += track.duration ? track.duration : 0;
          this.trackPlays += track.playcount ? track.playcount : 0
        })
        this.albumPlays = Math.floor((this.trackPlays / this.tracks.length) * 100) / 100;   */
      });
  }

  navigateToArtistPage(artist: Artist) {
    // TODO: album.artist shouldn't be optional?
    this.router.navigate(["library", "artist", normalizeName(artist.name)]);
  }
}
