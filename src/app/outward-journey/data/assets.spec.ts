import manifest from '../../../../public/journey/manifest.json';
import { CREDITS, CREDIT_FILES, CreditId } from './credits';

describe('journey assets', () => {
  it('has every credited file in the built asset manifest', () => {
    const built = new Set<string>(manifest);
    for (const [id, files] of Object.entries(CREDIT_FILES)) {
      for (const file of files ?? []) {
        expect(built.has(file), `${id}: ${file}`).toBe(true);
      }
    }
  });

  it('credits every built file (in any of its sizes)', () => {
    const asset = (file: string) => file.replace(/-\d+\.webp$/, '');
    const credited = new Set(Object.values(CREDIT_FILES).flatMap((files) => (files ?? []).map(asset)));
    expect(manifest.filter((file: string) => !credited.has(asset(file)))).toEqual([]);
  });

  it('marks reconstructions, simulations and illustrations honestly', () => {
    const kinds = (ids: CreditId[]) => ids.map((id) => CREDITS[id].kind);
    expect(kinds(['milky-way', 'orion-arm'])).toEqual(['reconstruction', 'reconstruction']);
    expect(CREDITS['cosmic-web'].kind).toBe('simulation');
    expect(kinds(['local-group', 'voyager'])).toEqual(['illustration', 'illustration']);
    expect(kinds(['sgr-a', 'andromeda', 'sun-texture', 'triangulum', 'lmc', 'smc', 'bullet-cluster', 'webb-deep-field', 'jades-gs-z14-0', 'ton-618'])).toEqual(Array(10).fill('photo'));
    expect(kinds(['laniakea', 'cmb'])).toEqual(['illustration', 'data']);
  });
});
