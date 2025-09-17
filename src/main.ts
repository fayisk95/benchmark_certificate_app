import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { routes } from './app/app.routes';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  standalone: true,
  imports: []
})
export class App {
  name = 'Certificate Management System';
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(
      BrowserAnimationsModule,
      MatToolbarModule,
      MatSidenavModule,
      MatButtonModule,
      MatIconModule,
      MatListModule
    )
  ]
});