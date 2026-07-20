import { Routes } from '@angular/router';
import { AngularDemoComponent } from './pages/angular/angular-demo';
import { ReactDemoComponent } from './pages/react/react-demo';

export const routes: Routes = [
  { path: '', component: AngularDemoComponent },
  { path: 'react', component: ReactDemoComponent },
];
