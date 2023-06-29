import { NgModule } from '@angular/core';
import { TimestampToDatePipe } from './pipes/timestamp-to-date.pipe';
import { FormatDuration } from './pipes/format-track-duration';

@NgModule({
  declarations: [
    TimestampToDatePipe,
    FormatDuration
  ],
  exports: [
    TimestampToDatePipe,
    FormatDuration
  ]
})
export class SharedModule { }
