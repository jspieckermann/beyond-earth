import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';

@Component({ template: '' })
class Blank {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', component: Blank },
          { path: 'heute-nacht', component: Blank },
          { path: 'einstellungen', component: Blank },
        ]),
      ],
    }).compileComponents();
  });

  async function at(url: string) {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the router outlet', async () => {
    const host = await at('/');
    expect(host.querySelector('router-outlet')).not.toBeNull();
  });

  it('shows the settings gear on every page but the home screen and the settings', async () => {
    expect((await at('/heute-nacht')).querySelector('app-settings-link a')?.getAttribute('href')).toBe('/einstellungen');
    expect((await at('/heute-nacht?x=1')).querySelector('app-settings-link')).not.toBeNull();
    expect((await at('/')).querySelector('app-settings-link')).toBeNull();
    expect((await at('/einstellungen')).querySelector('app-settings-link')).toBeNull();
  });
});
