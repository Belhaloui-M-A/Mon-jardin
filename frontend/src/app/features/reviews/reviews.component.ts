import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { Review, ReviewService, ReviewStats } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { I18nService, Translations } from '../../core/services/i18n.service';

interface ReviewTarget {
  key: string;
  labelKey: string;
  icon: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ToastModule, ButtonModule],
  providers: [MessageService],
  templateUrl: './reviews.component.html'
})
export class ReviewsComponent implements OnInit {
  Math = Math;

  getStarLabel(rating: number): string {
    const emojis = ['', '😞', '😕', '😐', '😊', '🤩'];
    const labelKey = ('review_rating_' + rating) as keyof Translations;
    return rating >= 1 && rating <= 5 ? `${emojis[rating]} ${this.t[labelKey] || ''}` : '';
  }

  reviews  = signal<Review[]>([]);
  stats    = signal<ReviewStats | null>(null);
  loading  = signal(true);
  showForm = signal(false);
  submitting = signal(false);
  editingId  = signal<number | null>(null);

  // Form state
  selectedTarget = 'OVERALL';
  hoveredStar    = 0;
  selectedRating = 0;
  comment        = '';

  totalElements = 0;
  currentPage   = 0;
  pageSize      = 8;

  get t()       { return this.i18n.t(); }
  get isRtl()   { return this.i18n.isRtl(); }
  get isLoggedIn() { return this.auth.isLoggedIn(); }
  get isClient()   { return this.auth.isClient(); }

  targets: ReviewTarget[] = [
    { key: 'SERVICE',  labelKey: 'review_service',  icon: '💬', color: '#38bdf8', bg: 'rgba(56,189,248,.1)' },
    { key: 'DELIVERY', labelKey: 'review_delivery', icon: '🚚', color: '#4ade80', bg: 'rgba(74,222,128,.1)' },
    { key: 'QUALITY',  labelKey: 'review_quality',  icon: '🌿', color: '#a78bfa', bg: 'rgba(167,139,250,.1)' },
    { key: 'OVERALL',  labelKey: 'review_overall',  icon: '⭐', color: '#fbbf24', bg: 'rgba(251,191,36,.1)' },
  ];

  constructor(
    private reviewService: ReviewService,
    public auth: AuthService,
    public i18n: I18nService,
    private toast: MessageService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
    this.reviewService.getStats().subscribe(s => this.stats.set(s));
  }

  loadReviews(): void {
    this.loading.set(true);
    this.reviewService.getPublished(this.currentPage, this.pageSize).subscribe({
      next: page => {
        this.reviews.set(page.content);
        this.totalElements = page.totalElements;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openForm(review?: Review): void {
    if (review) {
      this.editingId.set(review.id);
      this.selectedTarget = review.targetType;
      this.selectedRating = review.rating;
      this.comment        = review.comment || '';
    } else {
      this.editingId.set(null);
      this.selectedTarget = 'OVERALL';
      this.selectedRating = 0;
      this.comment        = '';
    }
    this.hoveredStar = 0;
    this.showForm.set(true);
    setTimeout(() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.selectedRating = 0;
    this.comment = '';
    this.hoveredStar = 0;
  }

  submitReview(): void {
    if (this.selectedRating === 0) {
      this.toast.add({ severity: 'warn', summary: '', detail: this.t.review_select_rating });
      return;
    }
    this.submitting.set(true);
    const payload = { targetType: this.selectedTarget, rating: this.selectedRating, comment: this.comment };
    const request$ = this.editingId()
      ? this.reviewService.update(this.editingId()!, { rating: this.selectedRating, comment: this.comment })
      : this.reviewService.submit(payload);

    request$.subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: '✓', detail: this.t.review_success });
        this.closeForm();
        this.loadReviews();
        this.reviewService.getStats().subscribe(s => this.stats.set(s));
        this.submitting.set(false);
      },
      error: err => {
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message || 'Erreur' });
        this.submitting.set(false);
      }
    });
  }

  deleteReview(id: number): void {
    this.reviewService.delete(id).subscribe({
      next: () => {
        this.reviews.update(list => list.filter(r => r.id !== id));
        this.toast.add({ severity: 'info', summary: '', detail: this.t.review_deleted });
      }
    });
  }

  setRating(star: number): void { this.selectedRating = star; }
  hoverStar(star: number):  void { this.hoveredStar = star; }
  leaveStars():             void { this.hoveredStar = 0; }

  getTranslation(key: string): string {
    return (this.t as unknown as Record<string, string>)[key] ?? key;
  }

  getTargetLabel(key: string): string {
    const t = this.targets.find(x => x.key === key);
    return t ? this.getTranslation(t.labelKey) : key;
  }
  getTargetIcon(key: string):  string { return this.targets.find(x => x.key === key)?.icon  ?? '⭐'; }
  getTargetColor(key: string): string { return this.targets.find(x => x.key === key)?.color ?? '#fbbf24'; }
  getTargetBg(key: string):    string { return this.targets.find(x => x.key === key)?.bg    ?? 'rgba(251,191,36,.1)'; }

  getDisplayName(review: Review): string {
    return `${review.user.firstName} ${review.user.lastName[0]}.`;
  }

  getInitials(review: Review): string {
    return `${review.user.firstName[0]}${review.user.lastName[0]}`.toUpperCase();
  }

  isMyReview(review: Review): boolean {
    return this.auth.currentUser()?.email === review.user.email;
  }

  getDistributionCount(rating: number): number {
    return this.stats()?.distribution.find(d => d.rating === rating)?.count ?? 0;
  }

  getDistributionPct(rating: number): number {
    const total = this.stats()?.total ?? 0;
    if (!total) return 0;
    return Math.round((this.getDistributionCount(rating) / total) * 100);
  }

  getAvgForTarget(target: string): number {
    const found = this.stats()?.byTarget.find(b => b.target === target);
    return found ? Math.round(found.avg * 10) / 10 : 0;
  }

  stars(n: number): number[] { return Array(n).fill(0); }
  emptyStars(n: number): number[] { return Array(5 - n).fill(0); }
  range(n: number): number[] { return Array.from({length: n}, (_, i) => i + 1); }

  prevPage(): void { if (this.currentPage > 0) { this.currentPage--; this.loadReviews(); } }
  nextPage(): void {
    if ((this.currentPage + 1) * this.pageSize < this.totalElements) {
      this.currentPage++;
      this.loadReviews();
    }
  }
}
