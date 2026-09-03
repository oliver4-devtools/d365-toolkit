/*
 * Oliver 4 D365 Toolkit - the extension shell.
 *
 * toolkit/oliver4-toolkit.js is the toolkit itself; everything in this file
 * exists only to put that script into the page from a toolbar click, without
 * a hosted URL.
 *
 * Three jobs, and nothing else:
 *   1. Put the toolkit into the page when the toolbar icon is clicked, and
 *      take the panel away again on the next click.
 *   2. Grey the icon out on anything that is not a Dynamics host.
 *   3. Use the light mark when the browser is in dark mode.
 */

'use strict';

const TOOLKIT_FILE = 'toolkit/oliver4-toolkit.js';
const OFFSCREEN_PATH = 'offscreen.html';

// Must match PANEL_ID in the toolkit. Only the close half of the toggle reads
// it, and build() removes any panel with this id before it draws a new one, so
// if the two ever drift apart the symptom is a click that reopens rather than
// closes - never two panels.
const PANEL_ID = 'oliver4-d365-toolkit-panel';

// Named for the surface they sit on, not for the colour they are: the navy
// mark is the one for a light toolbar.
const ICONS = {
  light: {
    16: 'icons/mark-on-light-16.png',
    32: 'icons/mark-on-light-32.png',
    48: 'icons/mark-on-light-48.png',
    128: 'icons/mark-on-light-128.png'
  },
  dark: {
    16: 'icons/mark-on-dark-16.png',
    32: 'icons/mark-on-dark-32.png',
    48: 'icons/mark-on-dark-48.png',
    128: 'icons/mark-on-dark-128.png'
  }
};

/* ------------------------------------------------------------ where it runs --- */

// Read back out of the manifest rather than repeated here, so adding a vanity
// domain is one line in manifest.json and the icon lights up on it as well.
const HOST_PATTERNS = (chrome.runtime.getManifest().host_permissions || [])
  .map(toRegExp)
  .filter(Boolean);

function escapeForRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Enough of the match pattern grammar for the patterns this extension ships:
// a scheme, an optional leading *. on the host, and * anywhere in the path.
// Anything it cannot read is dropped rather than guessed at, which costs the
// icon on that host and nothing else.
function toRegExp(pattern) {
  const parts = /^(\*|https?):\/\/([^/]+)(\/.*)$/.exec(pattern);
  if (!parts) return null;
  const scheme = parts[1] === '*' ? 'https?' : parts[1];
  const host = parts[2] === '*'
    ? '[^/]+'
    : parts[2].indexOf('*.') === 0
      ? '(?:[^/]+\\.)?' + escapeForRegExp(parts[2].slice(2))
      : escapeForRegExp(parts[2]);
  const path = parts[3].split('*').map(escapeForRegExp).join('.*');
  return new RegExp('^' + scheme + '://' + host + path, 'i');
}

// A tab's url only reaches an extension that holds a host permission for it,
// so a missing url is itself the answer: not one of ours.
function isToolkitHost(url) {
  return typeof url === 'string' && HOST_PATTERNS.some((pattern) => pattern.test(url));
}

async function refreshTab(tabId, url) {
  try {
    if (isToolkitHost(url)) await chrome.action.enable(tabId);
    else await chrome.action.disable(tabId);
  } catch (error) {
    /* the tab closed while we were looking at it */
  }
}

async function refreshEveryTab() {
  try {
    // The default for every tab we have not seen. Per tab enable() then lifts
    // it on the ones that qualify.
    await chrome.action.disable();
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) await refreshTab(tab.id, tab.url);
  } catch (error) {
    console.warn('Oliver 4 D365 Toolkit could not set the icon state:', error);
  }
}

/* ------------------------------------------------------------------- theme --- */

// There is no API that answers "is the browser toolbar dark". The closest
// signal is prefers-color-scheme, and an offscreen document is the documented
// way for a service worker to read it - that is what the MATCH_MEDIA reason is
// for. The document reports once, the icon is set, and it is closed again, so
// nothing is held open between clicks. The cost is that a theme change made
// mid-session shows up at the next click rather than the moment it happens.
let schemeProbe = null;

