import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { MainLibraryComponent } from "./main/main-library.component";
import { SidebarLibraryComponent } from "./sidebar/sidebar-library.component";

import { HomeLibraryComponent } from "./home/home-library.component";
import { SharedModule } from "src/app/shared/shared.module";
import { TopArtistsComponent } from "./home/top/top-artists.component";
import { TopAlbumsComponent } from "./home/top/top-albums.component";
import { TopTracksComponent } from "./home/top/top-tracks.component";
import { AlbumComponent } from './album/album.component';
import { ArtistComponent } from './artist/artist.component';
import { CategoryComponent } from './category/category.component';

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
      },
      {
        path: "artist/:artist",
        component: ArtistComponent
      },
      {
        path: "category/:category",
        component: CategoryComponent
      }
    ],
  },
];

@NgModule({
  declarations: [
    SidebarLibraryComponent,
    MainLibraryComponent,
    HomeLibraryComponent,
    TopArtistsComponent,
    TopAlbumsComponent,
    TopTracksComponent,
    AlbumComponent,
    ArtistComponent,
    CategoryComponent
  ],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class LibraryModule {}
