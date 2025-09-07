import { Component, OnInit } from "@angular/core";
import { ICategoryScrobbles, IScrobble } from "../../../shared/models/scrobble.model";
import { getTimestampMonthsAgo, getTimestampYearsAgo } from "src/app/shared/utils/date.util";
import { ScrobbleService } from "../../../core/services/scrobble.service";
import { ChartService } from "src/app/core/services/chart.service";
import { normalizeName } from "src/app/shared/utils/normalize-name.util";

@Component({
  selector: "app-home-library",
  templateUrl: "./home-library.component.html",
  styleUrls: ["./home-library.component.css"],
  standalone: false,
})
export class HomeLibraryComponent implements OnInit {
  normalizeName = normalizeName;
  chart: any;
  periods = [3];
  recentScrobbles: IScrobble[] | null = null;

  topArtists: { [period: number]: IScrobble[] } = {};
  topAlbums: { [period: number]: IScrobble[] } = {};
  topTracks: { [period: number]: IScrobble[] } = {};

  constructor(private scrobbleService: ScrobbleService) {}
  // should you have a multiuse model e.g. scrobble or have smaller ones like ArtistScrobble TrackScrobble etc
  ngOnInit(): void {
    // add unsubscribe
    this.scrobbleService
      .getRecentTracks(1, 10)
      .subscribe((scrobbles: IScrobble[] | null) => (this.recentScrobbles = scrobbles));

    this.periods.forEach((period) => {
      this.scrobbleService.getTopArtists(3).subscribe((artists: IScrobble[]) => {
        this.topArtists[period] = artists;
      });
      this.scrobbleService.getTopAlbums(3).subscribe((albums: IScrobble[]) => {
        this.topAlbums[period] = albums;
      });
      /*    this.scrobbleService.getTopTracks(getTimestampYearsAgo(period)).subscribe((tracks: IScrobble[]) => {
        this.topTracks[period] = tracks;
      }); */
    });
  }
}
