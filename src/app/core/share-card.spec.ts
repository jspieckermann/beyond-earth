import { TestBed } from '@angular/core/testing';
import { journeyTestProviders } from '../outward-journey/testing';
import { BirthYear } from './birth-year';
import { CARD_HEIGHT, CARD_WIDTH, ShareCard, cardText, wrapLines } from './share-card';
import { ShareCardDialog } from './share-card-dialog';

function fakeCanvas() {
  const texts: string[] = [];
  const ctx = {
    texts,
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillText: (t: string) => texts.push(t),
    measureText: (t: string) => ({ width: t.length * 30 }),
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
});

describe('wrapLines', () => {
  it('breaks text into lines that fit', () => {
    const lines = wrapLines('eins zwei drei vier', 10, (s) => s.length);
    expect(lines).toEqual(['eins zwei', 'drei vier']);
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

  async function render(kinds: ('kronkorken' | 'muenze' | 'alter')[], planet: 'mars' | null = null) {
    const blob = new Blob(['png'], { type: 'image/png' });
    TestBed.configureTestingModule({ providers: journeyTestProviders() });
    const cards = TestBed.inject(ShareCard);
    vi.spyOn(cards, 'render').mockResolvedValue(blob);
    const download = vi.spyOn(cards, 'download').mockReturnValue('downloaded');
    const fixture = TestBed.createComponent(ShareCardDialog);
    fixture.componentRef.setInput('kinds', kinds);
    fixture.componentRef.setInput('planet', planet);
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

  it('closes on request', async () => {
    const { el, fixture } = await render(['kronkorken']);
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    el.querySelector<HTMLButtonElement>('button[aria-label="Schliessen"]')?.click();
    expect(closed).toHaveBeenCalled();
  });
});
