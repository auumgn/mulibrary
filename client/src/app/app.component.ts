import { Component } from "@angular/core";
import { ThemeService } from "./core/services/theme.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  standalone: false,
})
export class AppComponent {
  constructor(private theme: ThemeService) {}
  title = "mulibrary-client";
}
