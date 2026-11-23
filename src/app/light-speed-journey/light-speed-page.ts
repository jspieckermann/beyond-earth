import { Component, input } from '@angular/core';
import { LightSpeedJourney } from './light-speed-journey';

/**
 * The module page of Modul B: the travel planner in its free-exploration variant. `ziel` picks the
 * destination and `von` the Modul A stage the user came from (bound from the query by the router).
 */
@Component({
  selector: 'app-light-speed-page',
  imports: [LightSpeedJourney],
  template: `<main><app-light-speed-journey variant="freies-erkunden" [destinationId]="ziel() ?? null" [from]="von() ?? null" /></main>`,
  styles: `:host, main { display: block; }`,
})
export class LightSpeedPage {
  readonly ziel = input<string>();
  readonly von = input<string>();
}
