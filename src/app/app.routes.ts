import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, ResolveFn, Router, Routes } from '@angular/router';
import { findModuleBySlug } from './home/data/modules';

export const APP_TITLE = 'Die Milchstrasse erleben';

const pageTitle = (name: string) => `${name} · ${APP_TITLE}`;

const loadPlaceholder = () => import('./placeholder/placeholder-page').then((m) => m.PlaceholderPage);

const moduleFor = (route: ActivatedRouteSnapshot) => findModuleBySlug(route.paramMap.get('slug'));

/** Unknown module slugs lead back to the sky. */
export const knownModule: CanActivateFn = (route) => (moduleFor(route) ? true : inject(Router).createUrlTree(['/']));

export const moduleHeading: ResolveFn<string> = (route) => moduleFor(route)?.title ?? '';

export const moduleTitle: ResolveFn<string> = (route) => pageTitle(moduleFor(route)?.title ?? '');

function placeholderRoute(path: string, heading: string) {
  return { path, title: pageTitle(heading), data: { heading }, loadComponent: loadPlaceholder };
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', title: APP_TITLE, loadComponent: () => import('./home/home-page').then((m) => m.HomePage) },
  {
    path: 'module/reise-nach-draussen',
    title: pageTitle('Die Reise nach draussen'),
    loadComponent: () => import('./outward-journey/outward-journey-page').then((m) => m.OutwardJourneyPage),
  },
  {
    path: 'module/:slug',
    canActivate: [knownModule],
    resolve: { heading: moduleHeading },
    title: moduleTitle,
    loadComponent: loadPlaceholder,
  },
  placeholderRoute('reise', 'Die Reise'),
  placeholderRoute('heute-nacht', 'Heute Nacht'),
  placeholderRoute('meine-sterne', 'Meine Sterne'),
  placeholderRoute('einstellungen', 'Einstellungen'),
  { path: '**', redirectTo: '' },
];
