// edit-album.component.ts
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AlbumService } from "src/app/core/services/album.service";
import { Album } from "src/app/shared/models/album.model";

@Component({
  selector: "app-edit-album",
  standalone: false,
  templateUrl: "./edit-album.component.html",
  styleUrl: "./edit-album.component.css",
})
export class EditAlbumComponent implements OnInit {
  albumId!: string;
  album!: Album;
  form!: FormGroup;
  artist = "";
  albumName = "";

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private albumService: AlbumService
  ) {}

  ngOnInit(): void {
    this.artist = this.route.snapshot.paramMap.get("artist")!;
    this.albumName = this.route.snapshot.paramMap.get("album")!;

    // Initialize form first
    this.form = this.fb.group({
      rating: [0],
      review: [""],
    });

    this.albumService.getAlbumByName(this.artist, this.albumName).subscribe((album) => {
      if (!album) return;
      this.album = album;

      // Update form with album data using patchValue
      this.form.patchValue({
        rating: album.rating || 0,
        review: album.review || "",
      });
    });
  }

  // Method to handle rating changes from the custom component
  onRatingChange(newRating: number): void {
    this.form.patchValue({ rating: newRating });
  }

  save() {
    if (!this.form.valid) return;
    const { rating, review } = this.form.value;

    this.albumService.upsertReview(this.artist, this.albumName, this.album.id!, rating, review).subscribe({
      next: (res) => {
        this.router.navigate(["../"], { relativeTo: this.route });
      },
      error: (err) => {
        console.error("Update failed:", err);
      },
    });
  }
}
