import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FlatNode } from 'src/app/pages/library/sidebar/sidebar-library.component';

@Injectable({ providedIn: 'root' })
export class TreeviewService {
  private activeNode: BehaviorSubject<FlatNode | undefined> = new BehaviorSubject<FlatNode | undefined>(undefined);
  activeNode$ = this.activeNode.asObservable();
  constructor(private http: HttpClient) {}

  updateActiveNode(node: FlatNode) {
    this.activeNode.next(node);
  }
 
}
