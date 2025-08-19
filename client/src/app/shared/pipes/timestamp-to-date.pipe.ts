import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timestampToDate',
    standalone: false
})
export class TimestampToDatePipe implements PipeTransform {
  transform(timestamp: number | undefined): string {
    if (timestamp) {
      if (timestamp < 1e12) {
        timestamp *= 1000; // Multiply by 1000 to convert seconds to milliseconds
      }
  
      const date = new Date(timestamp);
      const currentDate = new Date();
  
      const options = {
        year: date.getFullYear() !== currentDate.getFullYear() ? 'numeric' : undefined,
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      } as const;
  
      return date.toLocaleDateString('en-US', options);
    }
    return ""
  }
}
