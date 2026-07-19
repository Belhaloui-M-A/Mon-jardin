import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { DashboardStats } from '../../../core/models/models';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, ChartModule, TagModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  chartData: any = null;
  chartOptions: any = null;

  get t() { return this.i18n.t(); }

  constructor(
    private http: HttpClient,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.http.get<DashboardStats>('/api/admin/stats').subscribe({
      next: data => {
        this.stats.set(data);
        this.buildChart(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  buildChart(data: DashboardStats): void {
    const labels = data.dailySales.map(d => d.date);
    const values = data.dailySales.map(d => d.revenue);
    this.chartData = {
      labels,
      datasets: [{
        label: this.t.admin_revenue,
        data: values,
        fill: true,
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#16a34a',
      }]
    };
    this.chartOptions = {
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 11 } },
          border: { color: 'rgba(255,255,255,0.08)' }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 11 } },
          border: { color: 'transparent' },
          beginAtZero: true
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }
}
