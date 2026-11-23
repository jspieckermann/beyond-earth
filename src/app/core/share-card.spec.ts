import { TestBed } from '@angular/core/testing';
import { journeyTestProviders } from '../outward-journey/testing';
import { BirthYear } from './birth-year';
import { CARD_HEIGHT, CARD_WIDTH, CardPicture, JourneyCard, ShareCard, cardFileName, cardText, wrapLines } from './share-card';
import { ShareCardDialog } from './share-card-dialog';

function fakeCanvas() {
  const texts: string[] = [];
  /** Where each text was drawn, in the same order. */
  const ys: number[] = [];
  const ctx = {
    texts,
    ys,
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillText: (t: string, _x: number, y: number) => {
      texts.push(t);
      ys.push(y);
    },
    save: vi.fn(),
    restore: vi.fn(),
    clip: vi.fn(),
    roundRect: vi.fn(),
    drawImage: vi.fn(),
    // About half the font size per character, so smaller fonts fit more on a line.
    measureText(t: string) {
      const size = Number(/(d+)px/.exec(this.font)?.[1] ?? 64);
      return { width: t.length * size * 0.47 };
    },
    fillStyle: '',
    font: '',
    textBaseline: '',
  };
  return ctx;
}

describe('cardText', () => {
  it('has the three cards of the concept and never the birth year', () => {
    expect(cardText('kronkorken')).toBe('Wäre die Milchstrasse so gross wie Europa, wäre unser Sonnensystem ein Kronkorken.');
    expect(cardText('muenze')).toBe('Wäre die Milchstrasse eine Münze, läge Andromeda einen halben Meter entfernt.');
    expect(cardText('alter', { planetDative: 'dem Mars', age: '16' })).toBe('Auf dem Mars wäre ich 16.');
  });

  it('has the travel card of "Reisen mit Lichtgeschwindigkeit"', () => {
    const journey = { destination: 'Proxima Centauri', percent: '1', duration: '424 Jahre', generations: 17, lowerBound: false };
    expect(cardText('reise', { journey })).toBe(
      'Nach Proxima Centauri mit 1 % der Lichtgeschwindigkeit: 424 Jahre.\n\nAn Bord vergehen dabei 17 Generationen.',
    );
    expect(cardText('reise', { journey: { ...journey, percent: '20', duration: '21,2 Jahre', generations: 1 } })).toBe(
      'Nach Proxima Centauri mit 20 % der Lichtgeschwindigkeit: 21,2 Jahre.\n\nAn Bord vergeht dabei eine Generation.',
    );
    expect(
      cardText('reise', { journey: { destination: 'Geschosshaufen', percent: '99', duration: '3,7 Mrd. Jahre', generations: 21_000_000, lowerBound: true } }),
    ).toBe(
      'Nach Geschosshaufen mit 99 % der Lichtgeschwindigkeit: mindestens 3,7 Mrd. Jahre.\n\nAn Bord vergehen dabei mindestens 21.000.000 Generationen.',
    );
    expect(cardText('reise')).toBe('Reisen mit Lichtgeschwindigkeit');
  });
});

describe('cardFileName', () => {
  it('names the file after a destination', () => {
    expect(cardFileName('Proxima Centauri')).toBe('proxima-centauri.png');
    expect(cardFileName('Sagittarius A*')).toBe('sagittarius-a.png');
    expect(cardFileName('Boötes-Leerraum')).toBe('booetes-leerraum.png');
    expect(cardFileName('Grosse Magellansche Wolke')).toBe('grosse-magellansche-wolke.png');
    expect(cardFileName('***')).toBe('milchstrasse.png');
  });
});

describe('wrapLines', () => {
  it('breaks text into lines that fit', () => {
    const lines = wrapLines('eins zwei drei vier', 10, (s) => s.length);
    expect(lines).toEqual(['eins zwei', 'drei vier']);
  });

  it('keeps words joined by a no-break space together', () => {
    expect(wrapLines('Bild: ESO · CC BY 4.0', 12, (s) => s.length)).toEqual(['Bild: ESO ·', 'CC BY 4.0']);
  });
});

