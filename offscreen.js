/*
 * The only reason this document exists: a service worker cannot call
 * matchMedia, and the toolbar icon has to know whether the browser is dark.
 * It reports once and the service worker closes it again.
 */

'use strict';

const dark = matchMedia('(prefers-color-scheme: dark)').matches;
chrome.runtime.sendMessage({ type: 'oliver4-colour-scheme', dark: dark })
  .catch(() => { /* the service worker was not listening; the icon stays as it is */ });
