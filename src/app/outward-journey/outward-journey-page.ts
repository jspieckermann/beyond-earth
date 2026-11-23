import { Component } from '@angular/core';
import { OutwardJourney } from './outward-journey';

/** The module page of Modul A: the outward journey in its free-exploration variant. */
@Component({
  selector: 'app-outward-journey-page',
  imports: [OutwardJourney],
  template: `<main><app-outward-journey variant="freies-erkunden" /></main>`,
  styles: `:host, main { display: block; }`,
})
export class OutwardJourneyPage {}
