import { Component } from '@angular/core';
import { GalacticYear } from './galactic-year';

/** The module page of Modul C: "Das galaktische Jahr" in its free-exploration variant. */
@Component({
  selector: 'app-galactic-year-page',
  imports: [GalacticYear],
  template: `<main><app-galactic-year variant="freies-erkunden" /></main>`,
  styles: `:host, main { display: block; }`,
})
export class GalacticYearPage {}
