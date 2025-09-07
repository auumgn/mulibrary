import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { SidebarComponent } from "./layout/sidebar/sidebar.component";
import { LoginComponent } from "./pages/login/login.component";
import { ReactiveFormsModule } from "@angular/forms";
import { TopbarComponent } from "./layout/topbar/topbar.component";
import { LibrarySearchComponent } from "./layout/topbar/library-search/library-search.component";
import { HomeComponent } from "./pages/home/home.component";

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    LoginComponent,
    TopbarComponent,
    LibrarySearchComponent,
    HomeComponent,
  ],
  bootstrap: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, NoopAnimationsModule, ReactiveFormsModule],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
