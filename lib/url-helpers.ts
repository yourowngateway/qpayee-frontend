import { find, isEmpty, isUndefined, omit, pickBy } from 'lodash';

import type { TaxFormType } from '../components/dashboard/sections/tax-information/common';

import { CollectiveType } from './constants/collectives';
import { TransactionTypes } from './constants/transactions';
import { getWebsiteUrl } from './utils';

export const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL;
const NEXT_PDF_SERVICE_URL = process.env.NEXT_PDF_SERVICE_URL;

// ---- Utils ----

/**
 * Transform an object into a query string. Strips undefined values.
 *
 * ## Example
 *
 *    > objectToQueryString({a: 42, b: "hello", c: undefined})
 *    "?a=42&b=hello"
 */
const objectToQueryString = options => {
  const definedOptions = pickBy(options, value => value !== undefined);
  if (isEmpty(definedOptions)) {
    return '';
  }

  const encodeValue = value => {
    if (Array.isArray(value)) {
      return value.map(encodeURIComponent).join(',');
    }
    return encodeURIComponent(value);
  };

  return `?${Object.entries(definedOptions)
    .map(([key, value]) => `${key}=${encodeValue(value)}`)
    .join('&')}`;
};

// ---- Routes to other Open Collective services ----

export const collectiveInvoiceURL = (collectiveSlug, hostSlug, startDate, endDate, format) => {
  return `${PDF_SERVICE_URL}/receipts/collectives/${collectiveSlug}/${hostSlug}/${startDate}/${endDate}/receipt.${format}`;
};

export const transactionInvoiceURL = transactionUUID => {
  return `${PDF_SERVICE_URL}/receipts/transactions/${transactionUUID}/receipt.pdf`;
};

export const expenseInvoiceUrl = expenseId => {
  return `${PDF_SERVICE_URL}/expense/${expenseId}/invoice.pdf`;
};

/**
 * `POST` endpoint to generate printable gift cards.
 *
 * @param {string} filename - filename **with** extension
 */
export const giftCardsDownloadUrl = filename => {
  return `${PDF_SERVICE_URL}/giftcards/from-data/${filename}`;
};

// ---- Routes to external services ----

/**
 * @param opts {object} With the following attributes:
 *  - text: Tweet text
 *  - url: A URL to share in the tweet
 *  - via: A Twitter username to associate with the Tweet, such as your site’s Twitter account (default: opencollect)
 */
export const tweetURL = opts => {
  return `https://twitter.com/intent/tweet${objectToQueryString({ via: 'opencollect', ...opts })}`;
};

/**
 * @param opts {object} With the following attributes:
 *  - text: Toot text
 */
export const mastodonShareURL = opts => {
  return `https://toot.kytta.dev/${objectToQueryString({ ...opts })}`;
};

/**
 * Generate a URL from a twitter handle
 */
export const twitterProfileUrl = twitterHandle => {
  return `https://twitter.com/${twitterHandle}`;
};

/**
 * @param opts {object} With the following attributes:
 *  - u: A URL to share in the tweet
 */
export const facebookShareURL = opts => {
  return `https://www.facebook.com/sharer/sharer.php${objectToQueryString(opts)}`;
};

/**
 * @param opts {object} With the following attributes:
 *  - url: The URL of the page that you wish to share.
 *  - title: The title value that you wish you use.
 *  - summary: The description that you wish you use.
 *  - source: The source of the content (e.g., your website or application name)
 *  - mini: A required argument whose value must always be true (default: true)
 */
export const linkedInShareURL = opts => {
  return `https://www.linkedin.com/shareArticle${objectToQueryString({ mini: 'true', ...opts })}`;
};

/**
 * @param address {string} the recipien email (default: '')
 * @param opts {object} With the following attributes:
 *  - cc
 *  - subject
 *  - body
 */
export const mailToURL = (address = '', opts) => {
  return `mailto://${address}${objectToQueryString(opts)}`;
};

export const getDashboardRoute = (account, section = null) => {
  if (!account) {
    return '';
  }
  return `/dashboard/${account.slug}${section ? `/${section}` : ''}`;
};

export const getOauthAppSettingsRoute = (account, app) => {
  return getDashboardRoute(account, `for-developers/oauth/${app.id}`);
};

