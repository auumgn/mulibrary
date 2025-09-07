import { Component, OnInit, ElementRef, ViewChild, HostListener } from "@angular/core";
import * as d3 from "d3";
import { ScrobbleService } from "src/app/core/services/scrobble.service";
import { ICategoryScrobbles } from "src/app/shared/models/scrobble.model";

@Component({
  selector: "app-category-chart",
  templateUrl: "./category-chart.component.html",
  styleUrls: ["./category-chart.component.css"],
})
export class CategoryChartComponent implements OnInit {
  colors = {
    Metal: "#1a1a1a",
    "Post-rock": "#94a3b8",
    Pre: "#5b9bae",
    "Minimal Wave": "#cbd5e1",
    Post: "#01719d",
    Industrial: "#0f4b6f",
    Free: "#6ee7b7",
    Folk: "#34d399",
    Ambient: "#22d3ee",
    EBM: "#860926",
    Drone: "#0ea5e9",
    Rock: "#93c5fd",
    Shugazi: "#10b981",
    Classical: "#a78bfa",
    "Hardcore & Crossover": "#c4b5fd",
    "Neo-psychedelia": "#67e8f9",
    Electronic: "#ddd6fe",
    Alt: "#ec4899",
    Now: "#f472b6",
    Singles: "#f9a8d4",
    "City Pop": "#fb7185",
    Kraut: "#ffc498",
    Jazz: "#a2512a",
    Emo: "#fb923c",
    "Noise & Power Electronics": "#fdba74",
    "Singer-Songwriter": "#fbbf24",
    "Hip-Hop": "#fcd34d",
    Powerviolence: "#facc15",
    Pop: "#fde68a",
    Psych: "#fde047",
    "Noise Rock": "#fef08a",
  };

  @ViewChild("chart", { static: true }) chartContainer!: ElementRef;
  categories: ICategoryScrobbles | undefined;

  wiggleEnabled = false;
  wiggleDepth = 0.05;
  wiggleSpeed = 2000;

  private svg: any;
  private x: any;
  private y: any;
  private area: any;
  private stack: any;
  private keys: string[] = [];
  private stackData: any[] = [];
  private color: any;
  private phases: Record<string, number> = {};

  private margin = { top: 20, right: 40, bottom: 30, left: 40 };
  private height = 600 - this.margin.top - this.margin.bottom;
  private width = 0;

  constructor(private scrobbleService: ScrobbleService) {}

  ngOnInit(): void {
    this.scrobbleService.getCategoryScrobbles().subscribe((categories) => {
      if (!categories) return;
      this.categories = categories;
      this.prepareData(categories);
      this.initChart();
      this.updateChart();
      if (this.wiggleEnabled) d3.interval(() => this.animate(), this.wiggleSpeed);
    });
  }

  private prepareData(categories: ICategoryScrobbles) {
    const dates = Array.from(
      new Set(Object.values(categories).flatMap((v) => v.map((d) => new Date(d.date).getTime())))
    )
      .map((t) => new Date(t))
      .sort((a, b) => a.getTime() - b.getTime());

    this.stackData = dates.map((date) => {
      const entry: any = { date };
      Object.keys(categories).forEach((key) => {
        const found = categories[key].find((d) => new Date(d.date).getTime() === date.getTime());
        entry[key] = found ? found.count : 0;
      });
      return entry;
    });
    const colorOrder = Object.keys(this.colors);
    this.keys = Object.keys(categories).sort((a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b));

    this.stackData = this.downsampleData(this.stackData, 6, 12); // every 3rd month
    /*     this.color = d3.scaleOrdinal<string>().domain(this.keys).range(this.colors); */
    this.stack = d3.stack().keys(this.keys).offset(d3.stackOffsetWiggle);
    this.phases = {};
    this.keys.forEach((k) => (this.phases[k] = Math.random() * Math.PI * 2));
  }

