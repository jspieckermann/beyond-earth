import { Service } from '@angular/core';

export type CardKind = 'kronkorken' | 'muenze' | 'alter' | 'reise';

/** Width and height of a card image (portrait, fits most social feeds). */
export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;
export const APP_NAME = 'Die Milchstrasse erleben';

export interface CardData {
  /** For the age card: the planet in dative form ("dem Mars") and the age ("16"). */
  readonly planetDative?: string;
  readonly age?: string;
  /** For the travel card: the current journey of "Reisen mit Lichtgeschwindigkeit". */
  readonly journey?: JourneyCard;
}

/** A picture shown on a card above the sentence, e.g. the destination of a journey. */
export interface CardPicture {
  readonly image: CanvasImageSource;
  readonly width: number;
  readonly height: number;
  /** A sphere drawn on a transparent square (planets, stars) instead of a rectangular photo. */
  readonly round: boolean;
  /** What the picture shows, for the text alternative of the preview. */
  readonly name: string;
  /** Source and licence, printed small on the card ("Bild: ESO · CC BY 4.0"). */
  readonly credit: string;
}

/** Area of the picture on the card; it gets lower when the text needs the room. */
const PICTURE_BOX = { x: 100, y: 110, width: CARD_WIDTH - 200, height: 540, minHeight: 320 } as const;
/** Space between the picture and the text, and between the text and the credit. */
const PICTURE_GAP = 60;
const CREDIT_GAP = 36;
/** Font sizes of the sentence on a card with a picture, tried from the largest down until everything fits. */
const PICTURE_FONT_SIZES = [64, 58, 52, 46] as const;
const SERIF = '"Cormorant Garamond", Georgia, serif';
const TEXT_WIDTH = CARD_WIDTH - 200;

/** The lines of a text in paragraphs, as they will be drawn. */
function paragraphLines(text: string, measure: (s: string) => number): string[][] {
  return text.split(PARAGRAPH).map((paragraph) => wrapLines(paragraph, TEXT_WIDTH, measure));
}

/** Height of paragraphs: one step per line and half a step between paragraphs. */
function textHeight(paragraphs: string[][], step: number): number {
  const lines = paragraphs.reduce((sum, p) => sum + p.length, 0);
  return lines * step + (paragraphs.length - 1) * (step / 2);
}

export interface JourneyCard {
  readonly destination: string;
  /** Speed as shown, without the sign ("1", "0,0057"). */
  readonly percent: string;
  /** Duration on Earth as shown ("424 Jahre"). */
  readonly duration: string;
  readonly generations: number;
  readonly lowerBound: boolean;
}

/** Separates the paragraphs of a card's text. */
export const PARAGRAPH = '\n\n';

/** File name of the default cards. */
export const DEFAULT_FILE_NAME = 'milchstrasse.png';


function journeyText(j: JourneyCard): string {
  const min = j.lowerBound ? 'mindestens ' : '';
  const generations =
    j.generations === 1 && !j.lowerBound
      ? 'An Bord vergeht dabei eine Generation.'
      : `An Bord vergehen dabei ${min}${j.generations.toLocaleString('de-DE')} Generationen.`;
  return `Nach ${j.destination} mit ${j.percent} % der Lichtgeschwindigkeit: ${min}${j.duration}.${PARAGRAPH}${generations}`;
}

/** A file name from a name: lower case, umlauts written out, other characters as dashes ("Sagittarius A*" → "sagittarius-a.png"). */
export function cardFileName(name: string): string {
  const slug = name
    .toLocaleLowerCase('de-DE')
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `${slug}.png` : DEFAULT_FILE_NAME;
}

/** The headline of a card. Cards never contain the birth year. */
export function cardText(kind: CardKind, data: CardData = {}): string {
  switch (kind) {
    case 'kronkorken':
      return 'Wäre die Milchstrasse so gross wie Europa, wäre unser Sonnensystem ein Kronkorken.';
    case 'muenze':
      return 'Wäre die Milchstrasse eine Münze, läge Andromeda einen halben Meter entfernt.';
    case 'alter':
      return `Auf ${data.planetDative ?? 'dem Mars'} wäre ich ${data.age ?? ''}.`;
    case 'reise':
      return data.journey ? journeyText(data.journey) : 'Reisen mit Lichtgeschwindigkeit';
  }
}

