import { Component, OnInit } from "@angular/core";
import { ICategoryScrobbles, IScrobble } from "../../../shared/models/scrobble.model";
import { getTimestampMonthsAgo, getTimestampYearsAgo } from "src/app/shared/utils/date.util";
import { ScrobbleService } from "../../../core/services/scrobble.service";
import { ChartService } from "src/app/core/services/chart.service";

@Component({
  selector: "app-home-library",
  templateUrl: "./home-library.component.html",
  styleUrls: ["./home-library.component.css"],
  standalone: false,
})
export class HomeLibraryComponent implements OnInit {
  chart: any;
  periods = [3, 12];
  recentScrobbles: IScrobble[] | null = null;

  topArtists: { [period: number]: IScrobble[] } = {};
  topAlbums: { [period: number]: IScrobble[] } = {};
  topTracks: { [period: number]: IScrobble[] } = {};

  constructor(private scrobbleService: ScrobbleService, private chartService: ChartService) {}
  // should you have a multiuse model e.g. scrobble or have smaller ones like ArtistScrobble TrackScrobble etc
  ngOnInit(): void {
    // add unsubscribe
    this.scrobbleService
      .getRecentTracks(1, 10)
      .subscribe((scrobbles: IScrobble[] | null) => (this.recentScrobbles = scrobbles));
    this.chartService.getCategoryPercentages().subscribe((chart) => {
      console.log(chart);
      this.chart = chart;
    });

    this.periods.forEach((period) => {
      this.scrobbleService.getTopArtists(getTimestampMonthsAgo(period)).subscribe((artists: IScrobble[]) => {
        this.topArtists[period] = artists;
      });
      this.scrobbleService.getTopAlbums(getTimestampMonthsAgo(period)).subscribe((albums: IScrobble[]) => {
        this.topAlbums[period] = albums;
      });
      this.scrobbleService.getTopTracks(getTimestampYearsAgo(period)).subscribe((tracks: IScrobble[]) => {
        this.topTracks[period] = tracks;
      });
    });
  }
}
