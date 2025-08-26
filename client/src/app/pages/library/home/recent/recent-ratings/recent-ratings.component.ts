import { Component, OnInit } from "@angular/core";
import { AlbumService } from "src/app/core/services/album.service";
import { Review } from "src/app/shared/models/review.model";

@Component({
  selector: "app-recent-ratings",
  templateUrl: "./recent-ratings.component.html",
  styleUrl: "./recent-ratings.component.css",
  standalone: false,
})
export class RecentRatingsComponent implements OnInit {
  reviews: Review[] = [];
  circleSize: string = "12px"; // Circle size (e.g., '16px', '24px', '2rem')
  circleSpacing: string = "4px"; // Space between circles (e.g., '2px', '8px', '0.5rem')
  circleColor: string = "#e7e5e4"; // Filled circle color (fill and stroke same color)
  emptyColor: string = "#e5e7eb"; // Empty/half circle background color (light gray)
  emptyStrokeColor: string = "#9ca3af"; // Empty circle border color (gray)
  constructor(private albumService: AlbumService) {}

  ngOnInit(): void {
    this.albumService.getRecentReviews().subscribe((reviews: Review[]) => {
      this.reviews = reviews;
    });
  }

  getRatingCircles(rating: number): string[] {
    const circles: string[] = [];
    const maxCircles = 5;
    const filledCircles = Math.floor(rating / 2);
    const hasHalfCircle = rating % 2 === 1;
    const emptyCircles = maxCircles - filledCircles - (hasHalfCircle ? 1 : 0);

    for (let i = 0; i < filledCircles; i++) {
      circles.push("filled");
    }

    if (hasHalfCircle) {
      circles.push("half");
    }

    for (let i = 0; i < emptyCircles; i++) {
      circles.push("empty");
    }

    return circles;
  }
}