async function readColourScheme() {
  if (!chrome.offscreen || !chrome.offscreen.createDocument) return;
  if (schemeProbe) return schemeProbe;
  schemeProbe = (async () => {
    try {
      if (chrome.offscreen.hasDocument && await chrome.offscreen.hasDocument()) return;
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_PATH,
        reasons: ['MATCH_MEDIA'],
        justification: 'Read prefers-color-scheme so the toolbar icon suits the browser theme.'
      });
    } catch (error) {
      // Either the API is not there or a document is already open. Either way
      // the icon keeps what it has, which is the manifest default.
    } finally {
      schemeProbe = null;
    }
  })();
  return schemeProbe;
}

chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== 'oliver4-colour-scheme') return;
  chrome.action.setIcon({ path: message.dark ? ICONS.dark : ICONS.light })
    .catch(() => { /* the icon stays as it was */ });
  if (chrome.offscreen && chrome.offscreen.closeDocument) {
    chrome.offscreen.closeDocument().catch(() => { /* already gone */ });
  }
});

/* ------------------------------------------------------------------- click --- */

// Runs in the page. Returns true if a panel was there and has been taken away,
// which is the second half of the toggle. Removing the node is exactly what the
// panel's own close button does, and the toggle state the toolkit keeps on the
// window survives it, so reopening comes back where you left off.
function removePanel(panelId) {
  var panel = document.getElementById(panelId);
  if (!panel || !panel.parentNode) return false;
  panel.parentNode.removeChild(panel);
  return true;
}

async function openOrClose(tab) {
  if (!tab || typeof tab.id !== 'number') return;
  readColourScheme();

  // Frame 0 only. The toolkit hoists itself to window.top and walks the frame
  // tree from there, so injecting into every frame would only start it several
  // times over.
  const target = { tabId: tab.id, frameIds: [0] };

  try {
    const closed = await chrome.scripting.executeScript({
      target: target,
      world: 'MAIN',
      func: removePanel,
      args: [PANEL_ID]
    });
    if (closed && closed[0] && closed[0].result === true) {
      clearWarning(tab.id);
      return;
    }

    // MAIN, not the isolated world a content script normally gets: the toolkit
    // reads Xrm off the page, and an isolated script cannot see it.
    await chrome.scripting.executeScript({
      target: target,
      world: 'MAIN',
      files: [TOOLKIT_FILE]
    });
    clearWarning(tab.id);
  } catch (error) {
    console.error('Oliver 4 D365 Toolkit could not be injected:', error);
    showWarning(tab.id);
  }
}

function showWarning(tabId) {
  chrome.action.setBadgeText({ tabId: tabId, text: '!' }).catch(() => {});
  chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: '#a4262c' }).catch(() => {});
  chrome.action.setTitle({
    tabId: tabId,
    title: 'Oliver 4 D365 Toolkit could not run on this page. Open the extension’s service worker console for the reason.'
  }).catch(() => {});
}

function clearWarning(tabId) {
  chrome.action.setBadgeText({ tabId: tabId, text: '' }).catch(() => {});
  chrome.action.setTitle({ tabId: tabId, title: 'Oliver 4 D365 Toolkit' }).catch(() => {});
}

/* ------------------------------------------------------------------ events --- */

// Registered at the top level, which a service worker requires: it is stopped
// between clicks and restarted by the next event, so a listener added inside a
// callback would not be there when the event arrives.
chrome.action.onClicked.addListener((tab) => { openOrClose(tab); });

chrome.runtime.onInstalled.addListener(() => { refreshEveryTab(); readColourScheme(); });
chrome.runtime.onStartup.addListener(() => { refreshEveryTab(); readColourScheme(); });

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // status covers navigating away from a Dynamics host, where the new url is
  // withheld from us and only the state change tells us anything happened.
  if (changeInfo.status === 'loading' || changeInfo.url) refreshTab(tabId, tab && tab.url);
});

chrome.tabs.onActivated.addListener(async (info) => {
  try {
    const tab = await chrome.tabs.get(info.tabId);
    refreshTab(info.tabId, tab && tab.url);
  } catch (error) {
    /* the tab went away between the event and the lookup */
  }
});