describe('ShareCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(navigator, 'share');
    Reflect.deleteProperty(navigator, 'canShare');
  });

  it('draws the sentence and the app name', () => {
    const ctx = fakeCanvas();
    TestBed.inject(ShareCard).draw(ctx as unknown as CanvasRenderingContext2D, cardText('kronkorken'));
    expect(ctx.texts.join(' ')).toContain('Kronkorken.');
    expect(ctx.texts.at(-1)).toBe('DIE MILCHSTRASSE ERLEBEN');
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, CARD_WIDTH, CARD_HEIGHT);
  });

  it('draws a picture above the sentence, with its credit', () => {
    const ctx = fakeCanvas();
    const image = {} as CanvasImageSource;
    const picture = { image, width: 960, height: 480, round: false, name: 'Andromeda', credit: 'Bild: Adam Evans · CC BY 2.0' };
    TestBed.inject(ShareCard).draw(ctx as unknown as CanvasRenderingContext2D, 'Nach Andromeda', picture);
    // Fitted into the 880 × 540 box: 880 × 440, centred vertically.
    expect(ctx.drawImage).toHaveBeenCalledWith(image, 100, 160, 880, 440);
    expect(ctx.roundRect).toHaveBeenCalled();
    expect(ctx.texts).toContain('Bild: Adam Evans · CC BY 2.0');
    expect(ctx.texts.at(-1)).toBe('DIE MILCHSTRASSE ERLEBEN');
  });

  it('draws each paragraph on its own lines', () => {
    const ctx = fakeCanvas();
    TestBed.inject(ShareCard).draw(ctx as unknown as CanvasRenderingContext2D, 'Erster Satz.\n\nZweiter Satz.');
    expect(ctx.texts.slice(0, 2)).toEqual(['Erster Satz.', 'Zweiter Satz.']);
  });

  it('makes room for a long sentence and a long credit: nothing overlaps', () => {
    const ctx = fakeCanvas();
    const credit =
      'Bild: Röntgen: NASA/CXC/M. Markevitch et al.; Optisch: NASA/STScI, Magellan/U. Arizona/D. Clowe et al.; Massenkarte: NASA/STScI, ESO WFI, Magellan/U. Arizona/D. Clowe et al. · Gemeinfrei';
    const picture = { image: {} as CanvasImageSource, width: 960, height: 694, round: false, name: 'Geschosshaufen', credit };
    const text = cardText('reise', {
      journey: { destination: 'Geschosshaufen', percent: '10', duration: '37 Mrd. Jahre', generations: 1_472_581_407, lowerBound: true },
    });
    TestBed.inject(ShareCard).draw(ctx as unknown as CanvasRenderingContext2D, text, picture);
    const creditTop = Math.min(...ctx.texts.map((t, i) => (t.startsWith('Bild:') ? ctx.ys[i] : Infinity)));
    const sentence = ctx.texts.map((t, i) => ({ t, y: ctx.ys[i] })).filter(({ t }) => !t.startsWith('Bild:') && t !== 'DIE MILCHSTRASSE ERLEBEN');
    const credits = ctx.texts.filter((t, i) => ctx.ys[i] >= creditTop && t !== 'DIE MILCHSTRASSE ERLEBEN');
    expect(sentence.at(-1)?.t).toBe('Generationen.');
    // The last line of the sentence (about 70 px high) ends above the credit.
    expect((sentence.at(-1)?.y ?? Infinity) + 70).toBeLessThanOrEqual(creditTop);
    expect(credits.join(' ')).toContain('Gemeinfrei');
    // The picture gave up height for the text, but kept at least its minimum.
    const [, , , , height] = ctx.drawImage.mock.calls[0] as number[];
    expect(height).toBeLessThan(540);
    expect(height).toBeGreaterThanOrEqual(320);
  });

  it('draws a sphere without clipping its corners', () => {
    const ctx = fakeCanvas();
    const picture = { image: {} as CanvasImageSource, width: 540, height: 540, round: true, name: 'Mars', credit: 'Bild: SSS' };
    TestBed.inject(ShareCard).draw(ctx as unknown as CanvasRenderingContext2D, 'Nach Mars', picture);
    expect(ctx.drawImage).toHaveBeenCalledWith(picture.image, 270, 110, 540, 540);
    expect(ctx.roundRect).not.toHaveBeenCalled();
  });

  it('renders a PNG through a canvas', async () => {
    const ctx = fakeCanvas();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => cb(new Blob(['png'], { type: 'image/png' })));
    const blob = await TestBed.inject(ShareCard).render('Hallo');
    expect(blob?.type).toBe('image/png');
  });

  it('shares through the share sheet and treats cancelling as no error', async () => {
    const cards = TestBed.inject(ShareCard);
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    const share = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });
    expect(cards.canShareFiles()).toBe(true);
    expect(await cards.share(new Blob(['x']), 'Titel')).toBe('shared');
    share.mockRejectedValueOnce(new DOMException('cancel', 'AbortError'));
    expect(await cards.share(new Blob(['x']), 'Titel')).toBe('cancelled');
    share.mockRejectedValueOnce(new Error('nope'));
    expect(await cards.share(new Blob(['x']), 'Titel')).toBe('failed');
  });

  it('downloads where files cannot be shared', () => {
    const cards = TestBed.inject(ShareCard);
    expect(cards.canShareFiles()).toBe(false);
    URL.createObjectURL = vi.fn(() => 'blob:card');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    expect(cards.download(new Blob(['x']))).toBe('downloaded');
    expect(click).toHaveBeenCalled();
  });
});

