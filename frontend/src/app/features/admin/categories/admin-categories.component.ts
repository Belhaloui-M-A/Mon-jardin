import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { MessageService, ConfirmationService } from "primeng/api";
import { Category } from "../../../core/models/models";
import { CategoryService } from "../../../core/services/category.service";
import { I18nService } from "../../../core/services/i18n.service";

/**
 * Écran admin de gestion des catégories (CRUD).
 * Aligné sur AdminPlantsComponent : DataTable + Dialog, signals pour l'état.
 */
@Component({
  selector: "app-admin-categories",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: "./admin-categories.component.html",
})
export class AdminCategoriesComponent implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editing = signal<Category | null>(null);
  saving = signal(false);

  form: FormGroup;

  get t() {
    return this.i18n.t();
  }

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private toast: MessageService,
    private confirm: ConfirmationService,
    public i18n: I18nService,
  ) {
    this.form = this.fb.group({
      name: ["", [Validators.required, Validators.maxLength(50)]],
      description: ["", Validators.maxLength(255)],
      imageUrl: [""],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: (c) => {
        this.categories.set(c);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openNew(): void {
    this.editing.set(null);
    this.form.reset({ name: "", description: "", imageUrl: "" });
    this.dialogVisible.set(true);
  }

  openEdit(category: Category): void {
    this.editing.set(category);
    this.form.patchValue(category);
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const editing = this.editing();

    const request$ = editing
      ? this.categoryService.update(editing.id, this.form.value)
      : this.categoryService.create(this.form.value);

    request$.subscribe({
      next: () => {
        this.toast.add({
          severity: "success",
          summary: "Succès",
          detail: editing ? "Catégorie modifiée" : "Catégorie créée",
        });
        this.dialogVisible.set(false);
        this.saving.set(false);
        this.loadCategories();
      },
      error: (err) => {
        this.toast.add({
          severity: "error",
          summary: "Erreur",
          detail: err.error?.message ?? "Opération impossible",
        });
        this.saving.set(false);
      },
    });
  }

  confirmDelete(category: Category): void {
    this.confirm.confirm({
      message:
        this.i18n.currentLang() === "ar"
          ? `حذف الفئة "${category.name}"؟`
          : this.i18n.currentLang() === "en"
            ? `Delete category "${category.name}"?`
            : `Supprimer la catégorie "${category.name}" ?`,
      header: this.i18n.currentLang() === "ar" ? "تأكيد" : "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptLabel:
        this.i18n.currentLang() === "ar"
          ? "حذف"
          : this.i18n.currentLang() === "en"
            ? "Delete"
            : "Supprimer",
      rejectLabel: this.t.admin_cancel,
      accept: () => {
        this.categoryService.delete(category.id).subscribe({
          next: () => {
            this.toast.add({
              severity: "success",
              summary:
                this.i18n.currentLang() === "ar"
                  ? "تم الحذف"
                  : this.i18n.currentLang() === "en"
                    ? "Deleted"
                    : "Supprimée",
              detail: category.name,
            });
            this.loadCategories();
          },
          error: (err) =>
            this.toast.add({
              severity: "error",
              summary: "Erreur",
              detail: err.error?.message ?? "Suppression impossible",
            }),
        });
      },
    });
  }
}
