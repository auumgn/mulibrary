import { Component, OnInit } from "@angular/core";
import { ScrobbleService } from "src/app/core/services/scrobble.service";
import { calculateBarWidth } from "src/app/shared/utils/calculate-bar-width";

@Component({
  selector: "app-top-categories",
  standalone: false,
  templateUrl: "./top-categories.component.html",
  styleUrl: "./top-categories.component.css",
})
export class TopCategoriesComponent implements OnInit {
  calculateBarWidth = calculateBarWidth;
  categories: {
    category: string;
    playcount: number;
  }[] = [];
  constructor(private scrobbleService: ScrobbleService) {}
  ngOnInit(): void {
    this.scrobbleService.getTopCategories().subscribe((categories) => (this.categories = categories));
  }
}
