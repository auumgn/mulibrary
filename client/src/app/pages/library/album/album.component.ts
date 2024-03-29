import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  EMPTY,
  Subject,
  combineLatest,
  distinct,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  first,
  of,
  switchMap,
  take,
  takeUntil,
} from "rxjs";
import { AlbumService } from "src/app/core/services/album.service";
import { TrackService } from "src/app/core/services/track.service";
import { TreeviewService } from "src/app/core/services/treeview-service";
import { Album } from "src/app/shared/models/album.model";
import { Track } from "src/app/shared/models/track.model";
import { calculateBarWidth } from "src/app/shared/utils/calculate-bar-width";
import { FlatNode } from "../sidebar/sidebar-library.component";
import { ScrobbleService } from "src/app/core/services/scrobble.service";
import { BarController, BarElement, CategoryScale, Chart, LinearScale } from "chart.js";
import { getCurrentYear } from "src/app/shared/utils/date.util";


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
    private scrobbleService: ScrobbleService,
    private activatedRoute: ActivatedRoute
  ) {}
  calculateBarWidth = calculateBarWidth;
  chart: any;
  destroy$ = new Subject();
  scrobblesByYear: { year: number; value: number }[] = [];
  album: Album | undefined;
  tracks: Track[] = [];
  trackPlays = 0;
  albumPlays = 0;
  length = 0;
  tags: string[] | undefined;
  cover = "";

  ngOnInit(): void {
    Chart.register(BarController, BarElement, LinearScale, CategoryScale);

    this.activatedRoute.params
      .pipe(
        switchMap((params) => {
          console.log(params);

          if (params["artist"] && params["album"]) {
            const { artist, album } = params;
            return combineLatest([
              this.albumService.getAlbumByName(album, artist),
              this.trackService.getAlbumTracks(album, artist),
              this.scrobbleService.getAlbumScrobblesPerYear(album, artist),
            ]).pipe(take(1));
          }
          return EMPTY;
        })
      )
      .subscribe(([album, tracks, scrobbles]) => {
        console.log("hm no");

        this.length = 0;
        this.trackPlays = 0;
        this.album = album;
        this.scrobblesByYear = Object.entries(scrobbles).map(([year, value]) => ({
          year: Number(year),
          value: value as number,
        }));
        this.createChart();

        if (album) this.treeviewService.updateActiveNode(new FlatNode(album.name, 2, album, false, false, true));
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

  createChart() {
    if (this.scrobblesByYear.length > 0) {
      const labels = this.scrobblesByYear.map((scrobbles) => scrobbles.year);
      const data = this.scrobblesByYear.map(scrobbles => +scrobbles.value);
      const totalYears = getCurrentYear() - 2008;
      
      const colors = new Array(20).fill('#ffffff');
      this.chart = new Chart("albumScrobblesByYear", {
        type: "bar",

        data: {
          // values on X-Axis
          labels,
          datasets: [{
              data,
              borderColor: colors,
              backgroundColor: colors,
              borderWidth: 1,
              barThickness: 10
            }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 2,
          indexAxis: 'y',
          scales: {
            y: {
              ticks: {
                display: true,
              },
            },
          },
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
