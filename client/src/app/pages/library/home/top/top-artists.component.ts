import { Component, Input } from '@angular/core';
import { IScrobble } from 'src/app/shared/models/scrobble.model';
import { calculateBarWidth } from 'src/app/shared/utils/calculate-bar-width';

@Component({
    selector: 'app-top-artists',
    templateUrl: './top-artists.component.html',
    styleUrls: ['./top-artists.component.css'],
    standalone: false
})
export class TopArtistsComponent {
  @Input() artists: IScrobble[] = [];
  calculateBarWidth = calculateBarWidth;
}
