import { Component, ElementRef, HostListener, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { SearchService } from "src/app/core/services/search.service";
import { Album } from "src/app/shared/models/album.model";
import { normalizeName } from "src/app/shared/utils/normalize-name.util";

@Component({
  selector: "app-library-search",
  standalone: false,
  templateUrl: "./library-search.component.html",
  styleUrl: "./library-search.component.css",
})
export class LibrarySearchComponent implements OnInit, OnDestroy {
  searchControl = new FormControl("");
  searchResults$ = this.searchService.searchResults$;
  isLoading$ = this.searchService.isLoading$;
  showResults = false;
  private destroy$ = new Subject<void>();

  constructor(private searchService: SearchService, private elRef: ElementRef, private router: Router) {}

  @HostListener("document:click", ["$event"])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showResults = false;
    }
  }

  // Optionally, show tooltip when focusing on input
  onFocus() {
    this.showResults = true;
  }

  ngOnInit() {
    // Subscribe to search input changes and trigger search
    this.searchControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      console.log(value);

      this.searchService.search(value || "");
      this.showResults = true;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToAlbumPage(artist: string[], album: string) {
    this.router.navigate(["library", "album", normalizeName(artist!.join("-")), normalizeName(album)]);
  }

  navigateToArtistPage(artist: string) {
    this.router.navigate(["library", "artist", normalizeName(artist)]);
  }
}
