import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, filter, map, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SERVER_API_URL } from "src/app/app.constants";
import { ITreenode } from "src/app/shared/models/treenode.model";
import { Category } from "src/app/shared/models/category.model";

@Injectable({ providedIn: "root" })
export class CategoryService {
  private categories: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);

  constructor(private http: HttpClient) {}

  getCategories(forceReload = false): Observable<Category[]> {
    if (this.categories.value.length === 0 || forceReload) {
      this.fetchCategories().subscribe();
    }
    return this.categories.pipe(filter((category) => category && category.length > 0));
  }

  private fetchCategories(): any {
    return this.http
      .get<Category[]>(`${SERVER_API_URL}/category/all`, {
        observe: "response",
      })
      .pipe(
        catchError((error) => {
          return of("Error occurred:", error);
        }),
        map((response) => {
          if (response.status === 200) {
            this.categories.next(response.body);
          } else {
            console.error("Request failed with status:", response.status);
          }
        })
      );
  }
}
