import { CARD_SPHERE_RADIUS, loadDestinationPicture, pictureCredit } from './destination-picture';

describe('destination picture for the travel card', () => {
  /** jsdom has no HTMLImageElement.decode: stand in for it. */
  function decode(result: Promise<void>) {
    Object.defineProperty(HTMLImageElement.prototype, 'decode', { configurable: true, value: () => result });
  }

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLImageElement.prototype, 'decode');
  });

  const plain = (s: string | undefined) => s?.replaceAll(' ', ' ');

  it('credits the picture with source and licence, keeping the licence together', () => {
    expect(pictureCredit('andromeda')).toBe('Bild: Adam Evans · CC BY 2.0');
    expect(plain(pictureCredit('mars'))).toBe('Bild: Solar System Scope (INOVE), nach Aufnahmen und Daten der NASA · CC BY 4.0');
    // Stars are drawn from the Sun's texture: the picture is credited to it, not to the star catalogue.
    expect(plain(pictureCredit('proxima'))).toBe(plain(pictureCredit('sonne')));
    expect(plain(pictureCredit('geschosshaufen'))).toMatch(/D. Clowe et al. · Gemeinfrei$/);
  });

  it('draws planets and stars as a sphere', async () => {
    const ctx = {
      createImageData: (w: number, h: number) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
    const picture = await loadDestinationPicture('mars');
    expect(picture).toMatchObject({ name: 'Mars', round: true, width: CARD_SPHERE_RADIUS * 2, height: CARD_SPHERE_RADIUS * 2 });
    expect(ctx.putImageData).toHaveBeenCalledTimes(1);
    expect(await loadDestinationPicture('sirius')).toMatchObject({ name: 'Sirius', round: true });
  });

  it('uses the photo of galaxies, far places and Voyager 1', async () => {
    decode(Promise.resolve());
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(960);
    vi.spyOn(HTMLImageElement.prototype, 'naturalHeight', 'get').mockReturnValue(631);
    const picture = await loadDestinationPicture('andromeda');
    expect(picture).toMatchObject({ name: 'Andromeda', round: false, width: 960, height: 631 });
    expect(plain(picture?.credit)).toBe('Bild: Adam Evans · CC BY 2.0');
    expect((picture?.image as HTMLImageElement).getAttribute('src')).toBe('journey/img/andromeda-960.webp');
  });

  it('gives no picture when it cannot be made', async () => {
    decode(Promise.reject(new Error('offline')));
    expect(await loadDestinationPicture('voyager')).toBeNull();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(await loadDestinationPicture('mond')).toBeNull();
  });
});
