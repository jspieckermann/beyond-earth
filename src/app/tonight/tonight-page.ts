import { Component } from '@angular/core';
import { Tonight } from './tonight';

/** The Heute-Nacht page: the guide for tonight in its free variant. */
@Component({
  selector: 'app-tonight-page',
  imports: [Tonight],
  template: `<main><app-tonight variant="frei" /></main>`,
  styles: `:host, main { display: block; }`,
})
export class TonightPage {}
