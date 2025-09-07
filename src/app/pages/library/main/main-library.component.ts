import { Component, HostListener, OnInit, ViewChild, ElementRef } from "@angular/core";

import { ScrobbleService } from "src/app/core/services/scrobble.service";
import { TimeRangeService } from "src/app/core/services/time-range.service";
/* declare const rangeSlider: any; */
import "range-slider-input/dist/rangeslider.umd.min.js";
import "range-slider-input/dist/style.css";
declare const rangeSlider: any;
@Component({
  selector: "app-main-library",
  templateUrl: "./main-library.component.html",
  styleUrls: ["./main-library.component.css"],
  standalone: false,
})
export class MainLibraryComponent implements OnInit {
  data: any;
  windowWidth!: number;
  points?: number = undefined;
  startDate = new Date(2009, 5, 1);
  endDate = new Date();
  displayRange: string = "";
  totalMonths = 0;
  currentRange: [number, number] = [0, 0];
  leftTooltipText: string = "";
  rightTooltipText: string = "";
  leftTooltipPosition: number = 0;
  rightTooltipPosition: number = 0;

  @ViewChild("leftTooltip") leftTooltip!: ElementRef;
  @ViewChild("rightTooltip") rightTooltip!: ElementRef;

  constructor(private scrobbleService: ScrobbleService, private timeRangeService: TimeRangeService) {}

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.windowWidth = event.target.innerWidth;
    if (this.currentRange.length > 0) {
      this.updateTooltipPositions(this.currentRange);
    }
  }

  ngOnInit(): void {
    this.windowWidth = window.innerWidth;
    this.totalMonths = this.timeRangeService.getTotalMonths();
    this.timeRangeService.sliderRangeMonths$.subscribe((range) => (this.currentRange = range));

    this.scrobbleService.getTimelineSliderScrobbles().subscribe((data) => {
      this.data = data;
      this.points = data?.length;
    });
  }

  ngAfterViewInit() {
    const slider = document.querySelector("#range-slider");
    if (slider) {
      rangeSlider(slider, {
        min: 0,
        max: this.totalMonths,
        step: 1,
        value: this.currentRange,
        onInput: (value: [number, number]) => {
          this.currentRange = value;
          this.updateTooltipPositions(value);
        },
        onThumbDragEnd: () => {
          this.onSliderChange(this.currentRange);
        },
        onRangeDragEnd: () => {
          this.onSliderChange(this.currentRange);
        },
      });

      // Initialize tooltips
      this.updateTooltipPositions(this.currentRange);
    }
  }

  onSliderChange(range: [number, number]) {
    const startDate = new Date(this.startDate);
    startDate.setMonth(this.startDate.getMonth() + range[0]);
    const endDate = new Date(this.startDate);
    endDate.setMonth(this.startDate.getMonth() + range[1]);

    const start_ts = Math.floor(startDate.getTime() / 1000);
    const end_ts = Math.floor(endDate.getTime() / 1000);

    this.timeRangeService.setSliderRange(start_ts, end_ts, range);
  }

  updateTooltipPositions(value: number[]) {
    const slider = document.querySelector("#range-slider");
    const sliderRect = slider?.getBoundingClientRect();

    if (!sliderRect) return;

    // Update tooltip text
    this.leftTooltipText = this.formatDate(value[0]);
    this.rightTooltipText = this.formatDate(value[1]);

    // Calculate thumb positions
    const sliderWidth = sliderRect.width;
    const sliderLeft = sliderRect.left;
    const leftThumbPos = sliderLeft + (value[0] / this.totalMonths) * sliderWidth;
    const rightThumbPos = sliderLeft + (value[1] / this.totalMonths) * sliderWidth;

    // Get tooltip widths (approximate based on text length)
    const avgCharWidth = 7; // approximate character width
    const padding = 16; // px-2 = 8px on each side
    const leftTooltipWidth = this.leftTooltipText.length * avgCharWidth + padding;
    const rightTooltipWidth = this.rightTooltipText.length * avgCharWidth + padding;

    const edgeBuffer = 10;

    // Calculate ideal positions (centered on thumbs)
    let leftPos = leftThumbPos - leftTooltipWidth / 2;
    let rightPos = rightThumbPos - rightTooltipWidth / 2;

    // Apply grow-left constraint for left tooltip (but respect screen bounds)
    const maxLeftPos = leftThumbPos - leftTooltipWidth;
    if (maxLeftPos >= edgeBuffer) {
      leftPos = Math.min(leftPos, maxLeftPos);
    } else {
      leftPos = edgeBuffer;
    }

    // Apply grow-right constraint for right tooltip (but respect screen bounds)
    const minRightPos = rightThumbPos;
    if (minRightPos + rightTooltipWidth <= this.windowWidth - 30) {
      rightPos = Math.max(rightPos, minRightPos);
    } else {
      rightPos = this.windowWidth - rightTooltipWidth - 30;
    }

    // Always respect screen bounds first
    leftPos = Math.max(edgeBuffer, Math.min(leftPos, this.windowWidth - leftTooltipWidth - edgeBuffer));
    rightPos = Math.max(edgeBuffer, Math.min(rightPos, this.windowWidth - rightTooltipWidth - edgeBuffer));

    // Check for overlap and adjust to line up side by side
    const leftRightEdge = leftPos + leftTooltipWidth;
    if (leftRightEdge > rightPos) {
      // Tooltips overlap, line them up
      const totalWidth = leftTooltipWidth + rightTooltipWidth;
      const midPoint = (leftThumbPos + rightThumbPos) / 2;

      // Try to center both around the midpoint
      let newLeftPos = midPoint - totalWidth / 2;
      let newRightPos = newLeftPos + leftTooltipWidth;

      // If this goes out of bounds, push them to fit within screen
      if (newLeftPos < edgeBuffer) {
        newLeftPos = edgeBuffer;
        newRightPos = newLeftPos + leftTooltipWidth;
      } else if (newRightPos + rightTooltipWidth > this.windowWidth - edgeBuffer) {
        newRightPos = this.windowWidth - rightTooltipWidth - edgeBuffer;
        newLeftPos = newRightPos - leftTooltipWidth;
      }

      leftPos = newLeftPos;
      rightPos = newRightPos;
    }

    this.leftTooltipPosition = leftPos;
    this.rightTooltipPosition = rightPos;
  }

  formatRange(value: number[]): string {
    const [startIndex, endIndex] = value;
    const start = new Date(this.startDate);
    start.setMonth(this.startDate.getMonth() + startIndex);
    const end = new Date(this.startDate);
    end.setMonth(this.startDate.getMonth() + endIndex);
    const fmt = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });
    return `${fmt.format(start)} → ${fmt.format(end)}`;
  }

  formatDate(monthIndex: number): string {
    const d = new Date(this.startDate);
    d.setMonth(this.startDate.getMonth() + monthIndex);
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(d);
  }
}
