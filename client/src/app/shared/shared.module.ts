import { NgModule } from '@angular/core';
import { TimestampToDatePipe } from './pipes/timestamp-to-date.pipe';

@NgModule({
  declarations: [
    TimestampToDatePipe
  ],
  exports: [
    TimestampToDatePipe
  ]
})
export class SharedModule { }
