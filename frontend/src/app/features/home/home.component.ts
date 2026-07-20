import { Component, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Plant, Category } from "../../core/models/models";
import {
  PlantService,
  CartService,
} from "../../core/services/plant-cart.service";
import { CategoryService } from "../../core/services/category.service";
import { AuthService } from "../../core/services/auth.service";
import { I18nService } from "../../core/services/i18n.service";
import { ReviewService } from "../../core/services/review.service";
import { Review } from "../../core/services/review.service";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [RouterLink, CommonModule, ToastModule],
  providers: [MessageService],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  featuredPlants = signal<Plant[]>([]);
  homeReviews = signal<Review[]>([]);
  loading = signal(true);
  skeletons = Array(8).fill(0);

  totalPlants = signal<number | string>("...");
  totalCategories = signal<number | string>("...");
  categories = signal<Category[]>([]);
  plantOfTheMonth = signal<Plant | null>(null);

  get t() {
    return this.i18n.t();
  }

  get stats() {
    return [
      { value: this.totalPlants(), label: this.t.home_stat_varieties },
      { value: this.totalCategories(), label: this.t.home_stat_categories },
      { value: "48h", label: this.t.home_stat_delivery },
      { value: "100%", label: this.t.home_stat_satisfaction },
    ];
  }



  constructor(
    private plantService: PlantService,
    private cartService: CartService,
    public auth: AuthService,
    public i18n: I18nService,
    private reviewService: ReviewService,
    private categoryService: CategoryService,
    private toast: MessageService,
  ) {}

  ngOnInit(): void {
    this.reviewService
      .getPublished(0, 5)
      .subscribe((p) => this.homeReviews.set(p.content));
    this.plantService
      .search({ page: 0, size: 8, sortBy: "createdAt" })
      .subscribe({
        next: (page) => {
          this.featuredPlants.set(page.content);
          this.loading.set(false);
          this.totalPlants.set(page.totalElements);
        },
        error: () => this.loading.set(false),
      });

    this.plantService.getPlantOfTheMonth().subscribe({
      next: (plant) => {
        if (plant) this.plantOfTheMonth.set(plant);
      },
      error: () => {},
    });

    this.categoryService.getAll().subscribe({
      next: (cats) => {
        this.totalCategories.set(cats.length);
        this.categories.set(cats);
      },
      error: () => {},
    });
  }

  starRange(n: number): number[] {
    return Array(n).fill(0);
  }
  emptyRange(n: number): number[] {
    return Array(5 - n).fill(0);
  }

  addToCart(plant: Plant, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.auth.isLoggedIn()) {
      this.toast.add({
        severity: "info",
        summary: "Info",
        detail: "Connectez-vous pour ajouter au panier",
      });
      return;
    }
    this.cartService.add(plant.id).subscribe({
      next: () =>
        this.toast.add({
          severity: "success",
          summary: "✓",
          detail: plant.name,
        }),
      error: (err) =>
        this.toast.add({
          severity: "error",
          summary: "Erreur",
          detail: err.error?.message,
        }),
    });
  }
}
