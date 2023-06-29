import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SERVER_API_URL } from 'src/app/app.constants';
import { Category } from 'src/app/shared/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categories: BehaviorSubject<Category[] | null> = new BehaviorSubject<
  Category[] | null
  >(null);

  constructor(private http: HttpClient) {}

  getCategories(forceReload = false): Observable<Category[] | null> {
    if (!this.categories.value || forceReload) {
      this.fetcnCategories().subscribe();
    }      
    return this.categories.asObservable();
  }

  private fetcnCategories(): any {
    return this.http
      .get<Category[]>(`${SERVER_API_URL}/category/all`, {
        observe: 'response',
      })
      .pipe(
        catchError((error) => {
          return of('Error occurred:', error);
        }),
        map((response) => {
          if (response.status === 200) {
            return response.body;
          } else {
            console.log('Request failed with status:', response.status);
          }
        }),
        tap((response) => this.categories.next(response))
      );
  }
}
