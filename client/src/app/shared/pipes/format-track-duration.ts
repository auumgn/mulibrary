import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "formatDuration",
})
export class FormatDuration implements PipeTransform {
  transform(timestamp: number | undefined): string {
    if (timestamp) {
      const minutes = Math.floor(timestamp / 60);
      const seconds = Math.floor(timestamp % 60);
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return '';
  }
}
