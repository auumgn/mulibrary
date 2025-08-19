import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-main-library',
  templateUrl: './main-library.component.html',
  styleUrls: ['./main-library.component.css']
})
export class MainLibraryComponent {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'text/plain',
    })
  };
  constructor(protected http: HttpClient) {}

}
