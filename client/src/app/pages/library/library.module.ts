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
import { AlbumComponent } from "./album/album.component";
import { ArtistComponent } from "./artist/artist.component";
import { CategoryComponent } from "./category/category.component";
import { CategoryChartComponent } from "./chart/category-chart/category-chart.component";
import { RecentRatingsComponent } from "./home/recent/recent-ratings/recent-ratings.component";
import { BacklogComponent } from "./home/backlog/backlog.component";
import { ReactiveFormsModule } from "@angular/forms";
import { EditAlbumComponent } from "./album/edit-album/edit-album.component";
import { TopCategoriesComponent } from "./home/top/top-categories/top-categories.component";

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
        component: AlbumComponent,
      },
      {
        path: "album/:artist/:album/edit",
        component: EditAlbumComponent,
      },
      {
        path: "artist/:artist",
        component: ArtistComponent,
      },
      {
        path: "category/:category",
        component: CategoryComponent,
      },
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
    TopCategoriesComponent,
    RecentRatingsComponent,
    AlbumComponent,
    ArtistComponent,
    CategoryComponent,
    BacklogComponent,
    EditAlbumComponent,
  ],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule, CategoryChartComponent, ReactiveFormsModule],
})
export class LibraryModule {}
