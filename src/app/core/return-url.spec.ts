import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ReturnUrl } from './return-url';

@Component({ template: '' })
class Blank {}

describe('ReturnUrl', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: Blank }])],
    });
  });

  it('starts at the home screen', () => {
    expect(TestBed.inject(ReturnUrl).url()).toBe('/');
  });

  it('remembers the last page before the settings, with its query', async () => {
    const returnUrl = TestBed.inject(ReturnUrl);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/module/lichtgeschwindigkeit?ziel=mars');
    await router.navigateByUrl('/einstellungen');
    expect(returnUrl.url()).toBe('/module/lichtgeschwindigkeit?ziel=mars');
    await router.navigateByUrl('/heute-nacht');
    await router.navigateByUrl('/einstellungen#oben');
    expect(returnUrl.url()).toBe('/heute-nacht');
  });
});
