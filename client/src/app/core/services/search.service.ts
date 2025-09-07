import { Injectable } from "@angular/core";
import { SupabaseService } from "./supabase.service";
import { Album } from "src/app/shared/models/album.model";
import { Artist } from "src/app/shared/models/artist.model";
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from "rxjs";

@Injectable({ providedIn: "root" })
export class SearchService {
  private searchSubject = new Subject<string>();
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public readonly searchResults$:
    | Observable<{
        artists: Artist[];
        albums: Album[];
      }>
    | undefined;
  public readonly isLoading$ = this.isLoadingSubject.asObservable();
  constructor(private supabaseService: SupabaseService) {
    // Setup the search stream with debouncing
    this.searchResults$ = this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(), // Only emit if search term changed
      tap(() => this.isLoadingSubject.next(true)), // Set loading to true
      switchMap((query) => {
        if (!query.trim()) {
          // Return empty results for empty query
          return of({ artists: [], albums: [] });
        }

        // Call searchInternal directly since it now returns Observable
        return this.supabaseService.searchInternal(query).pipe(
          catchError((error) => {
            console.error("Search error:", error);
            return of({ artists: [], albums: [] });
          })
        );
      }),
      tap(() => this.isLoadingSubject.next(false)) // Set loading to false
    );
  }

  // Public method to trigger search
  search(query: string): void {
    this.searchSubject.next(query);
  }
}
