import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router' // CLI imports router

const routes: Routes = [
  {
    path: 'library',
    loadChildren: () =>
      import('./pages/library/library.module').then(m => m.LibraryModule)
  }
] // sets up routes constant where you define your routes

// configures NgModule imports and exports
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
