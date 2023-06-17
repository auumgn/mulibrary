import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-main-library',
  templateUrl: './main-library.component.html',
  styleUrls: ['./main-library.component.css']
})
export class MainLibraryComponent {
  zhopen!: string;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'text/plain',
    })
  };
  constructor(protected http: HttpClient) {}
  
  fetchZhopa() {
    this.http.get<string>('http://localhost:3000/zhopa', {responseType: 'text' as any}).subscribe((zhopen) => this.zhopen = zhopen)
  }
}