/** Splits text into lines that fit `maxWidth` with the given measure function. */
export function wrapLines(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines: string[] = [];
  let line = '';
  // Only ordinary spaces and line breaks separate words; a no-break space keeps its words together.
  for (const word of text.split(/[ \t\n]+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measure(candidate) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines;
}

export type ShareResult = 'shared' | 'cancelled' | 'downloaded' | 'failed';

/**
 * Picture cards drawn on the device: a night-sky card with one sentence and the app name,
 * shared through the system share sheet, or downloaded where sharing files is not possible.
 */
@Service()
export class ShareCard {
  /** Draws a card onto `ctx` (CARD_WIDTH × CARD_HEIGHT), with an optional picture above the sentence. */
  draw(ctx: CanvasRenderingContext2D, text: string, picture: CardPicture | null = null): void {
    const sky = ctx.createLinearGradient(0, 0, CARD_WIDTH * 0.4, CARD_HEIGHT);
    sky.addColorStop(0, '#0b1124');
    sky.addColorStop(1, '#03050c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    // A quiet, fixed pattern of stars.
    for (let i = 0; i < 140; i++) {
      const x = (i * 397) % CARD_WIDTH;
      const y = (i * 911) % CARD_HEIGHT;
      ctx.fillStyle = `rgba(236, 232, 221, ${0.25 + ((i * 37) % 50) / 100})`;
      ctx.beginPath();
      ctx.arc(x, y, 1 + (i % 3) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.textBaseline = 'top';
    const measure = (s: string) => ctx.measureText(s).width;
    let paragraphs: string[][];
    let step: number;
    let top: number;
    if (picture) {
      // The whole credit, however long: it grows upwards from just above the app name.
      ctx.font = '400 22px Inter, system-ui, sans-serif';
      const credit = wrapLines(picture.credit, TEXT_WIDTH, measure);
      const creditTop = CARD_HEIGHT - 182 - (credit.length - 1) * 28;
      ctx.fillStyle = '#9da2b8';
      credit.forEach((line, i) => ctx.fillText(line, 100, creditTop + i * 28));
      // The largest font whose text still fits below a picture of at least its minimum height.
      const room = creditTop - CREDIT_GAP - PICTURE_BOX.y - PICTURE_GAP;
      let size: number = PICTURE_FONT_SIZES[PICTURE_FONT_SIZES.length - 1];
      for (const candidate of PICTURE_FONT_SIZES) {
        ctx.font = `600 ${candidate}px ${SERIF}`;
        if (room - textHeight(paragraphLines(text, measure), Math.round(candidate * 1.19)) >= PICTURE_BOX.minHeight) {
          size = candidate;
          break;
        }
      }
      ctx.font = `600 ${size}px ${SERIF}`;
      step = Math.round(size * 1.19);
      paragraphs = paragraphLines(text, measure);
      const pictureHeight = Math.max(PICTURE_BOX.minHeight, Math.min(PICTURE_BOX.height, room - textHeight(paragraphs, step)));
      this.drawPicture(ctx, picture, pictureHeight);
      top = PICTURE_BOX.y + pictureHeight + PICTURE_GAP;
    } else {
      ctx.font = `600 76px ${SERIF}`;
      step = 92;
      paragraphs = paragraphLines(text, measure);
      top = 300;
    }
    ctx.fillStyle = '#f3eee2';
    // Paragraphs are separated by half a line of space.
    let y = top;
    paragraphs.forEach((lines, p) => {
      if (p > 0) {
        y += step / 2;
      }
      for (const line of lines) {
        ctx.fillText(line, 100, y);
        y += step;
      }
    });
    ctx.fillStyle = '#f3d9a4';
    ctx.font = '600 30px Inter, system-ui, sans-serif';
    ctx.fillText(APP_NAME.toUpperCase(), 100, CARD_HEIGHT - 140);
  }

  /** The picture, fitted into its box: spheres centred, photos with rounded corners. */
  private drawPicture(ctx: CanvasRenderingContext2D, picture: CardPicture, boxHeight: number): void {
    const box = { ...PICTURE_BOX, height: boxHeight };
    const scale = Math.min(box.width / picture.width, box.height / picture.height);
    const width = picture.width * scale;
    const height = picture.height * scale;
    const x = box.x + (box.width - width) / 2;
    const y = box.y + (box.height - height) / 2;
    ctx.save();
    if (!picture.round && typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 24);
      ctx.clip();
    }
    ctx.drawImage(picture.image, x, y, width, height);
    ctx.restore();
  }

  /** Renders a card to a PNG blob, or null where canvas is not available. */
  async render(text: string, picture: CardPicture | null = null): Promise<Blob | null> {
    if (typeof document === 'undefined') {
      return null;
    }
    await document.fonts?.load?.('600 76px "Cormorant Garamond"').catch(() => undefined);
    const canvas = document.createElement('canvas');
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    this.draw(ctx, text, picture);
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
  }

  /** True when the device can share image files through the system share sheet. */
  canShareFiles(): boolean {
    const nav = globalThis.navigator as Navigator | undefined;
    if (!nav?.canShare || typeof File === 'undefined') {
      return false;
    }
    try {
      return nav.canShare({ files: [new File([''], 'karte.png', { type: 'image/png' })] });
    } catch {
      return false;
    }
  }

  /** Opens the share sheet with the card. Cancelling is not an error. */
  async share(blob: Blob, title: string, fileName = DEFAULT_FILE_NAME): Promise<ShareResult> {
    const file = new File([blob], fileName, { type: 'image/png' });
    try {
      await navigator.share({ files: [file], title });
      return 'shared';
    } catch (error) {
      return error instanceof DOMException && error.name === 'AbortError' ? 'cancelled' : 'failed';
    }
  }

  /** Saves the card as a PNG file. */
  download(blob: Blob, fileName = DEFAULT_FILE_NAME): ShareResult {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return 'downloaded';
  }
}
