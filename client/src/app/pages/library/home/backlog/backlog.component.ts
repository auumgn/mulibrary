import { Component, OnInit } from "@angular/core";
import { AlbumService } from "src/app/core/services/album.service";
import { TimeRangeService } from "src/app/core/services/time-range.service";
import { Album } from "src/app/shared/models/album.model";
import { calculateBarWidth } from "src/app/shared/utils/calculate-bar-width";

@Component({
  selector: "app-backlog",
  standalone: false,
  templateUrl: "./backlog.component.html",
  styleUrl: "./backlog.component.css",
})
export class BacklogComponent implements OnInit {
  albums: Album[] = [];

  constructor(private albumService: AlbumService, private timeRangeService: TimeRangeService) {}

  ngOnInit() {
    this.albumService.getBacklog().subscribe((albums) => {
      this.albums = albums;
    });
  }
}
