import { Injectable } from "@angular/core";
import { ScrobbleService } from "./scrobble.service";
import { ICategoryScrobbles } from "src/app/shared/models/scrobble.model";
import { map, Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class ChartService {
  categories: ICategoryScrobbles | null = {};
  constructor(private scrobbleService: ScrobbleService) {}

  getCategoryPercentages() {
    return this.scrobbleService.getCategoryScrobbles().pipe(map((categories) => {}));
  }
}