export const getPersonalTokenSettingsRoute = (account, token) => {
  return getDashboardRoute(account, `for-developers/personal-tokens/${token.id}`);
};

export const getCollectivePageCanonicalURL = account => {
  return getWebsiteUrl() + getCollectivePageRoute(account);
};

export const getCollectivePageRoute = account => {
  if (!account) {
    return '';
  } else if (account.type === CollectiveType.EVENT) {
    const parent = account.parentCollective || account.parent;
    return `/${parent?.slug || 'collective'}/events/${account.slug}`;
  } else if (account.type === CollectiveType.PROJECT) {
    const parent = account.parentCollective || account.parent;
    return `/${parent?.slug || 'collective'}/projects/${account.slug}`;
  } else {
    return `/${account.slug}`;
  }
};

const TRUSTED_DOMAINS = [
  'octobox.io',
  'dotnetfoundation.org',
  'hopin.com',
  'app.papertree.earth',
  'sharedground.co',
  'gatherfor.org',
];
const TRUSTED_ROOT_DOMAINS = ['qpayee.com', 'opencollective.foundation', 'oscollective.org'];

export const isTrustedRedirectHost = host => {
  if (TRUSTED_DOMAINS.includes(host)) {
    return true;
  }

  return TRUSTED_ROOT_DOMAINS.some(domain => {
    return host === domain || host.endsWith(`.${domain}`);
  });
};

export const addParentToURLIfMissing = (router, account, url = '', queryParams = undefined, options = {}) => {
  if (
    [CollectiveType.EVENT, CollectiveType.PROJECT].includes(account?.type) &&
    !router.query.parentCollectiveSlug &&
    !(router.query.eventSlug && router.query.collectiveSlug)
  ) {
    const cleanUrl = url.split('?')[0];
    const urlWithParent = getCollectivePageRoute(account) + cleanUrl;
    const prefix = options?.['prefix'] || '';
    if (isUndefined(queryParams)) {
      queryParams = omit(router.query, ['parentCollectiveSlug', 'collectiveSlug', 'eventSlug']);
    }

    router.push({ pathname: `${prefix}${urlWithParent}`, query: queryParams }, null, { shallow: true });
  }
};

export const isRelativeHref = href => {
  href = href.trim();
  return !href || href.startsWith('#') || href === '/' || new RegExp('^/[^/\\\\]+').test(href);
};

export async function followOrderRedirectUrl(
  router,
  collective,
  order,
  redirectUrl,
  { shouldRedirectParent = false } = {},
) {
  const url = new URL(redirectUrl);
  url.searchParams.set('orderId', order.legacyId);
  url.searchParams.set('orderIdV2', order.id);
  url.searchParams.set('status', order.status);
  const transaction = find(order.transactions, { type: TransactionTypes.CREDIT });
  if (transaction) {
    url.searchParams.set('transactionid', transaction.legacyId);
    url.searchParams.set('transactionIdV2', transaction.id);
  }

  const fallback = `/${collective.slug}/donate/success?OrderId=${order.id}`;
  if (isTrustedRedirectHost(url.host)) {
    if (shouldRedirectParent) {
      window.parent.location.href = url.href;
    } else {
      window.location.href = url.href;
    }
  } else {
    router.push({
      pathname: '/external-redirect',
      query: { url: url.href, fallback, shouldRedirectParent },
    });
  }

  return url;
}

export const getFileExtensionFromUrl = url => {
  if (!url) {
    return null;
  }

  try {
    const urlObject = new URL(url);
    const pathParts = urlObject.pathname.split('.');
    return pathParts[pathParts.length - 1].toLowerCase();
  } catch {
    return null;
  }
};

export const getTaxFormPDFServiceUrl = (type: TaxFormType, values, { isFinal = false, useNext = false }): string => {
  const serviceUrl = (useNext && NEXT_PDF_SERVICE_URL) || PDF_SERVICE_URL;
  const url = new URL(`${serviceUrl}/tax-form/${type}.pdf`);
  const base64Values = Buffer.from(JSON.stringify(values)).toString('base64');
  url.searchParams.set('formType', type);
  url.searchParams.set('values', base64Values);
  url.searchParams.set('isFinal', isFinal.toString());
  return url.toString();
};
