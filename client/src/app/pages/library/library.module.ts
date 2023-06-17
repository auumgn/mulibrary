import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainLibraryComponent } from './main/main-library.component';
import { SidebarLibraryComponent } from './sidebar/sidebar-library.component';
import { HomeLibraryComponent } from './home/home-library.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TopArtistsComponent } from './home/top/top-artists.component';
import { TopAlbumsComponent } from './home/top/top-albums.component';
import { TopTracksComponent } from './home/top/top-tracks.component';

const routes: Routes = [
  {
    path: '',
    component: MainLibraryComponent,
    children: [
      {
        path: '',
        component: HomeLibraryComponent
      }
    ]
  }
]

@NgModule({
  declarations: [
    SidebarLibraryComponent,
    MainLibraryComponent,
    HomeLibraryComponent,
    TopArtistsComponent,
    TopAlbumsComponent,
    TopTracksComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]})
export class LibraryModule { }
