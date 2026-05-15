import { appInfo } from './app-info';

describe('appInfo', () => {
  it('keeps app metadata available for the Home screen and browser title', () => {
    expect(appInfo.name).toBe('CodeReviewPilot AI');
    expect(appInfo.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(appInfo.developerName).toBe('Jakapan Kanta');
  });

  it('keeps English and Thai release notes aligned by version', () => {
    const englishVersions = appInfo.releaseNotes.en.map((release) => release.version);
    const thaiVersions = appInfo.releaseNotes.th.map((release) => release.version);

    expect(thaiVersions).toEqual(englishVersions);
    expect(englishVersions).toContain(appInfo.version);
  });

  it('requires every release entry to include visible content', () => {
    for (const releases of Object.values(appInfo.releaseNotes)) {
      for (const release of releases) {
        expect(release.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(release.title.trim()).not.toBe('');
        expect(release.items.length).toBeGreaterThan(0);
      }
    }
  });
});
