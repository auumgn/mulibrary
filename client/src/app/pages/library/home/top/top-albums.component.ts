import { Component, Input } from "@angular/core";
import { IScrobble } from "src/app/shared/models/scrobble.model";
import { calculateBarWidth } from "src/app/shared/utils/calculate-bar-width";

@Component({
  selector: 'app-top-albums',
  templateUrl: './top-albums.component.html',
  styleUrls: ['./top-albums.component.css']
})
export class TopAlbumsComponent {
  @Input() albums: IScrobble[] = [];
  calculateBarWidth = calculateBarWidth;
}
