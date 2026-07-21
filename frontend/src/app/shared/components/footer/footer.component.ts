import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { SiteSettingsService } from '../../../core/services/site-settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {
  constructor(
    public i18n: I18nService,
    public siteSettingsService: SiteSettingsService
  ) {}

  get t() { return this.i18n.t(); }

  ngOnInit(): void {
    this.siteSettingsService.fetchSettings();
  }
}
