import { isTrustedRedirectHost } from '../url-helpers';

describe('isTrustedRedirectHost', () => {
  it('returns true for valid domains', () => {
    expect(isTrustedRedirectHost('octobox.io')).toBe(true);
    expect(isTrustedRedirectHost('qpayee.com')).toBe(true);
    expect(isTrustedRedirectHost('docs.qpayee.com')).toBe(true);
    expect(isTrustedRedirectHost('app.papertree.earth')).toBe(true);
    expect(isTrustedRedirectHost('gatherfor.org')).toBe(true);
  });

  it('returns false for invalid domains', () => {
    expect(isTrustedRedirectHost('wowoctobox.io')).toBe(false);
    expect(isTrustedRedirectHost('opencollectivez.com')).toBe(false);
    expect(isTrustedRedirectHost('malicious-qpayee.com')).toBe(false);
  });
});
