import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Plant, Category } from '../../../core/models/models';
import { PlantService } from '../../../core/services/plant-cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-admin-plants',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, TableModule,
            DialogModule, InputTextModule, InputNumberModule, DropdownModule,
            InputTextareaModule, TagModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-plants.component.html'
})
export class AdminPlantsComponent implements OnInit {
  plants = signal<Plant[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingPlant = signal<Plant | null>(null);
  saving = signal(false);

  form: FormGroup;

  get t() { return this.i18n.t(); }

  get difficultyOptions() {
    return [
      { label: this.t.diff_easy,   value: 'FACILE' },
      { label: this.t.diff_medium,  value: 'MOYEN' },
      { label: this.t.diff_hard,    value: 'DIFFICILE' },
    ];
  }

  constructor(
    private fb: FormBuilder,
    private plantService: PlantService,
    private categoryService: CategoryService,
    private toast: MessageService,
    private confirm: ConfirmationService,
    public i18n: I18nService
  ) {
    this.form = this.fb.group({
      name:              ['', Validators.required],
      species:           [''],
      description:       [''],
      price:             [0, [Validators.required, Validators.min(1)]],
      stock:             [0, [Validators.required, Validators.min(0)]],
      imageUrl:          [''],
      wateringFrequency: [''],
      lightRequirement:  [''],
      difficultyLevel:   ['FACILE'],
      adultSize:         [''],
      toxicForAnimals:   [false],
      discountPercent:   [0],
      active:            [true],
      categoryId:        [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(c => this.categories.set(c));
    this.loadPlants();
  }

  loadPlants(): void {
    this.plantService.search({ page: 0, size: 100 }).subscribe({
      next: page => { this.plants.set(page.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openNew(): void {
    this.editingPlant.set(null);
    this.form.reset({ difficultyLevel: 'FACILE', active: true, stock: 0, price: 0, discountPercent: 0, toxicForAnimals: false });
    this.dialogVisible.set(true);
  }

  openEdit(plant: Plant): void {
    this.editingPlant.set(plant);
    this.form.patchValue({ ...plant, categoryId: plant.category?.id });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const { categoryId, ...data } = this.form.value;
    const editing = this.editingPlant();

    const request$ = editing
      ? this.plantService.update(editing.id, data, categoryId)
      : this.plantService.create(data, categoryId);

    request$.subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Succès', detail: editing ? 'Plante modifiée' : 'Plante créée' });
        this.dialogVisible.set(false);
        this.saving.set(false);
        this.loadPlants();
      },
      error: err => {
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message });
        this.saving.set(false);
      }
    });
  }

  confirmDelete(plant: Plant): void {
    this.confirm.confirm({
      message: `${this.t.admin_plant_delete_confirm} (${plant.name})`,
      header: this.i18n.currentLang() === 'ar' ? 'تأكيد' : this.i18n.currentLang() === 'en' ? 'Confirmation' : 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.i18n.currentLang() === 'ar' ? 'حذف' : this.i18n.currentLang() === 'en' ? 'Delete' : 'Supprimer',
      rejectLabel: this.t.admin_cancel,
      accept: () => {
        this.plantService.delete(plant.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: this.i18n.currentLang() === 'ar' ? 'تم الحذف' : this.i18n.currentLang() === 'en' ? 'Deleted' : 'Supprimé', detail: plant.name });
            this.loadPlants();
          }
        });
      }
    });
  }

  getDifficultyColor(level?: string): string {
    return level === 'FACILE' ? 'success' : level === 'MOYEN' ? 'warning' : 'danger';
  }
}
