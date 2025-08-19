import { Injectable } from "@angular/core";
import { ScrobbleService } from "./scrobble.service";
import { CategoryScale, Chart, Filler, LinearScale, LineController, LineElement, PointElement } from "chart.js";
import { ICategoryScrobbles } from "src/app/shared/models/scrobble.model";
import { map, Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class ChartService {
  colors = [
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
  categories: ICategoryScrobbles | null = {};
  constructor(private scrobbleService: ScrobbleService) {
    Chart.register(LineController, PointElement, LineElement, LinearScale, CategoryScale, Filler);
  }

  getCategoryPercentages(): Observable<Chart<"line", any[], string> | null> {
    return this.scrobbleService.getCategoryScrobbles().pipe(
      map((categories) => {
        console.log(categories);

        if (categories && Object.keys(categories).length > 0) {
          console.log("hm");

          const unfilteredDates = Object.values(categories).flatMap((value) =>
            value.map((value) => new Date(value.date).toLocaleDateString("en-US", { year: "numeric", month: "short" }))
          );
          const dates = unfilteredDates.filter((value, index) => unfilteredDates.indexOf(value) === index);
          console.log("HMMM?");

          return new Chart("MyChart", {
            type: "line",

            data: {
              // values on X-Axis
              labels: dates,
              datasets: Object.keys(categories).map((category, i) => {
                return {
                  label: category,
                  data: this.categories![category].map((e) => e.count),
                  borderColor: this.colors[i],
                  backgroundColor: this.colors[i],
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

              scales: {
                y: {
                  stacked: true,
                  ticks: {
                    display: false,
                  },
                },
                x: {
                  ticks: {
                    maxRotation: 90,
                    minRotation: 50,
                  },
                },
              },
            },
          });
        } else {
          console.log("huh");

          return null;
        }
      })
    );
  }
}
