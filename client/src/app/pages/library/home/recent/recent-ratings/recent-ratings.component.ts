import { Component, OnInit } from "@angular/core";
import { AlbumService } from "src/app/core/services/album.service";
import { Album } from "src/app/shared/models/album.model";
import { Review } from "src/app/shared/models/review.model";

@Component({
  selector: "app-recent-ratings",
  templateUrl: "./recent-ratings.component.html",
  styleUrl: "./recent-ratings.component.css",
  standalone: false,
})
export class RecentRatingsComponent implements OnInit {
  albums: Album[] = [];

  constructor(private albumService: AlbumService) {}

  ngOnInit(): void {
    this.albumService.getRecentReviews().subscribe((reviews: Album[]) => {
      this.albums = reviews;
    });
  }
}
