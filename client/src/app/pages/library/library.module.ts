import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { MainLibraryComponent } from "./main/main-library.component";
import { SidebarLibraryComponent } from "./sidebar/sidebar-library.component";
import { SidebarLibraryTestComponent } from "./sidebar/sidebar-library-test.component";
import { SidebarLibraryDiyComponent } from "./sidebar/sidebar-library-diy.component";

import { HomeLibraryComponent } from "./home/home-library.component";
import { SharedModule } from "src/app/shared/shared.module";
import { TopArtistsComponent } from "./home/top/top-artists.component";
import { TopAlbumsComponent } from "./home/top/top-albums.component";
import { TopTracksComponent } from "./home/top/top-tracks.component";
import { MatTreeModule } from "@angular/material/tree";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { AlbumComponent } from './album/album.component';

const routes: Routes = [
  {
    path: "",
    component: MainLibraryComponent,
    children: [
      {
        path: "",
        component: HomeLibraryComponent,
      },
      {
        path: "album/:artist/:album",
        component: AlbumComponent
      }
    ],
  },
];

@NgModule({
  declarations: [
    SidebarLibraryComponent,
    SidebarLibraryDiyComponent,
    SidebarLibraryTestComponent,
    MainLibraryComponent,
    HomeLibraryComponent,
    TopArtistsComponent,
    TopAlbumsComponent,
    TopTracksComponent,
    AlbumComponent
  ],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule, MatTreeModule, MatButtonModule, MatIconModule],
})
export class LibraryModule {}
