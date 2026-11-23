import { Component, input } from '@angular/core';
import { OutwardJourney } from './outward-journey';

/**
 * The module page of Modul A: the outward journey in its free-exploration variant. `stufe` and `nah`
 * (bound from the query by the router) let another module send the user back to a stage and a close-up.
 */
@Component({
  selector: 'app-outward-journey-page',
  imports: [OutwardJourney],
  template: `<main><app-outward-journey variant="freies-erkunden" [startStage]="stufe() ?? null" [startBody]="nah() ?? null" /></main>`,
  styles: `:host, main { display: block; }`,
})
export class OutwardJourneyPage {
  readonly stufe = input<string>();
  readonly nah = input<string>();
}
