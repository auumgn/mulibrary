import { Injectable, Renderer2, RendererFactory2 } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: "light" | "dark" = "dark";

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    // Initialize from localStorage if available
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme("dark"); // default
    }
  }

  getTheme(): "light" | "dark" {
    return this.currentTheme;
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme === "light" ? "dark" : "light");
  }

  setTheme(theme: "light" | "dark"): void {
    const root = document.documentElement;

    if (theme === "dark") {
      this.renderer.setAttribute(root, "data-theme", "dark");
    } else {
      this.renderer.removeAttribute(root, "data-theme");
    }

    this.currentTheme = theme;
    localStorage.setItem("theme", theme);
  }
}
