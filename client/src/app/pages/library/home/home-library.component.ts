import { Component, OnInit } from "@angular/core";
import { ICategoryScrobbles, IScrobble } from "../../../shared/models/scrobble.model";
import { getTimestampMonthsAgo, getTimestampYearsAgo } from "src/app/shared/utils/date.util";
import { ScrobbleService } from "../core/services/scrobble.service";
import { Chart } from "chart.js/auto";

@Component({
  selector: "app-home-library",
  templateUrl: "./home-library.component.html",
  styleUrls: ["./home-library.component.css"],
})
export class HomeLibraryComponent implements OnInit {
  chart: any;
  periods = [3, 12, 60];

  recentScrobbles: IScrobble[] | null = null;

  topArtists: { [period: number]: IScrobble[] } = {};
  topAlbums: { [period: number]: IScrobble[] } = {};
  topTracks: { [period: number]: IScrobble[] } = {};

  categories: ICategoryScrobbles | null = {};

  constructor(private scrobbleService: ScrobbleService) {}
  // should you have a multiuse model e.g. scrobble or have smaller ones like ArtistScrobble TrackScrobble etc
  ngOnInit(): void {
    // add unsubscribe
    this.scrobbleService
      .getRecentTracks(1, 10)
      .subscribe((scrobbles: IScrobble[] | null) => (this.recentScrobbles = scrobbles));

    this.scrobbleService.getCategoryScrobbles().subscribe((categories: ICategoryScrobbles | null) => {
      console.log(categories);
      
      this.categories = categories;
      this.createChart();
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

  /*
[
            {
              label: "Sales",
              data: ["467", "576", "572", "79", "92", "574", "573", "576"],
              borderColor: "#C7C7C7",
              tension: 0.4,
              borderWidth: 1,
            },
            {
              label: "Profit",
              data: ["542", "542", "536", "327", "17", "0.00", "538", "541"],
              borderColor: "#C7C7C7",
              tension: 0.4,
              borderWidth: 1,
            },
          ]
*/
  createChart() {
    const colors = [
      "#64748b",
      "#94a3b8",
      "#cbd5e1",
      "#10b981",
      "#34d399",
      "#6ee7b7",
      "#22d3ee",
      "#67e8f9",
      "#1a2e05",
      "#a5f3fc",
      "#0ea5e9",
      "#93c5fd",
      "#a78bfa",
      "#c4b5fd",
      "#ddd6fe",
      "#ec4899",
      "#f472b6",
      "#f9a8d4",
      "#fb7185",
      "#fda4af",
      "#f97316",
      "#fb923c",
      "#fdba74",
      "#fbbf24",
      "#fcd34d",
      "#fde68a",
      "#facc15",
      "#fde047",
      "#fef08a",
      "#a3e635",
      "#d9f99d",
    ];
    if (this.categories) {
      console.log(this.categories);

      this.chart = new Chart("MyChart", {
        type: "line", //this denotes tha type of chart

        data: {
          // values on X-Axis
          labels: [
            2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2019, 2022, 2023, 2009, 2010, 2011,
            2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2019, 2022, 2023,
          ],
          datasets: Object.keys(this.categories).map((category, i) => {
            return {
              label: category,
              data: this.categories![category].map((e) => e.count),
              borderColor: colors[i],
              backgroundColor: colors[i],
              tension: 0.4,
              pointRadius: 0,
              borderWidth: 0,
              fill: true,
            };
          }),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 2,
          plugins: {
            tooltip: {
              mode: "index",
            },
            legend: {
              display: false,
            },
          },

          scales: {
            y: {
              stacked: true,
            },
          },
        },
      });
    }
  }
}
