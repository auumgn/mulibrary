import { Component, Input } from "@angular/core";
import { IScrobble } from "src/app/shared/models/scrobble.model";
import { calculateBarWidth } from "src/app/shared/utils/calculate-bar-width";

@Component({
  selector: "app-top-tracks",
  templateUrl: "./top-tracks.component.html",
  styleUrls: ["./top-tracks.component.css"],
})
export class TopTracksComponent {
  @Input() tracks: IScrobble[] = [];
  calculateBarWidth = calculateBarWidth;
}
