import { Component, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Plant, Category, Page } from '../../../core/models/models';
import { PlantService, CartService } from '../../../core/services/plant-cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { I18nService } from '../../../core/services/i18n.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule,
            ButtonModule, InputTextModule, DropdownModule,
            SliderModule, PaginatorModule, SkeletonModule,
            CheckboxModule, ToastModule],
  providers: [MessageService],
  templateUrl: './catalogue.component.html'
})
export class CatalogueComponent implements OnInit {
  plants = signal<Plant[]>([]);
  categories = signal<Category[]>([]);
  totalRecords = signal(0);
  loading = signal(true);
  addingToCart = signal<number | null>(null);
  viewMode: 'grid' | 'list' = 'grid';

  currentPage = 0;
  pageSize = 12;

  filterForm: FormGroup;

  get t() { return this.i18n.t(); }

  get sortOptions() { return [
    { label: this.t.catalogue_sort_new,  value: 'createdAt' },
    { label: this.t.catalogue_sort_asc,  value: 'price_asc' },
    { label: this.t.catalogue_sort_desc, value: 'price_desc' },
    { label: this.t.catalogue_sort_az,   value: 'name' },
  ]; }

  // end sortOptions

  constructor(
    private fb: FormBuilder,
    private plantService: PlantService,
    private categoryService: CategoryService,
    private cartService: CartService,
    public authService: AuthService,
    private toast: MessageService,
    public i18n: I18nService,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
      search:     [''],
      categoryId: [null],
      minPrice:   [0],
      maxPrice:   [20000],
      inStock:    [false],
      sortBy:     ['createdAt'],
    });
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(cats => this.categories.set(cats));
    this.loadPlants();

    // Réactivité des filtres
    this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadPlants();
    });
  }

  loadPlants(): void {
    this.loading.set(true);
    const f = this.filterForm.value;
    this.plantService.search({
      search:     f.search || undefined,
      categoryId: f.categoryId || undefined,
      minPrice:   f.minPrice > 0 ? f.minPrice : undefined,
      maxPrice:   f.maxPrice < 20000 ? f.maxPrice : undefined,
      inStock:    f.inStock || undefined,
      sortBy:     f.sortBy,
      page:       this.currentPage,
      size:       this.pageSize,
    }).subscribe({
      next: (page: Page<Plant>) => {
        this.plants.set(page.content);
        this.totalRecords.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.loadPlants();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addToCart(plant: Plant, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.toast.add({ severity: 'info', summary: 'Connexion requise', detail: 'Connectez-vous pour ajouter au panier' });
      return;
    }
    if (this.authService.isAdmin()) return;
    this.addingToCart.set(plant.id);
    this.cartService.add(plant.id).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Ajouté !', detail: `${plant.name} ajouté au panier` });
        this.addingToCart.set(null);
      },
      error: err => {
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message });
        this.addingToCart.set(null);
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '', categoryId: null, minPrice: 0,
      maxPrice: 20000, inStock: false, sortBy: 'createdAt'
    });
  }

  getFinalPrice(plant: Plant): number {
    if (plant.discountPercent && plant.discountPercent > 0)
      return plant.price * (1 - plant.discountPercent / 100);
    return plant.price;
  }

  get skeletons() { return Array(12).fill(0); }
}
