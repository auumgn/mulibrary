import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-rating",
  standalone: false,
  templateUrl: "./rating.component.html",
  styleUrls: ["./rating.component.css"],
})
export class RatingComponent {
  @Input() rating: number = 0;
  @Input() circleSize: string = "12px";
  @Input() circleColor: string = "#e7e5e4";
  @Input() emptyColor: string = "#e5e7eb";
  @Input() emptyStrokeColor: string = "#9ca3af";
  @Input() editable: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  hoverRating: number | null = null;
  maxCircles = 5;
  Array = Array;

  displayedRating(): number {
    return this.hoverRating !== null ? this.hoverRating : this.rating;
  }

  getCircleState(circleIndex: number): "empty" | "half" | "full" {
    const currentRating = this.displayedRating();

    // Rating 1-2 fills circle 0, rating 3-4 fills circle 1, etc.
    const circleMinRating = circleIndex * 2 + 1;
    const circleMaxRating = circleIndex * 2 + 2;

    if (currentRating >= circleMaxRating) {
      return "full";
    } else if (currentRating >= circleMinRating) {
      return "half";
    } else {
      return "empty";
    }
  }

  onHover(circleIndex: number, isRightHalf: boolean) {
    if (!this.editable) return;
    this.hoverRating = circleIndex * 2 + (isRightHalf ? 2 : 1);
  }

  onClick(circleIndex: number, isRightHalf: boolean) {
    if (!this.editable) return;
    const newRating = circleIndex * 2 + (isRightHalf ? 2 : 1);
    this.rating = newRating;
    this.ratingChange.emit(newRating);
  }

  onMouseLeave() {
    if (!this.editable) return;
    this.hoverRating = null;
  }
}