  private initChart() {
    const element = this.chartContainer.nativeElement;
    d3.select(element).selectAll("*").remove();

    this.width = (element.offsetWidth || window.innerWidth) - this.margin.left - this.margin.right;

    this.svg = d3
      .select(element)
      .append("svg")
      .attr("width", "100%")
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    this.x = d3
      .scaleTime()
      .domain(d3.extent(this.stackData, (d) => d.date) as [Date, Date])
      .range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);

    this.area = d3
      .area<any>()
      .x((d) => this.x(d.data.date))
      .y0((d) => this.y(d[0]))
      .y1((d) => this.y(d[1]))
      .curve(d3.curveBasis);

    const tooltip = d3
      .select(this.chartContainer.nativeElement)
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "rgba(0,0,0,0.7)")
      .style("color", "#fff")
      .style("padding", "4px 8px")
      .style("border-radius", "4px")
      .style("display", "none");

    const series = this.stack(this.stackData);
    this.y.domain([
      d3.min(series, (s: any) => d3.min(s, (d: any) => d[0])),
      d3.max(series, (s: any) => d3.max(s, (d: any) => d[1])),
    ]);

    // Draw areas
    this.svg
      .selectAll("path.area")
      .data(series)
      .enter()
      .append("path")
      .attr("class", "area")
      .attr("d", this.area)
      .attr("fill", (d: any) => this.colors[d.key as keyof typeof this.colors])
      .style("stroke", "#fff") // black stroke for edges
      .style("stroke-width", 0.3)
      .style("stroke-linejoin", "round")
      .style("opacity", 1)
      .on("mouseover", (event: MouseEvent, d: any) => {
        this.svg.selectAll(".area").style("opacity", 0.25);
        d3.select(event.currentTarget as SVGPathElement).style("opacity", 1);
        tooltip.style("display", "block");
      })
      .on("mousemove", (event: MouseEvent, d: any) => {
        const [mx] = d3.pointer(event, this.svg.node());
        const date = this.x.invert(mx);
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
          .text(`${d.key}, ${date.toLocaleString(undefined, { month: "short", year: "numeric" })}`);
      })
      .on("mouseleave", (_event: MouseEvent) => {
        tooltip.style("display", "none");
        this.svg.selectAll(".area").style("opacity", 1);
      });
  }

  private downsampleData(data: any[], step = 3, minPoints = 12) {
    if (data.length <= minPoints) return data;

    const result = data.filter((_row, i) => i % step === 0);

    // Ensure first element is included
    if (result[0].date.getTime() !== data[0].date.getTime()) {
      result.unshift(data[0]);
    }

    // Ensure last element is included
    if (result[result.length - 1].date.getTime() !== data[data.length - 1].date.getTime()) {
      result.push(data[data.length - 1]);
    }

    return result;
  }

  private updateChart() {
    const series = this.stack(this.stackData);
    this.y.domain([
      d3.min(series, (s: any) => d3.min(s, (d: any) => d[0])),
      d3.max(series, (s: any) => d3.max(s, (d: any) => d[1])),
    ]);
    this.svg.selectAll("path.area").data(series).attr("d", this.area);
  }

  private animate() {
    if (!this.wiggleEnabled) return;

    const t = Date.now() / this.wiggleSpeed;
    const newData = this.stackData.map((row) => {
      const entry: any = { date: row.date };
      this.keys.forEach((key) => {
        const base = row[key];
        const phase = this.phases[key];
        entry[key] = base * (1 - this.wiggleDepth + this.wiggleDepth * 2 * Math.sin(t + phase));
      });
      return entry;
    });

    const series = this.stack(newData);
    this.y.domain([
      d3.min(series, (s: any) => d3.min(s, (d: any) => d[0])),
      d3.max(series, (s: any) => d3.max(s, (d: any) => d[1])),
    ]);

    this.svg.selectAll("path.area").data(series).attr("d", this.area);
  }

  @HostListener("window:resize")
  onResize() {
    if (this.categories) {
      this.prepareData(this.categories);
      this.initChart();
      this.updateChart();
    }
  }
}
