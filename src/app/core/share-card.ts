import { Service } from '@angular/core';

export type CardKind = 'kronkorken' | 'muenze' | 'alter';

/** Width and height of a card image (portrait, fits most social feeds). */
export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;
export const APP_NAME = 'Die Milchstrasse erleben';

export interface CardData {
  /** For the age card: the planet in dative form ("dem Mars") and the age ("16"). */
  readonly planetDative?: string;
  readonly age?: string;
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
  }
}

/** Splits text into lines that fit `maxWidth` with the given measure function. */
export function wrapLines(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
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
  /** Draws a card onto `ctx` (CARD_WIDTH × CARD_HEIGHT). */
  draw(ctx: CanvasRenderingContext2D, text: string): void {
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
    ctx.fillStyle = '#f3eee2';
    ctx.font = '600 76px "Cormorant Garamond", Georgia, serif';
    ctx.textBaseline = 'top';
    const lines = wrapLines(text, CARD_WIDTH - 200, (s) => ctx.measureText(s).width);
    lines.forEach((line, i) => ctx.fillText(line, 100, 300 + i * 92));
    ctx.fillStyle = '#f3d9a4';
    ctx.font = '600 30px Inter, system-ui, sans-serif';
    ctx.fillText(APP_NAME.toUpperCase(), 100, CARD_HEIGHT - 140);
  }

  /** Renders a card to a PNG blob, or null where canvas is not available. */
  async render(text: string): Promise<Blob | null> {
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
    this.draw(ctx, text);
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
  async share(blob: Blob, title: string): Promise<ShareResult> {
    const file = new File([blob], 'milchstrasse.png', { type: 'image/png' });
    try {
      await navigator.share({ files: [file], title });
      return 'shared';
    } catch (error) {
      return error instanceof DOMException && error.name === 'AbortError' ? 'cancelled' : 'failed';
    }
  }

  /** Saves the card as a PNG file. */
  download(blob: Blob): ShareResult {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'milchstrasse.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return 'downloaded';
  }
}