describe('ShareCardDialog', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:card');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  async function render(
    kinds: ('kronkorken' | 'muenze' | 'alter' | 'reise')[],
    planet: 'mars' | null = null,
    journey: JourneyCard | null = null,
    picture: CardPicture | null = null,
  ) {
    const blob = new Blob(['png'], { type: 'image/png' });
    TestBed.configureTestingModule({ providers: journeyTestProviders() });
    const cards = TestBed.inject(ShareCard);
    vi.spyOn(cards, 'render').mockResolvedValue(blob);
    const download = vi.spyOn(cards, 'download').mockReturnValue('downloaded');
    const fixture = TestBed.createComponent(ShareCardDialog);
    fixture.componentRef.setInput('kinds', kinds);
    fixture.componentRef.setInput('planet', planet);
    fixture.componentRef.setInput('journey', journey);
    fixture.componentRef.setInput('picture', picture);
    await fixture.whenStable();
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement, download };
  }

  it('previews the card with a text alternative and switches cards', async () => {
    const { el, fixture } = await render(['kronkorken', 'muenze']);
    expect(el.querySelector('img')?.getAttribute('alt')).toContain('Kronkorken');
    const muenze = [...el.querySelectorAll('button')].find((b) => b.textContent === 'Münze') as HTMLButtonElement;
    muenze.click();
    await fixture.whenStable();
    await fixture.whenStable();
    expect(el.querySelector('img')?.getAttribute('alt')).toContain('Münze');
  });

  it('downloads when sharing files is not possible and reports it', async () => {
    const { el, fixture, download } = await render(['kronkorken']);
    const button = [...el.querySelectorAll('button')].find((b) => b.textContent === 'Herunterladen') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    expect(download).toHaveBeenCalled();
    expect(el.querySelector('.status')?.textContent).toContain('gespeichert');
  });

  it('builds the age card from the birth year', async () => {
    localStorage.setItem('be.birthYear', '1996');
    const { el } = await render(['alter'], 'mars');
    expect(TestBed.inject(BirthYear).year()).toBe(1996);
    expect(el.querySelector('img')?.getAttribute('alt')).toContain('Auf dem Mars wäre ich 16.');
  });

  it('builds the travel card from the journey', async () => {
    const journey = { destination: 'Proxima Centauri', percent: '1', duration: '424 Jahre', generations: 17, lowerBound: false };
    const { el } = await render(['reise'], null, journey);
    expect(el.querySelector('img')?.getAttribute('alt')).toContain(
      'Nach Proxima Centauri mit 1 % der Lichtgeschwindigkeit: 424 Jahre. An Bord vergehen dabei 17 Generationen.',
    );
    expect(el.querySelector('.kinds')).toBeNull();
  });

  it('names the travel card file after its destination', async () => {
    const journey = { destination: 'Proxima Centauri', percent: '1', duration: '424 Jahre', generations: 17, lowerBound: false };
    const { el, fixture, download } = await render(['reise'], null, journey);
    ([...el.querySelectorAll('button')].find((b) => b.textContent === 'Herunterladen') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(download).toHaveBeenCalledWith(expect.any(Blob), 'proxima-centauri.png');
  });

  it('keeps the default file name for the other cards', async () => {
    const { el, fixture, download } = await render(['kronkorken']);
    ([...el.querySelectorAll('button')].find((b) => b.textContent === 'Herunterladen') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(download).toHaveBeenCalledWith(expect.any(Blob), 'milchstrasse.png');
  });

  it('names the picture of the travel card in its text alternative and draws it', async () => {
    const journey = { destination: 'Andromeda', percent: '99', duration: '2,5 Mio. Jahre', generations: 14_250, lowerBound: false };
    const picture = { image: {} as CanvasImageSource, width: 960, height: 631, round: false, name: 'Andromeda', credit: 'Bild: Adam Evans · CC BY 2.0' };
    const { el } = await render(['reise'], null, journey, picture);
    expect(el.querySelector('img')?.getAttribute('alt')).toMatch(/^Bildkarte mit einem Bild von Andromeda: Nach Andromeda mit 99 %/);
    expect(TestBed.inject(ShareCard).render).toHaveBeenCalledWith(expect.stringContaining('Nach Andromeda'), picture);
  });

  it('closes on request', async () => {
    const { el, fixture } = await render(['kronkorken']);
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    el.querySelector<HTMLButtonElement>('button[aria-label="Schliessen"]')?.click();
    expect(closed).toHaveBeenCalled();
  });
});
