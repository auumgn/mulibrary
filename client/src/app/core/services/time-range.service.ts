import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
@Injectable({ providedIn: "root" })
export class TimeRangeService {
  private sliderRangeSubject = new BehaviorSubject<{ start_ts: number; end_ts: number }>({
    start_ts: Math.floor(new Date(new Date().setFullYear(new Date().getFullYear() - 3)).getTime() / 1000),
    end_ts: Math.floor(new Date().getTime() / 1000),
  });
  private sliderRangeMonthsSubject = new BehaviorSubject<number>(36);
  normalized = false;

  sliderRange$ = this.sliderRangeSubject.asObservable();
  sliderRangeMonths$ = this.sliderRangeMonthsSubject.asObservable();

  setSliderRange(start_ts: number, end_ts: number, rangeMonths: number) {
    this.sliderRangeSubject.next({ start_ts, end_ts });
    this.sliderRangeMonthsSubject.next(rangeMonths);
  }

  getSliderRange(): { start_ts: number; end_ts: number } {
    return this.sliderRangeSubject.value;
  }

  getSliderRangeMonths(): number {
    return this.sliderRangeMonthsSubject.value;
  }

  constructor(private http: HttpClient) {}
}
