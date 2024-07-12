import { normalizeLocation } from '../analytics/plausible';

describe('normalizeLocation', () => {
  it('handles dashboard urls', () => {
    expect(normalizeLocation('https://qpayee.com/dashboard/user-slug')).toBe('https://qpayee.com/dashboard/[slug]');

    expect(normalizeLocation('https://qpayee.com/dashboard/user-slug/')).toBe('https://qpayee.com/dashboard/[slug]/');

    expect(normalizeLocation('https://qpayee.com/dashboard/suser-slug/submitted-expenses')).toBe(
      'https://qpayee.com/dashboard/[slug]/submitted-expenses',
    );

    expect(normalizeLocation('https://qpayee.com/dashboard/user-slug/submitted-expenses?status=PAID')).toBe(
      'https://qpayee.com/dashboard/[slug]/submitted-expenses?status=PAID',
    );

    expect(normalizeLocation('https://qpayee.com/collective-slug/expenses')).toBe(
      'https://qpayee.com/collective-slug/expenses',
    );

    expect(normalizeLocation('https://qpayee.com/collective-slug')).toBe('https://qpayee.com/collective-slug');

    expect(normalizeLocation('https://qpayee.com/collective-slug/')).toBe('https://qpayee.com/collective-slug/');

    expect(normalizeLocation('https://qpayee.com/collective-slug/expenses?status=PAID')).toBe(
      'https://qpayee.com/collective-slug/expenses?status=PAID',
    );
  });

  it('handles tokens', () => {
    expect(normalizeLocation('https://qpayee.com/signin/:token')).toBe('https://qpayee.com/signin/[token]');

    expect(normalizeLocation('https://qpayee.com/signin/sent')).toBe('https://qpayee.com/signin/sent');

    expect(normalizeLocation('https://qpayee.com/reset-password/:token')).toBe(
      'https://qpayee.com/reset-password/[token]',
    );

    expect(normalizeLocation('https://qpayee.com/confirm/email/:token')).toBe(
      'https://qpayee.com/confirm/email/[token]',
    );

    expect(normalizeLocation('https://qpayee.com/confirm/guest/:token')).toBe(
      'https://qpayee.com/confirm/guest/[token]',
    );

    expect(normalizeLocation('https://qpayee.com/email/unsubscribe/:email/:slug/:type/:token')).toBe(
      'https://qpayee.com/email/unsubscribe/[email]/[slug]/:type/[token]',
    );

    expect(normalizeLocation('https://qpayee.com/:collectiveSlug/redeem/:code')).toBe(
      'https://qpayee.com/[slug]/redeem/[code]',
    );

    expect(normalizeLocation('https://qpayee.com/redeem/:code')).toBe('https://qpayee.com/redeem/[code]');

    expect(normalizeLocation('https://qpayee.com/:collectiveSlug/redeemed/:code')).toBe(
      'https://qpayee.com/[slug]/redeemed/[code]',
    );

    expect(normalizeLocation('https://qpayee.com/redeemed/:code')).toBe('https://qpayee.com/redeemed/[code]');
  });
});
