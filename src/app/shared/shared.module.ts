import { NgModule } from "@angular/core";
import { TimestampToDatePipe } from "./pipes/timestamp-to-date.pipe";
import { FormatDuration } from "./pipes/format-track-duration";
import { RatingComponent } from "./components/rating/rating.component";

@NgModule({
  declarations: [TimestampToDatePipe, FormatDuration, RatingComponent],
  exports: [TimestampToDatePipe, FormatDuration, RatingComponent],
})
export class SharedModule {}
