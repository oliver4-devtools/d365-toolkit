/*
 * Oliver 4 D365 Toolkit
 * Form helper for Dynamics 365 / model-driven apps.
 *
 * The Oliver 4 D365 Toolkit browser extension injects
 * into the page on a toolbar click. It still runs as a DevTools snippet,
 * pasted and run.
 */
(function () {
  'use strict';

  var PANEL_ID = 'oliver4-d365-toolkit-panel';
  // major.feature.tweak. Major is declared by hand, never inferred. The middle
  // number moves when a new capability lands, the last for adjustments to one
  // that already exists.
  var VERSION = 'v2.3.3';
  var WEBSITE = 'http://www.oliver4-devtools.com/';
  var WEBSITE_LABEL = 'www.oliver4-devtools.com';
  var API_VERSION = 'v9.2';
  var MARK = 'data-oliver4-highlight';
  var WRAP = 'data-oliver4-wrap';

  /* --------------------------------------------------------------- theme --- */

  // Two palettes, one set of tokens. Every themed colour is written into the
  // panel as a CSS custom property on the panel element and referenced through
  // var(), so switching theme is forty property writes on one node rather than
  // a rebuild - the results pane keeps whatever it was showing, and nothing is
  // re-queried. Custom properties are set through the CSSOM, so an enforced
  // Content Security Policy is no more of a problem than it was before.
  //
  // Light is the default. Dark is the palette the panel shipped with up to
  // v2.1.9 and is still the one tuned for reading a long listing at night.
  //
  // Both palettes must carry exactly the same keys. T is built from the light
  // one, so a key missing from light leaves T.<key> undefined and the browser
  // drops the declaration - the failure mode error-test.js was written for. A
  // key missing from dark is invisible that way, because var() is still valid
  // syntax, so theme-test.js compares the two key sets directly.
  var THEMES = {
    light: {
      // Surfaces. The window is white, the bars and the sidebar a shade off it,
      // so the results pane reads as the page and the chrome reads as chrome.
      window: '#ffffff',
      bar: '#fafbfc',
      panel: '#fafbfc',
      results: '#ffffff',

      line: '#e4e6ea',
      lineFaint: '#eef0f3',
      border: '#e4e6ea',
      borderPanel: '#e4e6ea',
      control: '#d3d7dd',
      track: '#c3c7ce',
      hover: '#f2f4f7',
      // The panel floats over somebody's record and has
      // to look like it: a near, tight shadow for the edge, a far, wide one
      // for the lift, and a hairline of the same colour so the boundary holds
      // against a white form behind it.
      shadow: '0 18px 56px rgba(20, 22, 28, 0.30), 0 6px 18px rgba(20, 22, 28, 0.18), 0 0 0 1px rgba(20, 22, 28, 0.07)',

      // Text, strongest first. ink is the primary reading colour - the token
      // most of the panel uses - and it is near black here and white in dark.
      ink: '#15171c',
      text: '#15171c',
      label: '#3f434b',
      soft: '#5b5f68',
      bright: '#1c50b0',
      muted: '#565a62',
      faint: '#64686f',
      dim: '#5f636b',
      empty: '#868c95',

      accent: '#2764cf',
      accentHover: '#1c50b0',
      accentText: '#2764cf',
      accentSoft: '#1c50b0',
      accentTint: '#eef4ff',
      accentTintStrong: '#e3ecfe',
      chipBg: '#edf3fe',
      // Text sitting on a filled accent surface. White in both palettes, and a
      // token rather than a literal so nothing reaches for ink by mistake.
      onAccent: '#ffffff',

      inputBg: '#ffffff',
      inputText: '#15171c',
      inputBorder: '#c6ccd5',
      inputHover: 'rgba(21, 23, 28, 0.08)',

      danger: '#a4262c',
      dangerBg: '#fdf2f3',
      dangerBorder: '#eec0c3',

      radioOff: '#b4b9c1',
      grip: '#84888f',

      // The environment pill in the status bar. Green is the only thing it
      // says: the panel has a live Dynamics client on this page.
      live: '#1a7f43',
      liveBg: '#e7f6ec',
      liveBorder: '#a9dbbc',

      // Syntax colours for the library source viewer. Four and no more -
      // keyword, string, number, comment - because anything finer needs a
      // parser rather than a scanner, and a wrong colour is worse than none.
      // Blue is deliberately not among them: the panel already uses it for
      // values and for anything you would paste into a query.
      codeKeyword: '#7b2fbf',
      codeString: '#0a7a4a',
      codeNumber: '#b1560f',
      codeComment: '#66707c',
      codeFunction: '#0b6a75',
      codeProperty: '#4a5b6e',
      codeConstant: '#a4266c',
      codeOperator: '#6f6675'
    },
    dark: {
      window: '#15171b',
      bar: '#1a1d22',
      panel: '#1a1d22',
      results: '#15171b',

      line: '#2b2f37',
      lineFaint: '#22262d',
      border: '#2b2f37',
      borderPanel: '#2b2f37',
      control: '#3a3f48',
      track: '#3f444d',
      hover: '#22262d',
      shadow: '0 18px 56px rgba(0, 0, 0, 0.70), 0 6px 18px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 0, 0, 0.55)',

      ink: '#ffffff',
      text: '#e9ebef',
      label: '#c9cdd6',
      soft: '#c9cdd6',
      bright: '#eaf1fb',
      muted: '#a3a8b1',
      faint: '#8b919e',
      dim: '#9ba0a9',
      empty: '#6f7684',

      accent: '#2f6fd0',
      accentHover: '#3a7cdd',
      accentText: '#7eaef9',
      accentSoft: '#8fbcff',
      accentTint: 'rgba(126, 174, 249, 0.11)',
      accentTintStrong: 'rgba(126, 174, 249, 0.16)',
      chipBg: '#1d2a3f',
      onAccent: '#ffffff',

      // Still white, still deliberately the one light surface in the dark
      // panel: it is the only thing you type into, and a dark field read as
      // more panel. Its text and icons take the dark set with it.
      inputBg: '#ffffff',
      inputText: '#12263f',
      inputBorder: '#9dc2e6',
      inputHover: 'rgba(18, 38, 63, 0.10)',

      danger: '#ffb4b4',
      dangerBg: 'rgba(255, 92, 92, 0.13)',
      dangerBorder: 'rgba(255, 107, 107, 0.55)',

      radioOff: 'rgba(255, 255, 255, 0.28)',
      grip: '#e9ebef',

      live: '#5ed48c',
      liveBg: 'rgba(94, 212, 140, 0.14)',
      liveBorder: 'rgba(94, 212, 140, 0.42)',

      codeKeyword: '#c792ea',
      codeString: '#7ee787',
      codeNumber: '#ffab70',
      codeComment: '#8b93a1',
      codeFunction: '#6fd3de',
      codeProperty: '#a8bdd4',
      codeConstant: '#ff9ec4',
      codeOperator: '#a9a2b3'
    }
  };

  var DEFAULT_THEME = 'light';
  var VAR_PREFIX = '--o4-';

  function themeVar(key) { return VAR_PREFIX + key; }

  // Writes one palette onto the panel element. Everything inside it picks the
  // new values up through var() with no other work.
  function applyTheme(node, name) {
    var palette = THEMES[name] || THEMES[DEFAULT_THEME];
    for (var key in palette) {
      if (Object.prototype.hasOwnProperty.call(palette, key)) {
        node.style.setProperty(themeVar(key), palette[key]);
      }
    }
  }

  var T = {};

  // Built from the light palette so the two can never drift: a colour token
  // exists in T only if it exists in a palette, and it always resolves through
  // the custom property rather than to a fixed value.
  (function () {
    for (var key in THEMES.light) {
      if (Object.prototype.hasOwnProperty.call(THEMES.light, key)) {
        T[key] = 'var(' + themeVar(key) + ')';
      }
    }
  })();

  // Applied to the host form, not to the panel, so they cannot go through a
  // custom property - the form is outside the element the properties are set
  // on. They stay strong enough to read against whatever theme D365 is using.
  T.schemaHighlight = 'rgba(120, 190, 255, 0.28)';
  T.dirtyHighlight = 'rgba(255, 214, 10, 0.40)';
  // Enough to make 13px text unreadable at arm's length without turning the
  // form into fog - the shape of the field is what tells you where you are.
  T.blurRadius = '5px';

  // Geometry. Numbers rather than strings: the drag and resize code does
  // arithmetic with them. The panel opens docked to the right edge at full
  // viewport height, so height is a starting value for the floating case
  // rather than the ceiling it used to be - the results pane scrolls now, not
  // the whole panel, so the panel has a fixed height instead of a maximum.
  T.width = 840;
  T.height = 860;
  T.minWidth = 560;
  T.minHeight = 380;
  T.offset = 24;
  // The gap between the panel and every viewport edge, in every window state.
  // Up to v2.2.1 a docked panel sat flush right at full viewport height with
  // its right corners squared off, which read as part of the app's own chrome.
  // Insetting it is what lets the shadow show on all four sides, so the panel
  // reads as something floating over the form.
  T.dockInset = 16;
  // Collapsed, the panel is half the width it would otherwise have, down to a
  // floor that still fits the mark, the name and the two controls left on the
  // bar. Half rather than a fixed width so a panel somebody has widened
  // collapses in proportion to itself.
  T.miniScale = 0.5;
  T.miniMinWidth = 300;
  T.sidebarWidth = 296;
  // How many role chips the identity card draws before it stops and counts.
  // A guard against a service account with dozens of roles pushing the tool
  // sections off screen - not a display choice, so the rest are on hover.
  var ROLE_CHIP_LIMIT = 8;
  T.headerHeight = 56;
  T.statusHeight = 34;
  // How long a record-row message stays up. Nothing cancels it early - see
  // ui.note.
  var NOTE_LIFE = 5000;

  T.radius = '12px';
  T.radiusPanel = '8px';
  T.radiusInner = '6px';

  T.font = '15px "Segoe UI", "Helvetica Neue", Helvetica, system-ui, -apple-system, sans-serif';
  // JetBrains Mono is the concept face. It is not installed on a managed
  // build, so the stack falls through to what is.
  T.monoFamily = '"JetBrains Mono", Consolas, "Cascadia Mono", ui-monospace, monospace';
  T.mono = '14px ' + T.monoFamily;
  // The JSON view, one point down from T.mono. It is a wall of text read as a
  // block rather than a value read on a row, so the extra line on screen is
  // worth more there than the extra point of size.
  T.monoBlock = '13px ' + T.monoFamily;
  T.monoSmall = '12.5px ' + T.monoFamily;
  T.monoTiny = '12px ' + T.monoFamily;

  /* ----------------------------------------------------------------- Xrm --- */

  // Returns the window holding the form, so callers get both Xrm and the
  // document the form is rendered into. Multi-session apps (Customer Service
  // workspace) host each session in its own iframe, so the top window may not
  // be the one with the form.
  function findFormWindow() {
    var withForm = [];
    var withXrm = [];

    function walk(w, depth) {
      if (!w || depth > 4) return;
      try {
        if (w.Xrm) {
          withXrm.push(w);
          if (w.Xrm.Page && w.Xrm.Page.data && w.Xrm.Page.data.entity) withForm.push(w);
        }
      } catch (e) { /* cross-origin frame */ }
      try {
        for (var i = 0; i < w.frames.length; i++) walk(w.frames[i], depth + 1);
      } catch (e) { /* cross-origin frame */ }
    }

    var root = window;
    try {
      if (window.top && window.top.document) root = window.top;
    } catch (e) { /* top is cross-origin */ }
    walk(root, 0);

    return withForm[0] || withXrm[0] || null;
  }

  function getRecord(xrm) {
    if (!xrm) return null;
    try {
      var input = xrm.Utility.getPageContext().input;
      if (input && input.entityId) {
        return {
          id: clean(input.entityId),
          table: input.entityName || '',
          name: primaryName(xrm)
        };
      }
    } catch (e) { /* fall through */ }
    try {
      var id = xrm.Page.data.entity.getId();
      if (id) {
        return {
          id: clean(id),
          table: xrm.Page.data.entity.getEntityName() || '',
          name: primaryName(xrm)
        };
      }
    } catch (e) { /* fall through */ }
    return null;
  }

  // The value of the table's primary name column. Not every table has one, and
  // it is empty on a record that has never been saved.
  function primaryName(xrm) {
    try {
      var value = xrm.Page.data.entity.getPrimaryAttributeValue();
      return (typeof value === 'string' && value) ? value : '';
    } catch (e) {
      return '';
    }
  }

  // The organisation URL as the status bar shows it: no scheme, no trailing
  // slash. Left whole otherwise - a deployment on a vanity domain or a port
  // is still what the panel is reading.
  function hostOf(url) {
    return String(url || '').replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/\/+$/, '');
  }

  function clean(guid) {
    return String(guid).replace(/[{}]/g, '').toLowerCase();
  }

  function getFormId(xrm) {
    try {
      var item = xrm.Page.ui.formSelector.getCurrentItem();
      if (item && item.getId) return clean(item.getId());
    } catch (e) { /* form selector not available */ }
    return null;
  }

  // Survives re-running the toolkit on the same page, so the schema name
  // toggle can still put the original labels back.
  function getStore(win) {
    if (!win.__oliver4D365Toolkit) win.__oliver4D365Toolkit = { recordId: null, labels: {}, schemaOn: false, hidden: null, hiddenOn: false, locked: null, unlockedOn: false, mandatory: null, mandatoryOn: false, dirtyOn: false, formXml: {}, relationships: {}, watchers: [], blurOn: false, blurWatchers: [], blurTally: null };
    // Added after the store shape was first written, so an older store left on
    // the window by a previous version would not have them.
    if (!win.__oliver4D365Toolkit.relationships) win.__oliver4D365Toolkit.relationships = {};
    if (!win.__oliver4D365Toolkit.blurWatchers) win.__oliver4D365Toolkit.blurWatchers = [];
    // Web resource source, keyed by web resource name. Environment scoped
    // rather than record scoped, so syncStore deliberately does not clear it -
    // the file behind a library does not change because you opened another
    // record.
    if (!win.__oliver4D365Toolkit.webResources) win.__oliver4D365Toolkit.webResources = {};
    return win.__oliver4D365Toolkit;
  }

  /* --------------------------------------------------------- form actions --- */

  // What the user is looking at, for error messages. Anything not in this list
  // is reported generically rather than guessed at.
  var PAGE_NAMES = {
    entitylist: 'a view',
    entityrecord: 'a record form',
    dashboard: 'a dashboard',
    custom: 'a custom page',
    webresource: 'a web resource'
  };

  function currentPageType(xrm) {
    try {
      var input = xrm.Utility.getPageContext().input;
      return (input && input.pageType) ? input.pageType : null;
    } catch (e) {
      return null;
    }
  }

  // A grid page still exposes Xrm and Xrm.Page, but the control collection is
  // not there, which is what produced the raw null error.
  function hasForm(xrm) {
    try {
      return !!(xrm && xrm.Page && xrm.Page.ui && xrm.Page.ui.controls &&
        typeof xrm.Page.ui.controls.forEach === 'function' &&
        xrm.Page.data && xrm.Page.data.entity);
    } catch (e) {
      return false;
    }
  }

  function notAFormMessage(xrm) {
    var name = PAGE_NAMES[currentPageType(xrm)];
    if (name && name !== 'a record form') {
      return 'You are on ' + name + ', not a record form. Open a record and try again.';
    }
    return 'No record form is open on this page. Open a record and try again.';
  }

  function eachControl(xrm, fn) {
    if (!hasForm(xrm)) return;
    xrm.Page.ui.controls.forEach(function (c) {
      try { fn(c); } catch (e) { /* control does not support this */ }
    });
  }

  // Records which fields were locked before unlocking them. The script only
  // knows the state at the moment of the click - anything that changes the
  // state afterwards is not tracked.
  function unlockFields(xrm, store) {
    var locked = {};
    var n = 0;
    eachControl(xrm, function (c) {
      if (c.getDisabled && c.getDisabled()) {
        locked[c.getName()] = true;
        c.setDisabled(false);
        n++;
      }
    });
    store.locked = locked;
    store.unlockedOn = true;
    return n;
  }

  function relock(xrm, store) {
    var locked = store.locked || {};
    var n = 0;
    eachControl(xrm, function (c) {
      if (locked[c.getName()] && c.setDisabled) { c.setDisabled(true); n++; }
    });
    store.locked = {};
    store.unlockedOn = false;
    return n;
  }

  // Only fields already at 'required' are changed, so restoring them is exact.
  function removeMandatory(xrm, store) {
    var was = {};
    var n = 0;
    var seen = {};
    eachControl(xrm, function (c) {
      var a = c.getAttribute && c.getAttribute();
      if (!a || !a.getRequiredLevel) return;
      var name = a.getName();
      if (seen[name]) return;
      seen[name] = true;
      if (a.getRequiredLevel() === 'required') {
        was[name] = 'required';
        a.setRequiredLevel('none');
        n++;
      }
    });
    store.mandatory = was;
    store.mandatoryOn = true;
    return n;
  }

  function restoreMandatory(xrm, store) {
    var was = store.mandatory || {};
    var n = 0;
    var seen = {};
    eachControl(xrm, function (c) {
      var a = c.getAttribute && c.getAttribute();
      if (!a || !a.setRequiredLevel) return;
      var name = a.getName();
      if (seen[name] || !was[name]) return;
      seen[name] = true;
      a.setRequiredLevel(was[name]);
      n++;
    });
    store.mandatory = {};
    store.mandatoryOn = false;
    return n;
  }

  // Records what was hidden before revealing it, so the change can be undone.
  // Names are kept rather than object references because the client can
  // re-create tab and control objects between calls.
  function showHidden(xrm, store) {
    var hidden = { tabs: {}, sections: {}, controls: {} };
    var tabs = 0, sections = 0, fields = 0;

    xrm.Page.ui.tabs.forEach(function (tab) {
      var tabName = tab.getName ? tab.getName() : null;
      try {
        if (!tab.getVisible()) {
          if (tabName) hidden.tabs[tabName] = true;
          tab.setVisible(true);
          tabs++;
        }
      } catch (e) { /* ignore */ }
      try {
        tab.sections.forEach(function (s) {
          try {
            if (!s.getVisible()) {
              var sectionName = s.getName ? s.getName() : null;
              // Without both names the key is not unique, and a wrong key could
              // later re-hide a section that was visible all along. Reveal it,
              // but do not record it as reversible.
              if (tabName && sectionName) hidden.sections[tabName + '|' + sectionName] = true;
              s.setVisible(true);
              sections++;
            }
          } catch (e) { /* ignore */ }
        });
      } catch (e) { /* ignore */ }
    });

    eachControl(xrm, function (c) {
      if (c.getVisible && !c.getVisible()) {
        hidden.controls[c.getName()] = true;
        c.setVisible(true);
        fields++;
      }
    });

    store.hidden = hidden;
    store.hiddenOn = true;
    return { tabs: tabs, sections: sections, fields: fields };
  }

  function reHide(xrm, store) {
    var hidden = store.hidden || { tabs: {}, sections: {}, controls: {} };
    var tabs = 0, sections = 0, fields = 0;

    eachControl(xrm, function (c) {
      if (hidden.controls[c.getName()] && c.setVisible) { c.setVisible(false); fields++; }
    });

    xrm.Page.ui.tabs.forEach(function (tab) {
      var tabName = tab.getName ? tab.getName() : null;
      try {
        tab.sections.forEach(function (s) {
          try {
            var sectionName = s.getName ? s.getName() : null;
            if (!tabName || !sectionName) return;
            if (hidden.sections[tabName + '|' + sectionName]) { s.setVisible(false); sections++; }
          } catch (e) { /* ignore */ }
        });
      } catch (e) { /* ignore */ }
      try {
        if (tabName && hidden.tabs[tabName]) { tab.setVisible(false); tabs++; }
      } catch (e) { /* ignore */ }
    });

    store.hidden = { tabs: {}, sections: {}, controls: {} };
    store.hiddenOn = false;
    return { tabs: tabs, sections: sections, fields: fields };
  }

  // Every option available on the choice and two option columns on the
  // form, with the current selection marked.
  function choiceFieldValues(xrm, store) {
    var groups = [];
    var seen = {};

    eachControl(xrm, function (c) {
      var a = c.getAttribute && c.getAttribute();
      if (!a || !a.getAttributeType) return;

      var type = a.getAttributeType();
      if (type !== 'optionset' && type !== 'multiselectoptionset' && type !== 'boolean') return;

      var name = a.getName();
      if (seen[name]) return;
      seen[name] = true;

      var options = null;
      try {
        if (typeof a.getOptions === 'function') options = a.getOptions();
        else if (typeof c.getOptions === 'function') options = c.getOptions();
      } catch (e) { /* control does not expose options */ }
      if (!options || !options.length) return;

      var current = null;
      try { current = a.getValue(); } catch (e) { /* ignore */ }
      var selected = {};
      if (current !== null && current !== undefined) {
        if (current.length !== undefined && typeof current !== 'string') {
          current.forEach(function (v) { selected[v] = true; });
        } else {
          selected[current] = true;
        }
      }

      // Prefer the original label if the schema name toggle has changed it.
      var label = store.labels[c.getName()];
      if (label === undefined) {
        try { label = c.getLabel(); } catch (e) { label = name; }
      }

      groups.push({
        title: (label || name) + '  [' + name + ']',
        pairs: options.map(function (o) {
          return [
            (o.text === '' || o.text === null ? '(blank)' : o.text) + (selected[o.value] ? '  (selected)' : ''),
            String(o.value)
          ];
        })
      });
    });

    groups.sort(function (x, y) { return x.title.localeCompare(y.title); });
    return groups;
  }

  function controlSchemaName(c) {
    try {
      var a = c.getAttribute && c.getAttribute();
      if (a && a.getName) return a.getName();
    } catch (e) { /* control has no attribute */ }
    return c.getName ? c.getName() : null;
  }

  function setSchemaNames(xrm, docs, store, on) {
    var applied = [];
    eachControl(xrm, function (c) {
      if (!c.getLabel || !c.setLabel) return;
      var key = c.getName();
      var schema = controlSchemaName(c);
      if (!key || !schema) return;

      if (on) {
        if (store.labels[key] === undefined) store.labels[key] = c.getLabel();
        c.setLabel(store.labels[key] + ' [' + schema + ']');
        if (applied.indexOf(schema) === -1) applied.push(schema);
      } else if (store.labels[key] !== undefined) {
        c.setLabel(store.labels[key]);
        if (applied.indexOf(schema) === -1) applied.push(schema);
      }
    });
    if (!on) store.labels = {};
    store.schemaOn = on;
    return applied;
  }

  var SCHEMA_SUFFIX = /\[([A-Za-z0-9_]+)\]\s*$/;

  // An element's own text, ignoring text inside child elements. Matching on
  // this rather than textContent means a label that also contains an icon or a
  // required-field marker still gets picked up, and no ancestor is matched
  // twice.
  function ownText(node) {
    var text = '';
    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];
      if (child.nodeType === 3) text += child.nodeValue;
    }
    return text;
  }

  // The Client API has no way to style a label, so the rendered label elements
  // are picked out by the [schemaname] suffix the toggle just added. The form
  // markup is not guaranteed to live in the same document as Xrm, so every
  // reachable document is searched. Returns the schema names actually found.
  //
  // Additive on purpose - nodes already painted are skipped rather than being
  // cleared and repainted, otherwise the repeated passes make the highlight
  // visibly flash.
  // Splits the label's text node so only the [schemaname] part, brackets
  // included, is wrapped and highlighted. The display name is left untouched.
  function wrapSchemaSuffix(node) {
    var doc = node.ownerDocument;
    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];
      if (child.nodeType !== 3) continue;

      var text = child.nodeValue || '';
      if (!SCHEMA_SUFFIX.test(text)) continue;

      var start = text.lastIndexOf('[');
      if (start < 0) continue;

      var tail = child.splitText(start);
      var span = doc.createElement('span');
      span.setAttribute(MARK, 'schema');
      span.setAttribute(WRAP, '1');
      span.style.backgroundColor = T.schemaHighlight;
      span.style.borderRadius = '3px';
      span.style.padding = '0 4px';
      span.textContent = tail.nodeValue;
      if (tail.parentNode) tail.parentNode.replaceChild(span, tail);
      return true;
    }
    return false;
  }

  function highlightSchemaLabels(docs) {
    docs.forEach(function (doc) {
      var nodes = doc.querySelectorAll('*');
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        // Skip the wrapper spans this function creates, or it would wrap them
        // again on the next pass.
        if (node.getAttribute(MARK)) continue;
        if (!SCHEMA_SUFFIX.test(ownText(node))) continue;
        wrapSchemaSuffix(node);
      }
    });
    return markedSchemaNames(docs);
  }

  function markedSchemaNames(docs) {
    var found = {};
    docs.forEach(function (doc) {
      var nodes = doc.querySelectorAll('[' + MARK + '="schema"]');
      for (var i = 0; i < nodes.length; i++) {
        var match = SCHEMA_SUFFIX.exec(nodes[i].textContent || '');
        if (match) found[match[1]] = true;
      }
    });
    return found;
  }

  // setLabel does not update the DOM synchronously, and the Unified Interface
  // only renders a tab once it has been opened. So the pass runs a few times
  // over the first couple of seconds, then an observer keeps painting labels as
  // they appear - which is what picks up fields on tabs opened later.
  function scheduleSchemaHighlight(docs, on, store, report) {
    if (!on) {
      stopSchemaWatch(store);
      clearHighlights(docs, 'schema');
      return;
    }
    var delays = [0, 250, 700, 1500, 2500];
    delays.forEach(function (delay, index) {
      setTimeout(function () {
        var found = highlightSchemaLabels(docs);
        if (index === delays.length - 1 && report) report(found);
      }, delay);
    });
    startSchemaWatch(docs, store);
  }

  function startSchemaWatch(docs, store) {
    stopSchemaWatch(store);
    var timer = null;
    var watchers = [];
    docs.forEach(function (doc) {
      try {
        var view = doc.defaultView;
        if (!view || !view.MutationObserver || !doc.body) return;
        var observer = new view.MutationObserver(function () {
          if (!store.schemaOn) return;
          if (timer) clearTimeout(timer);
          // Short debounce. The client re-renders labels and replaces the
          // nodes, dropping our inline styles, so a long wait here shows up as
          // a visible flash before the highlight comes back.
          timer = setTimeout(function () { highlightSchemaLabels(docs); }, 40);
        });
        // childList only. Watching attributes would fire on our own styling.
        observer.observe(doc.body, { childList: true, subtree: true });
        watchers.push(observer);
      } catch (e) { /* document not observable */ }
    });
    store.watchers = watchers;
  }

  function stopSchemaWatch(store) {
    (store.watchers || []).forEach(function (observer) {
      try { observer.disconnect(); } catch (e) { /* already gone */ }
    });
    store.watchers = [];
  }

  function clearHighlights(docs, kind) {
    var count = 0;
    docs.forEach(function (doc) {
      var nodes = doc.querySelectorAll('[' + MARK + '="' + kind + '"]');
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.getAttribute(WRAP)) {
          // Put the wrapped text back where it came from.
          var parent = node.parentNode;
          if (parent) {
            parent.replaceChild(doc.createTextNode(node.textContent), node);
            if (parent.normalize) parent.normalize();
          }
        } else {
          node.style.backgroundColor = '';
          node.style.borderRadius = '';
          node.style.padding = '';
          // Blur is the only kind that sets this, and it is cleared rather
          // than restored: an inline filter of D365's own on one of these
          // nodes would be lost. None has been seen, and the alternative -
          // stashing the old value on the node - leaves rubbish behind when
          // the client replaces the node between the two passes.
          node.style.filter = '';
          node.removeAttribute(MARK);
        }
        count++;
      }
    });
    return count;
  }

  // Field containers are matched on the data-id attribute the Unified
  // Interface renders. Not a documented contract, so this is best effort.
  function findFieldElement(docs, name) {
    var selectors = [
      '[data-id="' + name + '.fieldControl"]',
      '[data-id="' + name + '-FieldSectionItemContainer"]',
      '[data-id="' + name + '"]'
    ];
    for (var d = 0; d < docs.length; d++) {
      for (var i = 0; i < selectors.length; i++) {
        var found = null;
        try { found = docs[d].querySelector(selectors[i]); } catch (e) { /* bad selector */ }
        if (found) return found;
      }
    }
    return null;
  }

  // The field's label element, so unsaved changes can be marked the same way
  // schema names are rather than by shading the whole field container.
  function findFieldLabel(docs, controlName, displayLabel) {
    var container = findFieldElement(docs, controlName);
    if (container && container.querySelector) {
      var inside = container.querySelector('label');
      if (inside) return inside;
    }

    // The label often sits above the field control, so try the ancestors, but
    // only accept a label whose text matches - otherwise a neighbouring
    // field's label could be picked up.
    var wanted = (displayLabel || '').replace(SCHEMA_SUFFIX, '').trim();
    var parent = container ? container.parentNode : null;
    for (var up = 0; up < 3 && parent && parent.querySelectorAll; up++) {
      var near = parent.querySelectorAll('label');
      for (var n = 0; n < near.length; n++) {
        if (labelText(near[n]) === wanted) return near[n];
      }
      parent = parent.parentNode;
    }

    if (!wanted) return null;
    for (var d = 0; d < docs.length; d++) {
      var all = docs[d].querySelectorAll('label');
      for (var j = 0; j < all.length; j++) {
        if (labelText(all[j]) === wanted) return all[j];
      }
    }
    return null;
  }

  // Label text without any schema name suffix the toolkit may have added.
  function labelText(node) {
    return (node.textContent || '').replace(SCHEMA_SUFFIX, '').trim();
  }

  function highlightDirty(xrm, docs, store) {
    clearHighlights(docs, 'dirty');
    var names = [];
    var highlighted = 0;
    var seen = {};

    eachControl(xrm, function (c) {
      var a = c.getAttribute && c.getAttribute();
      if (!a || !a.getIsDirty || !a.getIsDirty()) return;
      var name = a.getName();
      if (seen[name]) return;
      seen[name] = true;
      names.push(name);

      var label = store.labels[c.getName()];
      if (label === undefined) {
        try { label = c.getLabel(); } catch (e) { label = null; }
      }

      var node = findFieldLabel(docs, c.getName(), label) || findFieldLabel(docs, name, label);
      if (node) {
        node.setAttribute(MARK, 'dirty');
        node.style.backgroundColor = T.dirtyHighlight;
        node.style.borderRadius = '3px';
        node.style.padding = '0 4px';
        highlighted++;
      }
    });

    return { names: names, highlighted: highlighted };
  }

  /* ---------------------------------------------------------------- blur --- */

  // Blur field values hides what is on the form without hiding the form. The
  // display names, tabs, sections and column headers stay readable; the values
  // beside them do not.
  //
  // What it is NOT: redaction. The values are still in the page, still in the
  // DOM, still one Web API call away, and a screenshot of a blurred field can
  // be sharpened. It is a shoulder-surfing and screen-sharing aid, and the
  // pane says so every time it is switched on rather than leaving somebody to
  // assume otherwise.
  //
  // Done with an inline CSS filter on each value node, one node at a time,
  // because a stylesheet is not an option - see section 4 of the context file
  // on why nothing here builds markup or injects a style block.

  // The panel lives in the same document as the form, and it shows the record
  // name and every value you asked it to list. Blurring its own contents would
  // be absurd, and the title fallback below matches on the record's name -
  // which the panel displays - so this guard is load bearing, not defensive.
  function insidePanel(node) {
    for (var n = node; n; n = n.parentNode) {
      if (n.id === PANEL_ID) return true;
    }
    return false;
  }

  // A node inside something already blurred is already blurred. Marking it too
  // would double the filter on the way in and leave the count meaningless.
  function alreadyBlurred(node) {
    for (var n = node; n; n = n.parentNode) {
      if (n.getAttribute && n.getAttribute(MARK) === 'blur') return true;
    }
    return false;
  }

  function blurNode(node) {
    if (!node || !node.style || !node.setAttribute) return false;
    if (node.getAttribute(MARK)) return false;
    if (insidePanel(node) || alreadyBlurred(node)) return false;
    node.setAttribute(MARK, 'blur');
    node.style.filter = 'blur(' + T.blurRadius + ')';
    return true;
  }

  function queryAll(doc, selector) {
    try { return doc.querySelectorAll(selector); } catch (e) { return []; }
  }

  // Everything under a root that is not, and does not contain, a label.
  // Recursive on purpose: v2.3.0 only looked at the container's own children
  // and found nothing on a real form, because the Unified Interface wraps the
  // label and the control together in one child - so every child contained a
  // label and every child was skipped. Descending through those wrappers and
  // stopping at the first level that holds no label is what actually splits
  // the value from its display name.
  function valuePartsOf(root) {
    var out = [];
    (function walk(node, depth) {
      if (depth > 6) return;
      var kids = node.children || [];
      for (var i = 0; i < kids.length; i++) {
        var kid = kids[i];
        if (kid.tagName === 'LABEL') continue;
        if (kid.querySelector && kid.querySelector('label')) { walk(kid, depth + 1); continue; }
        out.push(kid);
      }
    })(root, 0);
    return out;
  }

  // The value part of one control, never its label. Three routes, tried in
  // order, because the data-id attributes the Unified Interface renders are
  // not a documented contract and v2.3.0 leaned on one spelling of them:
  //
  //   1. the control's own nodes, matched by PREFIX - the wrapper is
  //      "<name>.fieldControl" but the element that actually holds the value
  //      is "<name>.fieldControl-text-box-text" and its kind, and a form that
  //      renders only the second was blurring nothing
  //   2. the section item container, or the control wrapper, split into value
  //      parts by valuePartsOf
  //   3. the label itself, found by findFieldLabel - the same lookup the
  //      unsaved value highlight has always used, so a form where no data-id
  //      matches at all still gets there - and then the nearest ancestor of it
  //      that holds something other than the label
  function valueNodes(docs, name, label) {
    var found = [];

    docs.forEach(function (doc) {
      var direct = queryAll(doc, '[data-id^="' + name + '.fieldControl"]');
      for (var i = 0; i < direct.length; i++) found.push(direct[i]);
    });
    if (found.length) return found;

    docs.forEach(function (doc) {
      var roots = queryAll(doc, '[data-id="' + name + '-FieldSectionItemContainer"]');
      if (!roots.length) roots = queryAll(doc, '[data-id="' + name + '"]');
      for (var j = 0; j < roots.length; j++) {
        valuePartsOf(roots[j]).forEach(function (n) { found.push(n); });
      }
    });
    if (found.length) return found;

    var lab = findFieldLabel(docs, name, label);
    var parent = lab ? lab.parentNode : null;
    for (var up = 0; up < 4 && parent && parent.children && parent.tagName !== 'BODY'; up++) {
      var parts = valuePartsOf(parent);
      // The first ancestor that holds anything besides the label. Stopping at
      // the first one matters: keep walking and you reach the section, and
      // then this would be blurring its heading as well as its fields.
      if (parts.length) return parts;
      parent = parent.parentNode;
    }
    return found;
  }

  // The title in the form header. Two routes, and the second is the honest
  // one: if no known id is on the page, a heading whose whole text is the
  // record's own name is the title. Headings only - a nav item or a recently
  // viewed entry containing the same name is not what was asked for.
  var TITLE_IDS = ['header_title', 'formHeaderTitle', 'form_header_title'];

  function titleNodes(docs, name) {
    var found = [];
    docs.forEach(function (doc) {
      TITLE_IDS.forEach(function (id) {
        var hits = queryAll(doc, '[data-id="' + id + '"]');
        for (var i = 0; i < hits.length; i++) found.push(hits[i]);
      });
    });
    if (found.length || !name) return found;
    docs.forEach(function (doc) {
      var heads = queryAll(doc, 'h1, h2, [role="heading"]');
      for (var i = 0; i < heads.length; i++) {
        if ((heads[i].textContent || '').trim() === name) found.push(heads[i]);
      }
    });
    return found;
  }

  // Subgrid rows. Matched on the grid roles rather than on a subgrid control's
  // container, so a grid the control lookup cannot find is still covered, and
  // the cells are taken rather than the whole grid so the column headers -
  // role="columnheader", not gridcell - stay readable. The timeline is
  // deliberately not included: it is not a grid, and its markup is not stable
  // enough to blur without either missing it or blurring the whole wall.
  function gridCellNodes(docs) {
    var found = [];
    docs.forEach(function (doc) {
      var cells = queryAll(doc, '[role="gridcell"]');
      for (var i = 0; i < cells.length; i++) found.push(cells[i]);
    });
    return found;
  }

  // One pass. Additive: anything already marked is skipped, so repeated passes
  // do not double the filter or make the form flash, and the tally counts what
  // this pass added rather than what is on screen.
  function blurForm(xrm, docs, name, store) {
    var added = { fields: 0, cells: 0, title: 0 };
    var located = 0;
    var missed = [];

    eachControl(xrm, function (c) {
      var type = c.getControlType && c.getControlType();
      // A subgrid is handled by its cells below. Blurring the control's own
      // container would take the column headers with it.
      if (type === 'subgrid') return;
      var control = c.getName && c.getName();
      if (!control) return;
      var label = store.labels[control];
      if (label === undefined) {
        try { label = c.getLabel(); } catch (e) { label = null; }
      }
      var nodes = valueNodes(docs, control, label);
      if (!nodes.length) {
        // Header controls and quick view fields are named differently from
        // the attribute they show, so the attribute name is the second try.
        var a = c.getAttribute && c.getAttribute();
        var attr = a && a.getName ? a.getName() : null;
        if (attr && attr !== control) nodes = valueNodes(docs, attr, label);
      }
      if (nodes.length) located++; else missed.push(control);
      nodes.forEach(function (n) { if (blurNode(n)) added.fields++; });
    });

    titleNodes(docs, name).forEach(function (n) { if (blurNode(n)) added.title++; });
    gridCellNodes(docs).forEach(function (n) { if (blurNode(n)) added.cells++; });
    // Reported rather than counted up: a control missed on the first pass is
    // usually a tab that has not rendered yet, so what matters is the state of
    // the last pass, not every miss on the way there.
    added.located = located;
    added.missed = missed;
    return added;
  }

  // The pass re-reads the client rather than closing over it: the observer
  // below calls this long after the click, by which time the form may have
  // re-rendered underneath it.
  function blurPass(docs, store) {
    var fw = findFormWindow();
    var xrm = fw && fw.Xrm;
    if (!xrm || !hasForm(xrm)) return;
    var rec = getRecord(xrm);
    var added = blurForm(xrm, docs, rec ? rec.name : '', store);
    var tally = store.blurTally || { fields: 0, cells: 0, title: 0 };
    tally.fields += added.fields;
    tally.cells += added.cells;
    tally.title += added.title;
    tally.located = added.located;
    tally.missed = added.missed;
    store.blurTally = tally;
  }

  // Same shape as the schema highlight, and for the same reason: the client
  // renders a tab the first time it is opened and replaces nodes as it goes,
  // so one pass at the click covers what is on screen and nothing else. The
  // repeats catch the render, and the observer catches every tab opened after.
  function scheduleBlur(docs, on, store, report) {
    if (!on) {
      stopBlurWatch(store);
      clearHighlights(docs, 'blur');
      return;
    }
    var delays = [0, 250, 700, 1500, 2500];
    delays.forEach(function (delay, index) {
      setTimeout(function () {
        if (!store.blurOn) return;
        blurPass(docs, store);
        if (index === delays.length - 1 && report) report(store.blurTally);
      }, delay);
    });
    startBlurWatch(docs, store);
  }

  function startBlurWatch(docs, store) {
    stopBlurWatch(store);
    var timer = null;
    var watchers = [];
    docs.forEach(function (doc) {
      try {
        var view = doc.defaultView;
        if (!view || !view.MutationObserver || !doc.body) return;
        var observer = new view.MutationObserver(function () {
          if (!store.blurOn) return;
          if (timer) clearTimeout(timer);
          // childList only, and debounced. Watching attributes would fire on
          // the filter this sets and never stop.
          timer = setTimeout(function () { blurPass(docs, store); }, 40);
        });
        observer.observe(doc.body, { childList: true, subtree: true });
        watchers.push(observer);
      } catch (e) { /* document not observable */ }
    });
    store.blurWatchers = watchers;
  }

  function stopBlurWatch(store) {
    (store.blurWatchers || []).forEach(function (observer) {
      try { observer.disconnect(); } catch (e) { /* already gone */ }
    });
    store.blurWatchers = [];
  }

  var ANNOTATION = '@OData.Community.Display.V1.FormattedValue';

  // Lookups come back as _fieldname_value.
  function logicalNameOf(key) {
    return /^_.+_value$/.test(key) ? key.slice(1, -6) : key;
  }

  // Every field on the table with the value this record holds for it. The
  // metadata call supplies the complete field list - a record retrieve alone
  // omits columns that are null, so it cannot tell you a field exists at all.
  function allFields(xrm, record) {
    return Promise.all([
      tableSchema(xrm, record.table),
      xrm.WebApi.retrieveRecord(record.table, record.id)
    ]).then(function (results) {
      var schema = results[0];
      var row = results[1];

      var values = {};
      Object.keys(row).forEach(function (key) {
        if (key.indexOf('@') > -1) return;
        var formatted = row[key + ANNOTATION];
        var value = formatted !== undefined ? formatted : row[key];
        if (value === null || value === undefined || value === '') return;
        if (typeof value === 'boolean') value = value ? 'Yes' : 'No';
        values[logicalNameOf(key)] = String(value);
      });

      return schema.map(function (field) {
        var value = values[field.logical];
        return {
          logical: field.logical,
          display: field.display,
          type: field.type,
          raw: field.raw || '',
          value: value === undefined ? null : value
        };
      });
    });
  }

  /* ---------------------------------------------------------- form xml -- */

  function getFormXml(xrm, store) {
    var formId = getFormId(xrm);
    if (!formId) return Promise.reject(new Error('Could not determine the current form ID.'));
    if (store.formXml[formId]) return Promise.resolve(store.formXml[formId]);

    return xrm.WebApi.retrieveRecord('systemform', formId, '?$select=name,formxml').then(function (r) {
      var parsed = new DOMParser().parseFromString(r.formxml, 'text/xml');
      var doc = { name: r.name, xml: parsed };
      store.formXml[formId] = doc;
      return doc;
    });
  }

  // The name is the web resource name, which is what the source viewer looks
  // the file up by. libraryUniqueId is carried as well but nothing queries on
  // it: whether it is the webresourceid or an id local to the form has never
  // been confirmed, and a lookup by name that fails is better than a lookup by
  // an id that quietly matches the wrong row.
  function readLibraries(formXml) {
    var out = [];
    var seen = {};
    var nodes = formXml.xml.getElementsByTagName('Library');
    for (var i = 0; i < nodes.length; i++) {
      var name = nodes[i].getAttribute('name');
      if (!name || seen[name]) continue;
      seen[name] = true;
      out.push({ name: name, uniqueId: nodes[i].getAttribute('libraryUniqueId') || '' });
    }
    return out;
  }

  function readHandlers(formXml) {
    var out = [];
    var events = formXml.xml.getElementsByTagName('event');
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      var evName = ev.getAttribute('name') || 'event';
      var attr = ev.getAttribute('attribute');
      var label = attr ? evName + ' (' + attr + ')' : evName;
      var handlers = ev.getElementsByTagName('Handler');
      for (var j = 0; j < handlers.length; j++) {
        var h = handlers[j];
        var fn = h.getAttribute('functionName') || '(none)';
        var lib = h.getAttribute('libraryName') || '';
        var enabled = h.getAttribute('enabled');
        var value = fn + (lib ? ' - ' + lib : '');
        if (enabled === 'false') value += ' [disabled]';
        out.push([label, value]);
      }
    }
    return out;
  }

  /* --------------------------------------------------------- web api ---- */

  // Well-known role template ID for System Administrator. Checked alongside the
  // role name because the name is localised, and the template ID is not present
  // on every deployment.
  var SYSTEM_ADMIN_TEMPLATE = '627090ff-40a3-4053-8790-584edc5be201';
  var SYSTEM_ADMIN_NAME = 'System Administrator';

  // The panel shows who is signed in, so the role names come back with the
  // verdict rather than being asked for a second time. Nothing extra is
  // queried - the gate already reads every role the user holds.
  function readSecurityRoles(xrm) {
    var ids;
    try {
      ids = xrm.Utility.getGlobalContext().userSettings.securityRoles || [];
    } catch (e) {
      return Promise.reject(new Error('your security roles could not be read'));
    }
    if (!ids.length) return Promise.resolve({ isAdmin: false, roles: [] });

    var filter = '&$filter=' + ids.map(function (id) {
      return 'roleid eq ' + clean(id);
    }).join(' or ');

    function retrieve(select) {
      return xrm.WebApi.retrieveMultipleRecords('role', '?$select=' + select + filter);
    }

    // roletemplateid is a lookup, so it comes back as _roletemplateid_value.
    // Drop it and match on name alone if the column is rejected.
    return retrieve('name,_roletemplateid_value').then(null, function () {
      return retrieve('name');
    }).then(function (result) {
      var entities = (result && result.entities) || [];
      // The matched role is remembered by its own name rather than assuming it
      // is called "System Administrator". On a localised deployment it is not,
      // and it is matched on the template ID instead.
      var adminName = null;
      var names = [];
      var seen = {};
      entities.forEach(function (role) {
        var template = role._roletemplateid_value;
        var matches = (template && clean(template) === SYSTEM_ADMIN_TEMPLATE) ||
          role.name === SYSTEM_ADMIN_NAME;
        if (matches && !adminName) adminName = role.name || SYSTEM_ADMIN_NAME;
        if (!role.name || seen[role.name]) return;
        seen[role.name] = true;
        names.push(role.name);
      });

      // Administrator first, then alphabetical. The leading chip is the role
      // the whole authorisation position rests on, so it leads.
      names.sort(function (a, b) {
        if (a === adminName) return -1;
        if (b === adminName) return 1;
        return a < b ? -1 : (a > b ? 1 : 0);
      });

      return { isAdmin: !!adminName, roles: names };
    });
  }

  function currentUserName(xrm) {
    try {
      return xrm.Utility.getGlobalContext().userSettings.userName || '';
    } catch (e) {
      return '';
    }
  }

  var AUDIT_SELECT = ['createdon', 'modifiedon', '_createdby_value', '_modifiedby_value'];
  var STATUS_SELECT = ['statecode', 'statuscode'];

  function readProperties(xrm, record) {
    function retrieve(fields) {
      return xrm.WebApi.retrieveRecord(record.table, record.id, '?$select=' + fields.join(','));
    }
    // Not every table has statecode/statuscode, so drop them and retry if the
    // first call is rejected for an unknown property.
    return retrieve(AUDIT_SELECT.concat(STATUS_SELECT)).then(null, function () {
      return retrieve(AUDIT_SELECT);
    });
  }

  function display(row, field) {
    var formatted = row[field + '@OData.Community.Display.V1.FormattedValue'];
    if (formatted !== undefined && formatted !== null && formatted !== '') return formatted;
    var raw = row[field];
    if (raw === undefined || raw === null || raw === '') return '-';
    return String(raw);
  }

  // Business rules are Processes with category 2. The Client API does not
  // expose them, so this lists the rules for the table rather than strictly
  // those bound to the current form.
  function readBusinessRules(xrm, record) {
    var filter = "&$filter=category eq 2 and primaryentity eq '" + record.table + "'&$orderby=name";
    function retrieve(select) {
      return xrm.WebApi.retrieveMultipleRecords('workflow', '?$select=' + select + filter);
    }
    return retrieve('name,statecode,formid').then(null, function () {
      return retrieve('name,statecode');
    });
  }

  // Xrm.Utility.getEntityMetadata only returns attributes you already know the
  // names of, and a record retrieve omits columns that are null, so neither can
  // list a whole table. The metadata endpoint can. Same origin, same session.
  function readLabel(displayName) {
    if (!displayName) return '';
    var user = displayName.UserLocalizedLabel;
    if (user && user.Label) return user.Label;

    // Fall back to any label that exists. UserLocalizedLabel is only populated
    // when the label has been defined in the user's own language, so custom
    // fields labelled in one language only come back empty without this.
    var all = displayName.LocalizedLabels;
    if (all && all.length) {
      for (var i = 0; i < all.length; i++) {
        if (all[i] && all[i].Label) return all[i].Label;
      }
    }
    return '';
  }

  // Raw GET against the Web API for the things Xrm.WebApi cannot reach: the
  // metadata endpoint, and count queries that need a Prefer header. Same
  // origin and same session, so the ambient authentication applies.
  function apiGet(xrm, path, prefer) {
    var request = (typeof fetch === 'function') ? fetch : null;
    if (!request) {
      return Promise.reject(new Error('this browser does not support the metadata request'));
    }

    var headers = {
      Accept: 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0'
    };
    if (prefer) headers.Prefer = prefer;

    var url = xrm.Utility.getGlobalContext().getClientUrl() + '/api/data/' + API_VERSION + path;

    return request(url, {
      method: 'GET',
      credentials: 'same-origin',
      headers: headers
    }).then(function (response) {
      if (!response.ok) {
        throw new Error('metadata request returned ' + response.status);
      }
      return response.json();
    });
  }

  // Dataverse attribute types, in the words a maker uses rather than the words
  // the metadata service uses. Anything not in the map is shown as it came
  // back rather than guessed at or hidden - an unmapped type is still a true
  // answer, and a blank column would not be.
  var TYPE_NAMES = {
    String: 'Text',
    Memo: 'Memo',
    Picklist: 'Choice',
    MultiSelectPicklist: 'Choices',
    Boolean: 'Yes/No',
    DateTime: 'Date',
    Integer: 'Number',
    BigInt: 'Number',
    Decimal: 'Decimal',
    Double: 'Decimal',
    Money: 'Currency',
    Lookup: 'Lookup',
    Customer: 'Customer',
    Owner: 'Owner',
    PartyList: 'Party list',
    Uniqueidentifier: 'Id',
    State: 'State',
    Status: 'Status',
    EntityName: 'Table',
    Image: 'Image',
    File: 'File',
    Virtual: 'Virtual',
    ManagedProperty: 'Managed'
  };

  function typeName(raw) {
    if (!raw) return '';
    return TYPE_NAMES[raw] || String(raw);
  }

  // AttributeType is asked for alongside the names, so the type column costs
  // no extra request. It is asked for in a way that can fail on its own: if
  // the property is not selectable on a given environment the whole listing
  // would go with it, so a rejection falls back to the query that has always
  // worked and the type column simply comes back empty.
  function tableSchema(xrm, table) {
    var base = "/EntityDefinitions(LogicalName='" + table + "')/Attributes?$select=";

    function shape(data) {
      var out = [];
      (data.value || []).forEach(function (attribute) {
        var logical = attribute.LogicalName;
        if (!logical) return;
        out.push({
          logical: logical,
          display: readLabel(attribute.DisplayName),
          type: typeName(attribute.AttributeType),
          // The metadata service's own word for the type, kept alongside the
          // maker's word. The friendly name cannot be used to pick a cast -
          // Integer and BigInt are both "Number" and their casts differ - and
          // the fallback query that drops AttributeType leaves this empty,
          // which is what makes the detail request fall back with it.
          raw: attribute.AttributeType || ''
        });
      });
      out.sort(function (x, y) {
        return String(x.display || x.logical).toLowerCase()
          .localeCompare(String(y.display || y.logical).toLowerCase());
      });
      return out;
    }

    return apiGet(xrm, base + 'LogicalName,DisplayName,AttributeType')
      .then(shape, function () {
        return apiGet(xrm, base + 'LogicalName,DisplayName').then(shape);
      });
  }

  /* --------------------------------------------------- column definition --- */

  // Everything the base AttributeMetadata type carries, asked for by name. The
  // whole object is not taken: on a choice column it drags every option and
  // every localised label with it, and none of that is what the row was
  // opened for.
  var DETAIL_SELECT = 'LogicalName,SchemaName,DisplayName,Description,AttributeType,' +
    'AttributeTypeName,RequiredLevel,IsValidForCreate,IsValidForUpdate,IsValidForRead,' +
    'IsAuditEnabled,IsSecured,IsCustomAttribute,IsManaged,IsPrimaryId,IsPrimaryName,' +
    'IsValidForAdvancedFind,ColumnNumber';

  // Type specific properties live on a derived type and can only be selected
  // through a cast, so which cast to ask for has to be decided before the
  // request is made. The listing already read AttributeType, so deciding costs
  // nothing. Keyed on the metadata service's word rather than the maker's:
  // Integer and BigInt are both "Number" and their casts are different types.
  var ATTRIBUTE_CAST = {
    String: { cast: 'StringAttributeMetadata', select: 'MaxLength,Format' },
    Memo: { cast: 'MemoAttributeMetadata', select: 'MaxLength,Format' },
    Integer: { cast: 'IntegerAttributeMetadata', select: 'MinValue,MaxValue,Format' },
    BigInt: { cast: 'BigIntAttributeMetadata', select: 'MinValue,MaxValue' },
    Decimal: { cast: 'DecimalAttributeMetadata', select: 'MinValue,MaxValue,Precision' },
    Double: { cast: 'DoubleAttributeMetadata', select: 'MinValue,MaxValue,Precision' },
    Money: { cast: 'MoneyAttributeMetadata', select: 'MinValue,MaxValue,Precision' },
    DateTime: { cast: 'DateTimeAttributeMetadata', select: 'Format,DateTimeBehavior' },
    Lookup: { cast: 'LookupAttributeMetadata', select: 'Targets' },
    Customer: { cast: 'LookupAttributeMetadata', select: 'Targets' },
    Owner: { cast: 'LookupAttributeMetadata', select: 'Targets' },
    Picklist: { cast: 'PicklistAttributeMetadata', expand: 'OptionSet' },
    MultiSelectPicklist: { cast: 'MultiSelectPicklistAttributeMetadata', expand: 'OptionSet' },
    State: { cast: 'StateAttributeMetadata', expand: 'OptionSet' },
    Status: { cast: 'StatusAttributeMetadata', expand: 'OptionSet' },
    Boolean: { cast: 'BooleanAttributeMetadata', expand: 'OptionSet' }
  };

  // One column, in full. Three tiers, each narrower than the last, because the
  // cast is the part most likely to be refused and losing the whole definition
  // over a max length that could not be selected would be a poor trade. This
  // is the same shape tableSchema uses for AttributeType.
  function attributeDetail(xrm, table, logical, raw) {
    var base = "/EntityDefinitions(LogicalName='" + table +
      "')/Attributes(LogicalName='" + logical + "')";
    var spec = ATTRIBUTE_CAST[raw];
    var full = base + '?$select=' + DETAIL_SELECT;
    if (spec) {
      full = base + '/Microsoft.Dynamics.CRM.' + spec.cast + '?$select=' + DETAIL_SELECT +
        (spec.select ? ',' + spec.select : '') +
        (spec.expand ? '&$expand=' + spec.expand : '');
    }

    return apiGet(xrm, full).then(null, function () {
      return apiGet(xrm, base + '?$select=' + DETAIL_SELECT);
    }).then(null, function () {
      return apiGet(xrm, base + '?$select=LogicalName,SchemaName,DisplayName');
    });
  }

  var REQUIRED_WORDS = {
    None: 'Optional',
    Recommended: 'Business recommended',
    ApplicationRequired: 'Business required',
    SystemRequired: 'System required'
  };

  // RequiredLevel, IsAuditEnabled and IsValidForAdvancedFind are managed
  // properties - an object with the value inside it - while IsSecured and the
  // IsValidFor set are plain booleans. Reading them all through here means a
  // property that changes shape does not become a row reading "[object Object]".
  function managedValue(value) {
    if (value && typeof value === 'object' && value.Value !== undefined) return value.Value;
    return value;
  }

  function yesNo(value) {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return '';
  }

  function optionCount(set) {
    if (!set) return '';
    if (set.Options && set.Options.length !== undefined) {
      return set.Options.length + (set.Options.length === 1 ? ' choice' : ' choices');
    }
    if (set.TrueOption || set.FalseOption) return '2 choices';
    return '';
  }

  // Label and value pairs for the expanded row, in the order the questions get
  // asked: what is it called, what is it, what will it accept, then who can see
  // it and where it came from. Anything the environment did not return is left
  // out rather than shown blank - a row reading "empty" would look like an
  // answer, and this listing is read as fact.
  function detailPairs(data) {
    var pairs = [];

    function add(label, value) {
      if (value === null || value === undefined || value === '') return;
      pairs.push([label, String(value)]);
    }

    add('Schema name', data.SchemaName);
    // Both words for the type. The listing's column speaks the maker's word
    // and the API speaks its own, and the row you opened to settle a question
    // about a column should not make you translate between them.
    var friendly = typeName(data.AttributeType);
    var apiName = managedValue(data.AttributeTypeName) || data.AttributeType || '';
    add('Type', friendly && apiName && friendly.toLowerCase() !== String(apiName).toLowerCase()
      ? friendly + ' (' + apiName + ')'
      : (friendly || apiName));
    add('Requirement', REQUIRED_WORDS[managedValue(data.RequiredLevel)] ||
      managedValue(data.RequiredLevel));
    add('Maximum length', data.MaxLength);
    if (data.MinValue !== undefined && data.MaxValue !== undefined &&
      data.MinValue !== null && data.MaxValue !== null) {
      add('Range', data.MinValue + ' to ' + data.MaxValue);
    }
    add('Decimal places', data.Precision);
    add('Format', managedValue(data.Format) || managedValue(data.FormatName));
    add('Date behaviour', managedValue(data.DateTimeBehavior));
    if (data.Targets && data.Targets.length) add('Points at', data.Targets.join(', '));
    add('Choices', optionCount(data.OptionSet));

    var valid = [];
    if (data.IsValidForCreate) valid.push('create');
    if (data.IsValidForUpdate) valid.push('update');
    if (data.IsValidForRead) valid.push('read');
    if (valid.length) add('Valid for', valid.join(', '));

    add('Audited', yesNo(managedValue(data.IsAuditEnabled)));
    add('Field security', yesNo(data.IsSecured));
    add('Advanced Find', yesNo(managedValue(data.IsValidForAdvancedFind)));
    if (data.IsManaged !== undefined && data.IsManaged !== null) {
      add('Solution layer', data.IsManaged ? 'Managed' : 'Unmanaged');
    }
    add('Custom column', yesNo(data.IsCustomAttribute));
    if (data.IsPrimaryId) add('Primary column', 'Primary key');
    if (data.IsPrimaryName) add('Primary column', 'Primary name');
    add('Column number', data.ColumnNumber);
    add('Description', readLabel(data.Description));
    return pairs;
  }

  // The client's own words for the requirement level, which are not the
  // metadata service's words for the same thing.
  var CLIENT_REQUIRED_WORDS = {
    none: 'Optional',
    recommended: 'Business recommended',
    required: 'Business required'
  };

  // What the form is doing with the column right now, which is the half of the
  // answer metadata cannot give: a column optional on the table can be business
  // required on this form, locked by a script, or on a tab nobody has opened.
  // Costs no request - it is all on the form that is already loaded - and is
  // read fresh every time the row is opened rather than cached with the
  // definition, because it is the half that changes while you look at it.
  function formFieldPairs(xrm, logical) {
    var attr;
    try {
      attr = xrm.Page.getAttribute(logical);
    } catch (e) {
      return null;
    }
    if (!attr) return null;

    var pairs = [];

    // Every one of these is optional on the client object depending on the
    // column type, so each is asked for on its own and a refusal drops that
    // row rather than the section.
    function ask(label, read, shape) {
      var value;
      try { value = read(); } catch (e) { return; }
      if (value === null || value === undefined || value === '') return;
      pairs.push([label, shape ? shape(value) : String(value)]);
    }

    ask('Requirement', function () { return attr.getRequiredLevel(); },
      function (v) { return CLIENT_REQUIRED_WORDS[v] || String(v); });
    ask('Maximum length', function () { return attr.getMaxLength(); });
    ask('Submit mode', function () { return attr.getSubmitMode(); });
    ask('Changed since load', function () { return yesNo(attr.getIsDirty()); });

    var controls = [];
    try { controls = attr.controls.get() || []; } catch (e) { controls = []; }
    controls.forEach(function (control) {
      var name = '';
      var state = [];
      var type = '';
      try { name = control.getName() || ''; } catch (e) { name = ''; }
      try { state.push(control.getVisible() ? 'visible' : 'hidden'); } catch (e) { /* not exposed */ }
      try { state.push(control.getDisabled() ? 'read only' : 'editable'); } catch (e) { /* not exposed */ }
      try { type = control.getControlType() || ''; } catch (e) { type = ''; }
      if (type) state.push(type);
      pairs.push([name ? 'Control ' + name : 'Control', state.join(', ')]);
    });

    return pairs;
  }

  function webApiUrl(xrm, record) {
    return xrm.Utility.getEntityMetadata(record.table).then(function (meta) {
      var base = xrm.Utility.getGlobalContext().getClientUrl();
      return base + '/api/data/' + API_VERSION + '/' + meta.EntitySetName + '(' + record.id + ')';
    });
  }

  /* ------------------------------------------------------- relationships --- */

  // Only the relationships that hold a countable collection of records are
  // listed. N:1 is deliberately left out: it is the lookups on this record, so
  // the count is always nought or one, and the value is already in Show all
  // fields. Nothing is filtered on IsValidForAdvancedFind - which relationships
  // are worth looking at is decided by whether they hold records, not by
  // whether a maker exposed them to Advanced Find.
  var ONE_TO_MANY_SELECT = 'SchemaName,ReferencingEntity,ReferencingAttribute,' +
    'ReferencedEntityNavigationPropertyName';
  var MANY_TO_MANY_SELECT = 'SchemaName,Entity1LogicalName,Entity2LogicalName,' +
    'Entity1NavigationPropertyName,Entity2NavigationPropertyName';

  // Dataverse stops counting at this many rows for a standard table and says so
  // in an annotation, rather than returning the real total.
  var COUNT_CAP = 5000;
  var COUNT_PREFER = 'odata.maxpagesize=1,odata.include-annotations=' +
    '"Microsoft.Dynamics.CRM.totalrecordcountlimitexceeded"';
  // Requests in flight at once. A table like Incident has dozens of
  // relationships and each count is its own request, so they are not all fired
  // at the same moment.
  var COUNT_LANES = 4;

  function relationshipSet(xrm, table, collection, select) {
    var base = "/EntityDefinitions(LogicalName='" + table + "')/" + collection;
    // A rejected $select would take the whole listing down with it, and the
    // unselected response is only larger, not different.
    return apiGet(xrm, base + '?$select=' + select).then(null, function () {
      return apiGet(xrm, base);
    }).then(function (data) {
      return data.value || [];
    });
  }

  // Read per table rather than per record, so it is cached on the store and
  // reused when the panel is opened on another record of the same table.
  function readRelationships(xrm, store, table) {
    if (store.relationships[table]) return Promise.resolve(store.relationships[table]);

    return Promise.all([
      relationshipSet(xrm, table, 'OneToManyRelationships', ONE_TO_MANY_SELECT),
      relationshipSet(xrm, table, 'ManyToManyRelationships', MANY_TO_MANY_SELECT)
    ]).then(function (results) {
      var list = [];

      results[0].forEach(function (r) {
        // The collection valued navigation property on this side of the
        // relationship. Without it there is nothing to count against.
        if (!r.ReferencedEntityNavigationPropertyName) return;
        list.push({
          kind: '1:N',
          table: r.ReferencingEntity || '',
          nav: r.ReferencedEntityNavigationPropertyName,
          navAlt: '',
          schema: r.SchemaName || r.ReferencedEntityNavigationPropertyName,
          via: r.ReferencingAttribute || ''
        });
      });

      results[1].forEach(function (r) {
        var isFirst = r.Entity1LogicalName === table;
        var other = isFirst ? r.Entity2LogicalName : r.Entity1LogicalName;
        var nav = isFirst ? r.Entity1NavigationPropertyName : r.Entity2NavigationPropertyName;
        var alt = isFirst ? r.Entity2NavigationPropertyName : r.Entity1NavigationPropertyName;
        if (!nav && !alt) return;
        list.push({
          kind: 'N:N',
          table: other || '',
          nav: nav || alt,
          // Which of the two navigation property names reaches the other side
          // from this one is not stated unambiguously by the metadata, and a
          // self-referential relationship has a valid name at both ends. The
          // count falls back to this one if the first is rejected.
          navAlt: alt || nav,
          schema: r.SchemaName || nav || alt,
          via: ''
        });
      });

      store.relationships[table] = list;
      return list;
    });
  }

  // Display names for the related tables. Asked for by name rather than pulling
  // the whole catalogue, which is a large response for a handful of labels.
  function tableDisplayNames(xrm, tables) {
    if (!tables.length) return Promise.resolve({});

    function collect(rows) {
      var map = {};
      (rows || []).forEach(function (row) {
        var label = readLabel(row.DisplayName);
        if (row.LogicalName && label) map[row.LogicalName] = label;
      });
      return map;
    }

    function everyTable() {
      return apiGet(xrm, '/EntityDefinitions?$select=LogicalName,DisplayName')
        .then(function (d) { return collect(d.value); }, function () { return {}; });
    }

    var chunks = [];
    for (var i = 0; i < tables.length; i += 40) chunks.push(tables.slice(i, i + 40));

    return Promise.all(chunks.map(function (chunk) {
      var filter = chunk.map(function (t) {
        return "LogicalName eq '" + t + "'";
      }).join(' or ');
      return apiGet(xrm, '/EntityDefinitions?$select=LogicalName,DisplayName&$filter=' +
        encodeURIComponent(filter)).then(function (d) { return d.value || []; },
        function () { return null; });
    })).then(function (results) {
      var map = {};
      var refused = false;
      results.forEach(function (rows) {
        if (rows === null) { refused = true; return; }
        var part = collect(rows);
        for (var k in part) {
          if (Object.prototype.hasOwnProperty.call(part, k)) map[k] = part[k];
        }
      });
      // $filter support on the metadata endpoint is narrower than on table
      // data, so falling back to the whole catalogue keeps the display names
      // rather than dropping the listing to logical names.
      if (refused && !Object.keys(map).length) return everyTable();
      return map;
    });
  }

  function countRelated(xrm, entitySet, id, rel) {
    function ask(nav) {
      return apiGet(xrm, '/' + entitySet + '(' + id + ')/' + nav + '?$count=true', COUNT_PREFER);
    }
    return ask(rel.nav).then(null, function (e) {
      if (!rel.navAlt || rel.navAlt === rel.nav) throw e;
      return ask(rel.navAlt);
    }).then(function (data) {
      var count = data['@odata.count'];
      return {
        count: typeof count === 'number' ? count : null,
        capped: data['@Microsoft.Dynamics.CRM.totalrecordcountlimitexceeded'] === true
      };
    });
  }

  // Runs the worker over the items a few at a time. A rejected item does not
  // stop the queue - each row reports its own failure.
  function throttle(items, limit, worker) {
    var next = 0;
    function pump() {
      if (next >= items.length) return Promise.resolve();
      var item = items[next++];
      return Promise.resolve().then(function () {
        return worker(item);
      }).then(pump, pump);
    }
    var lanes = [];
    for (var i = 0; i < Math.min(limit, items.length); i++) lanes.push(pump());
    return Promise.all(lanes);
  }

  // The related table's display name is the label, because a relationship
  // schema name is long and says little. Where two relationships reach the same
  // table the name alone is ambiguous, so only those rows carry the lookup
  // column that separates them.
  function labelRelationships(list, names) {
    var seen = {};
    list.forEach(function (rel) {
      rel.label = names[rel.table] || rel.table || rel.schema;
      seen[rel.label] = (seen[rel.label] || 0) + 1;
    });
    list.forEach(function (rel) {
      if (seen[rel.label] < 2) return;
      rel.label = rel.label + ' (' + (rel.via || rel.schema) + ')';
    });
    list.sort(function (x, y) {
      return String(x.label).toLowerCase().localeCompare(String(y.label).toLowerCase());
    });
    return list;
  }

  /* ------------------------------------------------------------- styling --- */

  // Applied through the CSSOM rather than inline style attributes or a style
  // block, so an enforced Content Security Policy does not affect it.
  function style(node, props) {
    for (var k in props) {
      if (Object.prototype.hasOwnProperty.call(props, k)) node.style[k] = props[k];
    }
    return node;
  }

  function el(doc, tag, props, text) {
    var node = doc.createElement(tag);
    if (props) style(node, props);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function hover(node, from, to) {
    node.onmouseenter = function () { node.style.background = to; };
    node.onmouseleave = function () { node.style.background = from; };
  }

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function svg(doc, paths, size) {
    var px = String(size || 14);
    var s = doc.createElementNS(SVG_NS, 'svg');
    s.setAttribute('viewBox', '0 0 16 16');
    s.setAttribute('width', px);
    s.setAttribute('height', px);
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '1.3');
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    s.style.flex = 'none';
    s.style.display = 'block';
    paths.forEach(function (d) {
      var p = doc.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', d);
      s.appendChild(p);
    });
    return s;
  }

  // The Oliver4 mark, from oliver4-icon-32-light.svg - the variant whose left
  // leaf is white rather than near-black navy, so both leaves read against the
  // dark panel. That file is not vector artwork: it is a 645x590
  // PNG in an SVG wrapper, so what is inlined here is the same image resampled
  // to 128px wide - four times the largest size the toolkit draws it at, so it
  // stays sharp on a 3x display without carrying the 168KB of the original.
  // It is inlined rather than fetched so the extension makes no network
  // request at all - the artwork ships inside it. The geometry below is the
  // wrapper's own: a 32x32 box with the artwork inset vertically, which is
  // what keeps the mark optically centred.
  var LOGO_ON_DARK = 'data:image/png;base64,' + [
    'iVBORw0KGgoAAAANSUhEUgAAAIAAAAB1CAYAAACGYelhAAA5NklEQVR42u19eZxcVZX/99x7X1V1p5MOWyCEJexLkEVQQEeTII4MMzCgdhxZBwTcBtxwYVw6PY6A4zCK+kNxBcWRSYsDiDisSRAEMQgEEiASsi+ddDrd6aWq3rv3nt8f9773',
    '7qvuQEIWAuZ9Up9U1/Kq6p1zz/me71kuYefxV3AwoQ0CR4IAWHSQ3XlN/iqEzhIzWA57qm1G9hjtvFBvsKONJdoATCOTPXb5gjKaJh6HyL6ToujdSPQj/LXydMxgqXZesTfA0c4CgEAHaXSSQSeA9q4WJK2TQfIsgN4JEociInAZQEwD6Vt3',
    'KsDr2cTPgMA8sPfpFm0scWhtMqj0flg+DSV5AARAGmBjDWIbw8oSGGUAwDzwTgV43cmdCdMh0UEa0+DM/FW1wwH1XgjTBlE5FhEADUDbBAxmCAFmAYICQYKpeacFeD2a+UkgEBkAGu1cQq1+BmR0MRinUFlUYAA2xpAlA0AwWIIBkAHI/WMG',
    'QBgNAOjYvhaAmFkQBeBk57Fpgp8PQoe/bpdv2APNlfOQ2A+hXJ4EAEiM5djWCZAgEgwoMIMAcIDzORUEocxeH9T2sVpMgoiJyBARvvKVr4iOjo6dsejmCP4L1QPB6hKQuABlMQEGgLYxGCAiweCIqRjUsQ/zmINHGGAi9yDRtg8D/aq3AGju',
    'vOf/8ehJh9/uH5c7rcFGfPw0CHT6a/PpgeMQNV0O5jaUZQs0ALYxCASCcEvcCRNgEBEYDAKBc8l7awALKRUSPR9l9SZ0kFXbWPiSiEz7N3869iPn/P3Ne43b48yu7p7f/vEPT3yMiJYysyIivVPqAap3i8LgE7UjEMkrIeh8RCJCzEDdxiCW',
    'IFLE2YJG5uDTVc8Fgw+A3eNE+eu3NRE0c+ZMNXXqVH3P7NkHHH/UMb/ebdfWY6vVWtLUVIk29A+sWLh42blvPvrI2TstgSdvshU/tC8o+iyYLkZFjqLYGia2ECT8wnZCI3fjhiVO5MXNI0mYLJRQMPZZ/Ls8GrSNQCDzTEU0VT/yyFPHTTrq',
    'wDtax4zed2ioqoUQUbVa02NaWiYcdtDE+xa8uOQKIvo+M0sAloj4r87PTweDyOCynlY0j/kkmP4FkdgdiWHUTQwhJWBltrQ5lzSHAubs4ufmn1IdIHB6acm/2L9dbAOzr4im6j8+MffkNx198ANe+EYIoRwCJTVUrVqllDrkoP2+99LSFdd5',
    'C0Dt7e3ir0PyTJjBEh1kQcT4pL4QTWPmoCSng2l3xDYGkQVIMVtKUVwK2TiVXuMCZ4ftMtdfeFHhlXab8AAzvU+f8/S8dxx20MS7mpsrY7zwCwkJIYTQ2jCz1Qfsu/enl61YvQsRXUxEIWh8Y5v7aTC4In4LSFyLSJ4CA6BuYiJIBqmCOQ9s',
    'PflHMnXgYWY+/z91EwEYdI9RnMliq/p8Ij1nztMnHXbQxLuam5rG1IbqVkohiTxIdTEoiAApiaxlVavV9D5773lR15p1v/7KV77fTES2nfmNZwmYCe3s0P1H+sfhiuTbIPl7SHkKYhPDGO0XZAMuy0O1bHWz+yO/X5Q9IXiC82sfGI7B1AWp',
    'rWT2JRHphx594uhDDzvod6Oam8YMDdWslKIgyIYwFUIQAKharabH7bHr2R/7+Pvvwh7JmdOBQbS3v3G4gsms4KIdxsfr50DIaxDJ/VC3FmwSACoFcexXLZG/n8mXg+CeAMsOE4hG60A+MuQ8MuAACzhGbpC3VhSQmuy77npg/7f/zQm/H9s6',
    'Zt+hoZoRgiTRZp0nqVQq0eq16x4YP+59pzHPMh4z8Ot61U8HoYMsLhnch1T5O1yWZ8ECZE0MQZIzMXtpCPJ2mUHCu39q5PLyKMCZ1EYg4AVPRY8AgkFJRqiZ/8U16r1o28J0cArafvSj20e/9aQ33+GEXzVSCrnZPDFRVK3W9F577PauZStn',
    '/JyIzmFmYubXpxK0sfQxPeMj+kJY+horMQGJSUiAQFDslzwhVwNKTXvK1nnMmAuZAiFTYB1ehgWkzJT4l3MPAOBI0JYoAE2fPl0QkV6yfNXNe+w29pihoZqW8tW7FSJS1WpN7zN+3D8tWb4qIaIL0hCxqP47OMJv80zeZQPjIcrfgpLToAEk',
    'OiZBioNoDFywAcGPZDBT4M8B9uaeAiiYRQjEnvcngDxhEDCECKJAFli7xSAw9fvPL3jpK/tN2OvsarWmhdgihfIAkVStVk/2m7DX+QtfWvpNIjJeCV4fqx7E6CSDS2pngyuPQ6ppiHUM2ISIVMrXO1/c6CMpw24UAD32oV8OAzgL+fLQcJgX',
    'wPB0UIYh1m1RGJgKf87ceWftv9+EjjiONYDN8vkvpwTWclSvx8mBB+z7yfkv/GUhEX13h6eNJ7NCJ2mc2z0GldFfB5U+AgCITR2CVCY/8sIlwjD5B0CP0eDjqfh8agV4IxcxIIBDEEneYHS9agvALkSzsx976oBDJu53s5KSjbFCCNpqtLIQ',
    'BGOt0onW++874fpH/zz33USkd0xL4IsvZ5PGPw+9DU1jH0Wp9BFYk4BNQuRCO0oXa8DSEHhYZOTMd9HfU2oRCjrACKO9lNyjMGb0H0mhZjAAw84CTMJmx9sOpxLxwfuN/8GY0S1j4ji2QpAY+aU0QqCxaXoiBVGitSiXSnTEwQf8cvbsxw7w',
    '7mDH4QjaWWQm/0PxhxGVH4CQRyIxMQQEBAt2jjxI0jTE87ZoAELGljJT4Fc6NyYA4JOC4Xm9e0BDdOAiAwFjGWBnATo30wL4kE/Pe/7Fz+09ftyptVpdF1m+lxP68JjklRRCCBL1emxbR7fsdtgRB916/fXXl50Z49e+mrnNU7kXLqrgouQH',
    'UNH3wYhgTEIpocPefnOD+U45Gg6SNjxciEUSkHNvXwCNnOMDLrBBjW6BmUgQ8wCkXuOjgE2/kGm8/8c/PnnskUcd+qdyVCKttTf9myuPkWgI3sjnAsysm5oqasnSlTdM3H/Cx19zPDCZFWaTxjnVA1GKbkFZngxtYhCkC2aCMIwYEGlCxv0g',
    '8v4/ez6UG/nEDZEz5wEh5M5bzP5QhiU8iyS8Y88igezKWkihyJqFHMmj0EE1gElshukntLXJ/Q/Y5/stzc1Ka41X7/dpk12Buwik6vVY7zNhr4/Nf+HFf3pN8cDkmU74F1bfhbJ6BFKejDipE7MCc9E+p0LiPFPjdMDdL6RtQVkxx7Brwwhs',
    'AOeuwVsLCtkif+40wghgInt7vxIdVHPfdRNLwtJavhf+svjyPffY/URn+tOQb2tZY9qoFRAEGGOklNLus/deP3zg4cefFEK8sH0TR0xoB6GDNC6oXgShvg+gBFOLQcKTOqLItxDnuC/15ZRWZwaxvA8N0jiesDHDyCMb06DEK5RHGiYyhfpD',
    'LwEApkEAMGJThA/Azpz52D57jtv1q1obm/3S7dhYJKWgOI55dMuoliMOPuAnHgfQdvkSKdjrIIuLqlejVPkJbCxhY8fjZylbLiRiKODxiW2O/piLft4j/YC0L5A8maBd9b8TLAcuAw3ZIpsmivz3sJzFf2z5+ZQF3NQwkIiI9z9wn2tax4xu',
    'TZKEiYR4LbrKhBCyVqvr8Xvu/rbnFrx0xXaJClKwd96qUbhw4FbIylXQAzFgGcQCoWBhwbAAW3/fPUbMQRI3B3OUKQRSKNcQJRDYOoE6LpRHMAD5OfIbgVI3kHolJoIBJPOLaQj4igowY8YMSUTm8T8//5Y999jtnHo9tkT0msXiztJZqbUx',
    'E/Yad/WsRx89RAix7ZTAkTsGF3RPgGq9n1TzBxD31sFWAiBYpsKVZ+tXen4jrxh5OMcZBsh8Q6YEeSqX0tcFoqbw48Ls4DAPkaeK2TtItiwRW2vILgQAzCsWFL2c7+flK7semDB+3NRqtTasuGMr+9lNepW11jQ1NcmVq9Y8MGHvPU/dJnWF',
    'GdLvOhallk6I6GAk/XUQKUBmhJ6H+HmhQ/AbSORRoLO3osgAcgBy/DkojRyJsyifC1y/R/jpecKoj/OIITuftxEkpGSruyDVEbiW1rtEA2185fiLaufOW/iuPcftNrVer5ttv/pfmRtIXUG9Xtd7jx/3rrnzFpy31fMF7V74560/BdGoB8B8',
    'MOL+OgAFywQ2xFl+ygBsQGwAa/LVDwtYA7YWsBbMDPaPZ6uc3C1bpnDZT4fiM+gZ0IBF6odGuHwUMoOcxhTEkABAi3Et9TofQa/oAhgAdtt19BeUlLBmeyXjNk0JrGVhjeW9x4+7+ke33z7a6exWIIgmz1ToII1z1rUB6rew8S4w1RhsI7Cl',
    '3GQ7Aac3tl4J2HqlSBGbDcCh9QDQhqGBW6xsAcsMtiM+H1LFjfA3VYfGesCUIGLAOhhL8wAwZuRyFy+3+v/wp2fePrZ19Cn1emxJ0A7FwwtBolaP7W67tO57ynFv+ZgPB+WWm/2pGuf1/AtUeQYhiWASDcsqRPDgEMDZzNlyhgECpB8InwKc',
    'QJyDxJDozzB9SgSFeVziEZYFFXIGYbKoMYpgwU97/0+blAzaZ+/dP9fcVCFj3PKn7Qr8eROUAKS14bFjRn1mxv/9364AzKuzAkwZwXN+7xdQGvMd2Lpm1l6pArDmhZaa87BUwQE36wKEwusZoTzYwXSi9LtyoCAFiQUKkZX4caFAiBB2iAS1',
    'A6myMNz61wB08hwAYH7+QWJjpM+sR584YpfWMX8XxzETpcCPGl/bgFS3luA37ZxEJLTWZpexrXsce+iRl/vKIbHZwm+DwOypGud0t0M1X0O6N3b91VbmC8zmZp+DG2x2P/fxqYLklsELmTwV5IE/g9lSRhx55E/Ze9njh/xcxZCQUYgCKWUU',
    'U6OSqoBQlJh1QOVJnwSyL2cBCAD2mzD+spZRzZEx1tAOPUiGhdaGdxs75uO/uPPO3QHYTbcCQfXOueuuRmn0dOgNMcNKd23YCdckubDhQF1m+sMMDwUpPk4VIzf9bsVYv2j8ebzCM9s8Awgf+6cgjkNr4F7rdI0KdDKFGWdKC0DJQhLA9Az+',
    'i7pTCnhEBWBmIiLz85/fPWZMS9MHrbUgIuErdUZagSM+vp3ZAZEk2uy6S+sexx959Ee9FZCbI3w6v+cbKLdeBdMXA0YWTLNJANYe2OlAERprshvcQ8oD+L855wrY33KFyZi6Ih7IsEaQBczTxN76WgwnglKCyLJDxk7KfwYATC9em4ICzJo1',
    'SwLAsW899NRdx47dM44TQ5S+ZtNN8/YmhwAW1lrebWzrpd/42c9GCSH0y1uBYOWf1/MfrEZfScn6GGwUpbQua0DXs1UMG658J9hslcNkwM6t3BzFc/a3B3+BNaDs5pXEWv96v8obgGdmFTIQarMEUwZKUzrCBoy0ARj2DyPiqPCPKVOmMADs',
    '2jp6GuUoZrMzeNuaCBopIojrsd19t7H7nvm2KWcwc6bMIwO+WdIL/xqUxnwWSU/CrFWawmebAEnVr3yb+3nY4TcvXGYDLliH1MTn2CGzDOAgHLS5IL3PzxQudBdZ/sCOwCLaAI+x/wgfNlgorusBkHo8jaDDq6Eazf+MGTNbylFpqrVMPhwM',
    '007bgQPgV6k6DgaPHtV0MYBbp0yZMnKWcPIsidlTNc5dezXKrV9Asi5G2iRLcCY/qXpEX6yozTJvgrLcqgvNneIQU9C0mfrjNEoX3lJTUOad3qegpZvAlvKeALZZa3eaDE7rCMifhzmgyk0YIpCFkhLG/An/Rcs8+zeyAnhrYA4+fM+TW1vH',
    'jEuS2AohtkP5FW8lV0AyjmMeM6Z58u9//+QkIpo3LF2c0rsXdP8rotFXIe6JAevCPEHO5NeHPH3radQsq5ZXZRALMJssE8ehckBmXRlpGRcRgYV1zb0pOheU0cicnd8Tv+RyTFlRh80LQYjy1iH2lDCRAMgCtmGxMhgRQMY8yrn/1xtTAAKA',
    '1jFjTldSQCdsiRoLRrZaQ9HWVyNmK4UQCYiamyuVYRggFf55az+HaPTXkPQlICthrIubkipQHywQrkwNyRdKS7k5Y97y+ly/qoVbS1m2nyhb9Rw281sBCBtE9dmbHX2cvtf3iJHXHldPIJAWkPg35Ia9UAnEgrRlZvFgY/w/kgKYtrY22dJc',
    'OdUD4Jep99lSdzBCWpNHAnebdhhrbUlFFGujlyzrmnb88Uc8UVj9qfDP77qcKmO/znFfArIC1rprFQ8AcT9AMqvn4kZKmjKqJ6i1pYC8SWvzjE8Fi4bFInw/X9Apy+l0F5E7saxYJMdd5JWAwSALsLBOCQqNoeRT0Vm5mYWIFCd6Kbj3j43x',
    'f0EB2tvbBRHZ++77/f6VSvnQJNGbMD+IN8Lhb89VD1hrbaVSplot1gsXL5929KRDbi9kBzOzv/psyFHf5mSDJhjh5igQUO8Hqr3etzOYhTfPeRcOKCzvSFdy3n3jrL/ICz3DrCAJePm6zp68Z9s9hzzzB7JgEllGMMvlp+4CedxPHFSNNuIK',
    '99mWpGA2/Ahu2HOgMIWkMQqYPn06AcCE/cYfM7qlpWSMMbTZAT6/zN88Qty85YfWhpubm7BufV8y9/mF7/fCV7nwPb17waqpEKN+QYgNOCZm7yzrA8BQT4Hly7J61kDAQgqGFAwlGUoCSgBKMBQxpLAQPvGTRQFhkogtiAP0by0oCycNiHWW',
    'P3CfG0YLOdLPIgEE7GIaMmbRgs05Actga4kNCMb+DkBWAbQxF0AAUK6Uj/NxNb+6Fc2vGuBtrrolieaWllH2uQWL5fXf+/m5N37rK3fOmTMnIqIEQDqIQeOcJadCjvk1EFfYJgYgQSTA9fXAwNqG8FYgrLa1MWCrFhA+M8NBXja9RCUFVGTY',
    'yoM8GPd4ICXfOMcDRAALb/o5JNSET+OKIM8nMv/urJJwX4WDgvGM4BO+eIAU6kN9kHyfJ4AMOjauAAwAlXL5CLwOjlT4981+XF7+qa989IUn7/nVjTfeGJ1wwgle+DOcubtw1USIlhkQdjRMot3VFeBaL9C/CsWq+NwPCylgqxp7javg3Kl7',
    'e9cdDGhhkAGxkgJPLhrC/X/ug4gkbBYJiNR3eDJXZOFeRggKAbIe8RNcpjn9DOuFmfp+wZkiube71Z66CrIhKrNgJouoRSIemoUbWlajnQU2UjyrfIGFAUCRlAcHCaEdUvjWWrS0jDLfu/k29bnPdnxhYO0z3/cTyZzw29sFOqYZtM1phah0',
    'QqldKOlPGCxBAqj3Av3LvX/l4Mo5MyukACeM1haJO750GN56yGjaCNAhAPzD+9bg/j90QZSaPFHjwBhZ4ZCCEGlNTxA15PfzNK5THE5Lvyi4WZEX/GaKxN6CUBamsj8H5UzybV7LRSMBlCmAJ4D42htnjJFS7u378WlHFX5TU5O+6ms3qGvb',
    'r7sW5qWvt7e3q6lTp+qgfgY47cQyWg7pRNR0AnRfzIACSaDWC/QuRbGeLu/cIRKgxIAA/PKLx+Gth4ymWmwcBkMxH6INI1KS+gYTzlhCm+b6cjBI1gE7+PCN8hqdLMQLAk8vYwFiDypJuBAwbRZJQ0o/JYQoAIeOymGwVKj190HL+1w1M2+0',
    'XC5zNG8+bN9xUohdjNkxR/ZpbdDU1KT/84Zb1LVf+vKtCouumjy5XXV0dJic4oWr4N3rxB+iPPrdMAN1MBSEdGh//ULAxiCrAas9EPOADAzJBmaojh9+6nD6u2PHUqwtSoqgpLtJAqRwN/cYQMSUUsUMEwBA/xnW5P+nnH+WP/ApZZumk0Pg',
    'GKadPcj0AJGD/ARbBx6D3IBh1Uys4wdwszf/2PiADdXpFaBlVMu4SqUSGWN4R7MAxlqMGtVs5r2wSLV/7fqHZ7TtdeG8Iy8XXvjux7X7EeoX9nwRlV3OR9JTB6wTftwP9DzvaF4SfnWmK8cCgiClgN4Q49rLJ9FFp45Hog2UyOCXs58ECAjY',
    'wJq6mj/t0Xihrzungiks1hN5pJaCv4x3SNlDkUeKBIcBWGSUsbMcFkQiwwQpV0AsCXECtvYXPsO3UfMPAKrN32lpruxRLkeo1+tbVFrlR71tVQWQQphEG/mZL//ns0Mr57zvg7eJ2HQGkH0yuzq+C9eei3LLv0MPuIYNSCJTB699DtA1gKRb',
    'bQ2sZiQlkr4YV5x3CH3+/RMRJwbST+OwVCyAsQ1YyhoD2ASwOgNjyMw0gmlPnHd0pPX+Pn+QMo5ZLoFQzEUYEQyO4mxEcNaNJFz+AEIwtIkQ9yzDrvvcCwCYPeVlTbqYlVUs09itSs5vrdVvjC2Xy/TT/75zwz2dN7xPSbHGWCsBP0Es7c2/',
    'dN3bUGn9MaANyAiCIFgN7noaiPt8pi1xef00u2c1lLRI1vfjA6dPoOsvOxyJNpCiYbaizwcQaCM0hzfF3pyTj/HBBmRzEw9rQFYPM/1ZYWmQNs5qCWz+XdPnObU2aebQ+GxinBhYASa+DTfQACbPVC9n/gFATElNgaSmHRD0cXOlwi8tXSV+',
    'cPNtHxKCFrz9S19WXorI5u5dtmY8ZMutECgD2mbAumsuMLTWIWabZKlZ8qSKUgTdN4h3vGUv3PyZY9lY60N+KvJXG5vGlTKwHPh876vhiR0OFC5VCrZOMYhd2Tg1Eki+ythZKxuUm3POANqcOAIzEMfg2pBCUtWQdBMAYNzaV1zMKkiqlzN+',
    'YwsQwNY0/1IKAyHUrEeeuPKJB3/xq3QAdQb65sMVc8rWn0GV9qV6f8IWEiSBrqdcuCcjn9f3WTyPtaVS0IM1HHZQKzqnn4hyJEhrk84uzOMm2kgCjAIMkK1WzpWFhY/WyAE+pClkzvIGQdtHFhqm5BAFySHnUixyxtglkRwGkIDRQJwYRKMi',
    'mHgWbjnwaaBdoHPaKyL6IKkNsYOtflMqldWipSt/8qFzzrhuJnMgfA/6OsngsBNvQKl0KpJazCAJVQK65wPrXwCkAHGSo2mrAdaQxDD1OvbYvYL//do7ac+xZUpBX5ZjIBRz9txwxTgPTdPVnkUV1gKsndXxTSPM1rsDm5WWOVRfRPsISsu5',
    'UIQaFKX6CmKnW8alsK1xSmf5pw4XTdkkeeYFIcYM7SiJXmutbWpqkj3r+xY8PPvZK3zXT67N7R70faj/CjQ1XYrYxMSsWFSAnheAricAVXJce942AQZBEIF1DWVS+NVX344j9mvhJDEkJXkmr2FshR/okH+5BotnPQhk7T7DhwtMYdLHt3+T',
    'yDu5U/+Rkkd+eKCr7PH0Hok8Us/mBlpPHQOIDSiOXRAhmxSS/lW2ie7cFPA3zAIYg5pPatJr7fdLUcSDQ9X6sy8t+eAFF7xnsLOzMx8W6bp1NS7e8E6Umq5DbDRYSxYlYGAlsPwhn30L4mXvh4mcv7VxjJu+/Ha886g9HOiTeQOf8BW+WYtW',
    'oSZgOERmY4b5fmLtwaDOVjullsDqQgMpeSuQNYpkbWXO31PaDx7iAmYgiUH1wfQLGahRBMLP8YtDN2wK+MsswKxZs7wm82vOALEP+aRSasmiFR+efMIxfy6kdttZoAMWF3RPQLnpv0EkYRJDUMTxALD0fgAJGCXv9wUIxq8oASUUkv4Y1135',
    'dvzT1ImUJE744So3TJkbL1gAbiiDoMAFZIJn7y0oD+OY/ZgY67+PyEd4phyBp4BdpbDnB5C3iGcDH4kBRKAkAScurHUfpxTpwX6GvgEAYfaUTR6akVkAqUQPA69pmTdba0rlslqybPWNkw6d+ONCajcFfZhOqDT/DEpNgLUakIJhgSX3AvUe',
    'EMm8mNOzcwQDpRjJ+g349EXH0qfbJlG28lGcyUFZFw8X6d+N1MRaE0QAMMPCOOevcwsQMn6FFnLOI4e8MDT19zYDgRzXwLWB4HOMQTRKMMe34teTlqCNfX3Yph1q7VoXKvT193fXazFcGThvdzSQ+v3udb3PXve/T35iuN/3TN+lg19FU9Mp',
    'qJkYzAoiApbdD/QvBKkmsE0cOvaVNg7xCyTr+vC+v59E133krdDGEz0BohdAls0b5vcD0kj4dWO8wXT1975fwLoCkMKrSTRMbfbiIc6e40IWsQE7cFpuJoF6FZTEYCGRTYYikqQH62zE9QATjtw8HkfMmzePAaC3v9pVq9XqUsg0h7kdK3uY',
    'I+f3awuXLj/vO584vd4JjOD3e85EpflLlNgEzAoyInQ/BVo7B6TKzpemMXca60cSesMgvfX4feimL70bxji6TqSiFAJCCNdx1bDquTFplJVlNAz3C3EG5z0CbDXIJnkc39hWFnD/qXVIcxPut/jHAFB9CFwf8AUk2ZApw9EoyTa+Cb+ZNA9t',
    'nWJzt4YX06dPZwB4bO6LPdbaPqnUNuj3e0X62Cil5NJlq7540pvf9PTMmTPVtNDvz4DFRSv3QGn092Bh2VqCUkQDK4FlD/oV4S86M9gzaEIAemCADj5wV9x27RloaXK/TRDB+p58a63z4wQoJQuCpQbhj2i5UuFbB/C4oTooDfXYFs1+niTS',
    'BZaQPVPoFMjN90G1H1wfChTONRYSs0IyVINI/sut/rbNFpxI27s6PnHnoDZmrW8D4+24+k25XFarVnffe+ThB32TXbxvCjiFiKm8+3dRUntDawMoQfEg80t3MrieESV5o6YTvq3VaNfRCr/++pnYZ49R0CYnejLSyndrCSEw+7HnYW1I/FDD',
    'jN4RilmNIYTZvUyATqBp91BI/3ImdNuQLQwYRLYuxh/qA+Jq1v2TjY5hY1iOEjD1Gbj9xAWvZvVnZTDWWgl0mjiJ540c7W4z4dsoiqh/YHDd48+8cJFXvLzr0pt+cdHgR6GiaajZGJYkMYBFvwWqK70f1UGblL/pOqSJ8YuvnY03Hbiby+5J',
    'cmNaZFaLAa0NpJL4xo9/xx3/7w5WSrLlhsZ6Gj60Ih+9bwOiRoOQgNPwLwN/oXKmZJEHj2joN0zNv45B1fUuiZWKJJsQYxkgSWZwEJK/+mpXP4pcIxDHdu52Nv1WSilWre6+6qy//ZuV9kGrslLulOc/v/sIq0rf4Lo1sEaSlOAVj4DXPQ2S',
    'FW9Cg1YtAiRZMgND9L2vnIHTTtofcaIhiWBtOkhTAELAMqNUjnDXg3P4c5/9JlpbSmlIvAlJMSqmgxtifocJfI1AGh0ESShkSaFcOZxlYNegUlsP2DhLNhVbxa2FbJJs4xvwm7e9+GpX/7CawGpt6IUsxbGtUT+zaapU1KrVa+877JCJP0xH',
    '0GcvmO9tsGi5EUKNQqwTRJFE32Jg1QMgVcnj5rQShwiRYCT9g/j3K0/HJf94DOJEQ4m8v9VaCyEEjNaIIoUn5i3ic//lOoANRHgNORjvFBqABt1gMGddw1mDps0KQENvmvYKpLxEtu8PcVaRxHEVpKuAUHD7eXAwd8gATJZFJEkPrOYS/Yfj',
    '/Oe9apddYLbXd69/rr9/wAohpLXbDgk6tk/Rhv6B3qefX3gZZ4lvf6Tj2S4cvBzl8jtQMwmgJMWDwOI7AU78pTf5MAUwlCQkPb34yHkn44sXnezNfj7SMJ2pp7VBpBSWrurB+z78n9hQZaDSDKuTwP3zsAQXc16alX5da4voPc8L2NzvB9lC',
    'N0vI5mg/BYlsgFqfu3FxvkDRfWiGKAmGacddU7vRNomy1PiWKsD9989fmGi9PIqibVoXIEhYKZVYtqLrU3839eTFHozmpn82aZy36iiI0tVIrAbYdSkt+T9wdRVAUUaSpOhaSQG9fgPOOP04fOfK06G1zXawEBAQnms31m3G1LthCO+79Gpe',
    '8tJKVJpLABOU+935rHWiogFoqOELXUBK8XIh128zYOiIIp25hiwEJDiwONQNxBuyFrCMEMpmCzHcaKwoIr1hLtbt8lPnJqdtEV5Ld/NkXwlc+/BH/2EuEfZ79b0Bm2T6ZdeadTOPOuLgmxpm/Dm27/gbI9jWH4LUKMRxglJJoHsOeN2fQKoE',
    '2KTQtycloHt7ccKxE+mWr54NRe5SC/LlW6maGydEYyw+cFk7z3n4cahx45EkztemYWBhPx6i4izexh28AhYvb9axQVWQAAnfZGoZJHJrRKRAugqubXAWQZY8IEyJI+G7g02aPXLbCHPyGfPECQkOnCG3FLCLxvu1eu3hFGtuC8JHSYlqtaaX',
    'rFz9aSJCZ2dn/oI2D/wOfv+nUW46CfV6DFGSGFoNXn434OP93DwypJIwA4OYOHE3+vX152HMqBK0tRDkY/SsVd/CsIVSkj961Xf53rtmI9q1FSauZaCNGqZvBpN7gHRSRsN0PVtI5XoCqoHwYZue36eE4VY+6n3gwS7A1L2S2azHf/i0EWNY',
    'ViLowVvMA2fd73ofpm1x/iZLB3d2djIA9KzfMGvvPWOIbTMWzkZRJJetXPOtE4876qkREz1tqw6AGvUlJLEBWII1sPQOQG8AySZkM3gtQ0iCqVWx6y6jcMe3/xn7jhvjS7rIIX2vBBYW2liUIsX//u1b8ZOf3Iloz72hkwQQnsrVNR+Wobj6',
    'C7SwACjl5z0zaHQgbC7WD6S0crpfQGpUrQWq6wBdBUTkawN1UE+YRjVpdRJZpkgiHuriRH4GYELn9K2yQDNVbmtrswDwmz8+/Mzg0NDKUqlENmdFtkrMXyqVxPreDaseevJPHekU8iLqJ4asXIOo3AITW8gKoWs2sOF5kCj7+Nq3RwkBGI0S',
    'NG79r/Po6EP2RJIYROlAM5H/Oq0NSpHCzZ334cv/diNU6yho7S94asJNDdJ/HaKgSydA/pZtTiSlwNAYykJAk7jqHM9L5NO9DNi4qiToGnjDCqC+HoUJI97nU+Owaff9GCSFsPpKPPq+NWjrFFsC/EZUAI8DZMeHPzw0VK0+RES8NefvkpuL',
    'Squ6uj930dln98JPIc8In04yaFvz96SapqHWp0GRRP9ioOtBQJaRTd1mAyKGBMPW6vjR1efh3Sce5GJ9WaR4YV1JeakU4b7Zc3Dp5V+FKEtYEztlgi2McRMN+ytmfiDY1cPmuck8CkiLQmwCtrGL3znoCXBbhQLVbqB/JcjEDmf694WjZZgb',
    'B08bw1SOKO6/yz58zi1by/SPhAEwa9YsAoB5L7x0u7WWNnVHEG7ctnxkuleu6ep+eNLhB91SBH4+g3XaY2MgSt9OVwJMDVjxG/d/Vinj+HkpAL2+F9d87h9x/j8cS0niw71wxQqBxLpYf+78hfini69ibQwgGNYkINZZCOkScRLpQBQC8fDm',
    '5pH34jHWckblIlzNMWDrLqGjY2BgNTC0LktwUjBjKC0ggU8ApQrBnDADgkytlw1d7kz/vK2KzQoKkHLw06/9t/tWrOzqVSqSr+QGGoU+khIQCSRaY13fhvZhKtUGx2K17H8lSqMPRDKYQFQE1j4CDP4FJCIvLAfSlBLQPb346CXvxhcunkJJ',
    'orMa/jTkAwHWx/oru3rw3gv/FT29AxCVsqvgCYc2IS/PitJkEIM2vtlZw/xeY8mZfRvM8jN5Qq3eBx5YDq4PZkAvmyUczgtM3Yg1gUJYC4okW/1x/PGixVvT9I+oAB6oy8fuvbdnwcJF9wghttgNWGtNuVyS3d3r7znq8IMftP8zowj8OmHx',
    'j4smQpQ/ifp6A6kkVZcB3Q8BMgLD+1NYyIiQrFuPM04/Ht+56mxyeX0X42cVOrBZPn9gsIppF30eCxcsZtUyClnbW2ayAkGwTWsEivv7Ud7VK9Iu34JxYDcXnq0354nnCwyous6BPat9dKALU8GYg5GzzL7nP3MdmkQ5QjJwEx778H9jcrva',
    'mqZ/YwqANCp78slnbx6q1uiVBkURDb+Fh5SKqtWaXrxi1b8SETrDJzPgJ78KVRkNqy0xCGvuB9khJwufOZOCoHv7cOJJh9It/3EBEWy22TZgvXB8CZeUkFLgwo99GY/MfJjLY0eBjYFSClJKSKUghIQUBEkMQRYycwkYuTaenHIJEsNoACmF',
    'izwEQREg4z6owVUQZhBCSM/0Fse/5XMDbTBoOk0Da8OgEpKBpyDijzlybPo2KdkbtmnUtGlkhRD47Kc+POs975685E2TDtu/Wq2+qolhzKzL5UgtW979q7c11velPfxnzD8JVPogams1VIvgnieB/gWAT/Sw9/lmQy8m7r8n/frbl7hY35dx',
    'W+TkC/upXrpWxyVXTMevf/ZLoGV31Nd2OW5dRHnVja+lBFtoqYC+tajXa1TAESOVgPlIITUEA4MDMN2rYRADSeKmjuh6ThfLCBjdCkD6aQE244myE5Ev/gSB2TCEFMR6A0tzLh77YhWPbRBAB28XBXCRjVFCUPWlxcv/+02TDruKyFc0bpbw',
    'wVJKMTRUjVeuWN3BzFQgfdL0JZU6QFLCigS1LoGue315tXZ8mFSw9Ri77DIKt333o9h7jzFItIYUIo8hg8hMKYmHH30SK1asxJnnvB+J4QyHQCiQkNm8H2s02CRQytVVnHj8UcU6QH9SQZSK3RuHvHvoLW86AF1nnYyoJGDr/RBCQaiyew1r',
    'rOsdwO+fWAS3nQVnO/5SOnTKkgtpKdsDzhIQCa7/s3m8fT4mtyvM7thmeySOiPLb29tFR0eH/cSXrj3iS5+8bO7Y1tFSa71ZTcPMrCuVilq+avUv9917/DnF1e/DvrOe/jsSe9zNuqqhmgVW/xbo+SOgKq74Qbg+ecnAb3/0cZx60sEUJzpH',
    '/IEfa0RGm2CwuDHHB4BsOqItDf8YuQI0ugZ200Re7jNu/c3j+OCl34Aa2+J2bSXpMoHks30kHcNJCiChoVpKZOtftE999eptLfyNWQB0dHRYnxt47tJz3ztr9912eVeSJJu1ZYwQQtTqdV67uu+bbvUHT/rCRbLRVUwGRJJ54CWg9xlANmXB',
    'NiV1mMFB/Pi7V9CpJx2MkYSfVq+EhZwCAlrr4eIOmjI4m7lIgGU/FjBd2RxmgAqAJ1M2fz5jTDDokTPsaAyjUonwP795JJg6xhnDV9jbxcX9CWRTGcnQLfaZq1Phb/NS/Y2q7yzXV46VK7t+YC2T3AwIwMymVCqJvr6Bh9785sP/BICmTQtW',
    'fwdZnPHUKSxKf4Nkg2YzJGntLMBWfeGEY/rMwBD+7fMfoAvPfAuSRKMUFQHY8B/jgKCFy/kL8jchQL74U6b/S/8cCEIKuD1wi3sbi5TuDUgOm2U03SdKIv9Z7n8ZKUgpUKlEWL22Dw89/gxQ8gRVuLFjVkjKcP5OlpEMPsQbVlwKtEkvfH7N',
    'FGDq1KmamcXfvusddy5euuzZUrksmDeteYSISBuDNV3r/mOYqznS721l7RdhjRvO1zcfqC5yI1Q4hpAM29+H88+ZQl/++D8giV2sb23D2YJdMojIo/SigxPBvrsjAjvC8KaP1K00hIJc6A4SadDpLiJlcS98LQXPfuxZ9KxcDVkquRCPOJvg',
    'mu8rYDRIlGDjP7MYPAtLbq4BR2630ewvu6y9FajPfea5a6zdtMEhbvWXRXf3+qePPvqwe9Ih1Bny7yCL0x59J0iegmRQQ/dLrH+8UGRBAKDrdNzhewcLkkY06SEkdxi76OEb/y4okO8HGKnpw4bmn4M6Ke9DbFa6SIXLGO6icvfMp0Ass9Ok',
    'Y1zyTSHghZ8sYMP/gGe+tx5o3+pkz6tWAG8F6OwzT7vtLwsXLyhvohUgAvo2bLjR2bgRxrYbvtQPr2L0PQ0ka/yY1kA6JFCvJy8PX7PpWIHiFNbOK027dwojGl4qhikMNWYIAoqYwz4BJiKOIoW+/iHMeuxpcHPZdxDbvKbP5Q8MgBJ0vJzj',
    '+HQ8/61VQJvcnsJ/RQXwVkACqM+d//y/GZcfePlSr1JJruvp7Xp03txfulKvKQHrN81g6gOHgehs6CGLpEdQ31yQiAo5cE/VspI0/Ms2CoY5MB7Bpos0PMgREBsRYPGlNk0McVjPl07ybvAxOfB081k9c/6HOc9h6aKVkKUo3x0MJm/nIopg',
    'kxeZ9Kl48QcLnfA7t3t/5isqQIoFpp11+q1Lly5/tlTauBUgIiOEwMDg4K0+4yezjN98f4klLoMoNYNZo+8ZYt2fpdlcp21KzSauY9U3bhhjkZj8fnqzzLCGYayFNemNXcNH+hrD7v1W+78tjDEwlmEsZ39naY807Mtasjkb5FBMoSL7PrHW',
    '0Npk0cdd988BtHa7hxYSJFZDqAjWvMiU/C1e+MkLaHtthL/RMHAjWEDPffa5ayfuv+8tG8MCbmZ/gjXd62cAoLTIxGWxyOCtPx8Doz8AVBnJekn9z/uuHhNsh5ZP02oZ1QQpBGS5tN0uiDU28CUht81FfOASjhBCYQQ+Afc98jRQaXJ1AHlv',
    'oIaISrD6LyzpPVhwyyKgTaKz8zXrzN4kBUitABH9z9Jlyz+57z4TTqjVagVegJltpVIWa7t75//2jl897uNyP7R5lsRsaDSNeS9EZQKsSaj/ecl2CKAog24Z92IZKDdj4eLleOTxZ1Cv1Tkd8EyC0gnevjDIb7eaK2GY2Arbu8klXvLnbbA5',
    'lI7rvM8+4+mYSYfAZO8JTD4XRZzuG/yHx5/BylXrOCqVXNOpFHh+wRIsfPEvINXsKoZc/kBDVkpg8xgL/X4s6FzxWpn9V2QCN4LuJRGZPz35zJRjjjp8Jltb2K83Zf6WLl/Zsf++E6b71u5ggicB77zjYUStb0O8LqE190pwnA5bz9cWsxuk',
    'UO92wx3ZAjpxbVKFxn3kRZrcyNIFY9kyEBeMeclGrPtQWymgZy0uveJi/OD6L7sUs2xokuY8arAAjLGIIoXJZ/4LHrr7Ecauu7s6f+M7gkY1e4ZPMkgaUs0lsL3TVuy5mN85sCMIf5MtQOrfvRLMWr5i1d0T9t7r9Gq1aoQQ0jVcClmt1syy',
    'lWtuL1jK9naX73/nL48A4QSYIUsDzwk2A4CIXPYrG6jvb7XVQH0DSEWOw48q2e5YXIjXaXg839i8QQ2b7HLuk1OXI5WC1q1oGd0yIkfAgSewDQRhU1MTy9ZmyNElOO9RAXvc4jZ1YyIZldjGP+VFR13iUH67ADp2iJGsm5vhY2amF5cuvrK/',
    'f7CulCJ2hy2VS9TfPzD/b068fa6P/d21mpUOKxJnQzaVEK8zGFxIaSGkG5OSF1SguhocD4CEzIAhG5NdVJs2UzTeTP6/tQ7QsQd41o9UZWNg/bnY+tcxu9ZwawN3H+yIShszk5RGPjA6gUliWJ3A6MSViYE0CaWIBAjJF3jRbRf7jJ7Y3qHe',
    'VlMAL1Qx5eSTn1vT3X1dFEWCs0F4QK1W/53/cXnsP3uKQdsMCaPbYOpA/0JiPRBsvJzvu4ehVUDcl1OljGzb9YxgSc19dpezHTwKfEDoXPxrON1r15eCcYNAacS/eDhHEBK6wYwg71KYiBJSUYnAywXMu+1Ld3zdrfoiN/V6tAA+TGbx5zmL',
    'runp6VvU1FSRRAStDbp7++4tQuZ2l+dcsu4oGDoKtTUW1UXCzbbxffxpEeTQKiDpRaEaJ9hjj7i4XWte0csBdggrNdIduvPuGvJKxChus+54Bx2sehpxPmCYdeQCR5R18liwAYQsg+19JYm3myV3zwQmK78wdridNzdbAXxcT9OmTR1YtmzV',
    'R+M4JqWU6Ovb0PXkor8UNyec7M9v6e8hIoWhRZpMv1+VNp96OdQFTnpdvJ2WRPutVSnYMzdvlHQFFATrmy85swDsS6uc3uQzeArbtyJvI8+2Z7Ema+RMR7c1ov8Rl66MAFVxqVwiRaxButphl/z2PbWX7lrqwN5sjR30eFXDIYnIzJw5Ux17',
    '7BH3rFzd9W2llEgS/ftLzjqr3wNFdyVnTzeYPFmB+H2wA6DqUt8e65olGQyqrgHH6/2wZFuYl8tc3KM3m6cPDho2cxOfd9GG++uE00sDZUkVJWAfhe8pEEQbSRrxsHoCndTdl42aSrJUWRSp0nvMipnT3TvaxY6A9Le6AgDAlClTDDPLm37y',
    'wOfXdvcsH6rV5xdtpjf/ve84DERHo7rMQve7LVus66Oj6hqg1uMGpWZ75YabIAWDkTnfJhXhduqBRQg0AmgklvycXQq3Z0dekFn0+jxCwimtB0g7TlxNmTWxghlSFcU3Hrjbvm+tL73/AWfyYXcksLfFYeBIrmDGjBno6LioduppfzpfyjIP',
    'M/+zYaFa30FSKQwtihlapZO0qL4OXFvrU8CBv80KNsLe/DTpE2hYOj2LMXzH2TBJlFIFfoYfFXPJ+WdToTCooRQM2V4BbnAPjFIqAiB233XsswB/vrbwd3cvYMDH9xqvk0NtyZunTZtmfMg3qyFSAMZN8lezPBX1Xi9slwCkuBeorfXbn3CQ',
    'BqYGt8sgEHO6a1NIzaa0IVFh3x9CuMdfVtXl71O+wyvyPT+zdI8IrDsJn+t36V4Ly26POBEJQCRJsqJeT6697aZrfyR+9vWa4TYJdNod3eRvNRcQWoL29nbRsFUroXOawcGnlYn1mzG0CGAtQAIU94GHVgV749miec8AnWcdOK/RSwclpUie',
    'bMPeekHJdTpgkRv3LCQu5B0a3ET2Z1rm5RyRNb4qOrLWbqjVat/q6ek5fvToUd8lohpzxuoxXmfHVpkQ3tHRYYuTxdrdhSydeBDHffvz0DI3lUEPAdWurJOW000VkYZr+YxeN/4lnaLo2m3TRgpKW6ezVZ9bkTzWz/vsCDm6Jx8ucmH7dvaN',
    'mRn5w0RkBIQVQkghhDLGrI51fF0cx8c1NTV9aq+99uryVDi93lb9VnMBGz1S/y9xLOL1EfRQArCkVPiuR9rPv6es58/9me/Oi5zjaQjJKfPrFLbwUtHkuy4/DljdwP9nu/pZt+0KG063z1MqUuk4AK31k5r5p73r6v8zfvzoNWleBIDdms2z',
    'bywFSI/6wHFIehw7VlsLcJwJPyXYKBzGTJwNR85wefYkgqGN4fDkomgLqdxUg4hyK8HBvrzOjFiwIeha1NRUkQAQx/G6RJsHrUluuueee+6ZNs21ZHnB8xtB8NtWAWb78CfuPga6D6ivI9h6QVhMOdnCQRTARRSf52SpKF+mfPNm+J20cuCY',
    'RwmUKUE6A9pagmAQFAupiBRYSsjRu3b39Q88BuCOl15a+NsjjzxyVfpzZs6cqaZMmWLeSILf7HTwZp6TcfQ3RqH38acxuHAi6T4DkiLLwzKH+zUGeLwwgMmPAQpGNAWNmmnoNlKhL5Pf5Zdh2TOXfs6zzLd0swwhXxBR0+NRqXz3+AMPmrXo',
    'wR93BVmvNJ9ht+fk1DeAAviq1kPOPwJ9i+YjXuPbpBicTU/ME/N+nYYbagYKQIFloIK7Z7djIzJon4tfgEgyiNK9AdPJWwy7nCDmEvCQJNyf7F+aiyeeSAKhp0r6hhb69rEA4yfvjqFVFxPhWBAdTsx7MTDO5XlRzNkX5vDlQiU/vYHzjQz8',
    'Nt4YPr6VREjz1gnUA6KXAPs0MT1pBT0Fri1Az4sbil+3za/0zh0yWfN6VICRj9ZjxoKq+8HicBAmApgA8F4A7QLG7gDvAkILmEogFgSKAMggqWt9hVEMoAbQAID1YF7LwFoScjnDLAOpRRByMezQ6uHCTkPfyQKYHSYa/moP2rbnniyB2W5k',
    'xisd449vxsBgEyJTgVUKQjfDopSZd5IGJqmhXBpEHNXQlwwB8+NN+w7AToG/1hYgK8SbHJBPs4NmgC0hs9oIWON/yzgGOnmnsHc8BdjU7/JK34k3cn/nsfPYeew8dh47j53Hph//H6BRtLkS0t1jAAAAAElFTkSuQmCC'
  ].join('');

  // The same mark with its left leaf recoloured to the artwork's navy, for the
  // light theme. It is derived from the image above rather than being a second
  // piece of artwork: the leaf is the one large white shape in it, and the '4'
  // inside the blue leaf stays white in both variants. Roughly 18KB of base64,
  // and still nothing is fetched - the extension carries the artwork and
  // makes no network request.
  var LOGO_ON_LIGHT = 'data:image/png;base64,' + [
    'iVBORw0KGgoAAAANSUhEUgAAAIAAAAB1CAYAAACGYelhAAAziUlEQVR42u29eZhlVXX//Vn7nHurqgcaDKIUGtGIChjF1wk1RdOIb4yJRqPVKoMEFJyCGqMIcSgqKmL8GUV9MUocg5HQ0YgDvsw0BZEQUAFBJUKDQjVNz9013XvO3uv3x977nH1uVUM3dEM39nn6Prf6',
    'Dufee9baa33Xdw1b2H38HhwqDGM4CAEco+J2X5PfC6FrxvmazXpq+PzqMdl9oR5lx7BmDANLxVaPnXxbHwP7P4eWO0xarZdRlNfox/tO53zN8t1X7FFwjKgBDKNSskwsy4CRVQsoFi1GsleDHIaYp9EStA/oykR8624F2JVN/PkYbkGDT3cMa8bTZhYj7dfh9OW0sydj',
    'QEpQ6yxd18VlbZQ+AG5BdyvALid3FU4nY1RKluLN/Gkzz4D8rzB2GNN/CC2gBEpXoKhiDKoGIUfIUJm32wLsimb+YAQRC5SMaJuZzivJWiegHCF9ph8Laq0VJxYwimYoIBbE/1MFhIUAjD68FkAYHDKMj9nd0txGwd+KMBpA3cmbHsu8/mMo3Jvp6zsYgMI67bqOQIaI',
    'UchRRQBNcL5GQQh9GvQhf3islooRUR0fsyLCRz7yETM6Oro7Ft0WwZ86/RQ0fwti3kSf2Q8LlK6LgogYRVsqzaBOQ5inmjyioCL+QZEdHwaqqhERFyzAXzI+9j0ABoey3dZgCz5+KYZlQfDvnXgOrYGTUR2mL1tACajrIgiC8UvcCxMUEUFRBEFryQdrgCPLcoryVvry',
    'P2ZUnNmhP2ZwKBMRN/KZr+3J4ND3gP9kcOiHDA79IeNjlsGh3Rikgeo1Q0RZJpZ3zxzI+4qvkPf/Ny1zPJgFdFwXZy2Qi5KJQ1D/1kTIiKbLXmprUFkIYccTQYNDOeNjJYNDTwa+CxwCFEALuAc4mvGx5bstQSBvqhU/9USk9X5UTqA/my9dZ1XUYcSEhe2FJv6mPUtc',
    'BDSY+tkSFkducqz7BR/LnoWgZgcL/znA8iD8Mgi/BPYDLmFw6G3BEmSq+vvHSo6oQVVYJpaT1i3iPeUI2vdT8vxkYB4d20UMIJkXfhBsWN2aKEIlcFVEU82g1pp4Qwm2A7MDhf8i4DLgiYBNQs4ccOH+iwwOfZrxMSv7HSYjIyPm90PywdyPikNEeU95HAN7XE87Ox2V',
    'vem6LiIOJFd1EgUulTmXuRe4et2orH/jRY1Xuh3jAmrhDwE/BPYIws/mugqJYnyN8bETRATnXASNj35z/67u8xFzJu3sCCxgbVeETMXDcxFQCVg+/D8YeDBCdOkaLYDOCrz9Eq/BoKOd5ZTuej6WPX/7WoBa+IcmwndbEH78enlwCcczOPTdj3zkn+eJiBtRffRZAlVh',
    'RD26f9vmfXhX8TkkGyPLjqBru1hbhushvZdJauvuZRncQP13czkLyRMxQKifAJiMLshsJ+FnQfjPAn6cCH9rzh+V4DWj55z7w5EvfGHB6H6H6aPKHSzWHBHP2b+zcxStgf+hlZ+MpUVpC5QcMBV2q1Z/aslrgYL4q+uU9CmpsEGNAVIeIKqSqE5uNxdQxfmDQ08CxhKf',
    'n23jqWKEcBnj5uUMOqv3XIWI6C696k9HGBXHWyafIHnf57UvezUOxNkuRjJFmzGZkbBsFDHB/Usvl5cAOpE5gEAQvCTv9X9b2lmLGfuffCL/K4YfYjp4ZGTEyH6HweDQQuCChyB8kgjhpQy6f2V87CjZ7zBR1V1TCYY1C7y98rbyOJx8XHOzH4UtxCAIuQ/XBKFWA4mm',
    'PbJ10clLT7ynfkVrg/PbAgtYgYX4cl0HwEHIQ1EAGT3nchNM/zeAZwcBPpRzRnfwBgaHCsbH3iT7HZYFd7KLKEEov1omlpMm9sX0fZY8W0oJFGVXjOSaRGNowwYkP1JRlcSfgxpJBK81MABENPD+AhIIg4QhbLgEw+r4KQ/ez9Z+/yPAa7aD8FMlKIBjGRz6TOQJdplV',
    'T2Dy3jLzGrT/OrJ8Kd2yC64QkTzy9Z6xk9m4uPLnNdDTHr8eiR7VNDSc5QWYnQ6qKMG1D00BauG/GhgNwt+eQmoFJXgPg0N/Ez5r56aNF2vOMrEcvWYP3tz5ItL3XcieQNd2EMkQjNYL1K9imSOQT+L5sLQTP68N8+9VYQ7DKKlaSKoCESeuetAKoD5Ec4Hi/Ub4FLMD',
    'aOXoDs5icOhlQQmyndPka8ZyKfnrqRczsOdPaLffhrMFagsRH9pJJbOapREUmWUEtIepV68w2qsjShrtRXJP0pgxfKSkmqGAVW8BDt52Klhkv8MM42MKfHkbw71txhiJYn2bwaEnMz5mdWfiCEbUVCb/zd230uq7DJMdRGG7GAxGjXpHXidpeuN51zQAoiloj747rHPt',
    'TQAQkoLpeYN7oCc68JGBwToF9RZg2bYKzhd0lAwOnQIcuQNMf+9hwiX6A+C8s846qy9EBo983mA4ULnHrejn+OLL5K1/RmlhbSGR0NFgu7Vp3iVack2SNjpbiBHKJ9F9JckEKtb4QBtsUO/SVRUxojpBVt4XooBtuJBe+I7BoUOA/+lZoTv6iADzbMbH3lmxjo+kv18u',
    'JUdNP4V261z6shdR2i5CRsi6VmGYKJjE52vI2UvyfCo3Ef+YBKo3IYT8eaWhMfFcodLDS8SQRAKVbjkyk4uzt2sreyajMgMqZhvMsTA8nAH/nKD9h2slRjzwDgaH3vCI4oHFV3jhHzf9Uvrya8iyF9EtOqKaoz1puCgkrZGd1wH/dyNti1TFHLMuq5LYAK1dQ7AWkrJF',
    '4dwxwkhAogZ7P86ozPjvKlvpT2Mt3zX3vgN44cNg+uc6Ih9wDoNDT5eVVz/MeCBw+cuXlLxp+nhMfiHweOxMFzRXXEMoUcCCoqqoU3AuVOloXbShPX6+F7g1gJ7OTvpEs6/aLBQIL09CzaA/cgcAS706POAFTFD/E4CP7kDQtzVWSIEFwFdVVWS/w+RhsUIR7I2K4/jp',
    'M2j3fxXXzXDdAsipUrbaSMRIwuOLukTg2vTzqUKkdjUp6aoAo4uCTVwGNNGli4mi8D2c1nkCp7+KLOBWKYDsd5gE1P8JYFES9j0SRxasz4sZHHpXIIl27HeJYO+YlfM5buI8sv7TKCe64BRRQypYHN4SuPC3f0xUk/VdgzlJLICm3r2KEiRYDg1c6OyYX9GmZQjvk6ow',
    'JAJEESxkqr+JIeADK0As1xocej5wFPef3n04lcACZzA4dMAOdQWR3HnTmv3IF10q+bzX093QQV0GCE6lceXVhZVe3yQoRm3mtXIRVSxYKUGdyo2uIxW1pB+XRBWzeeQ6VawhzFSnGV3nrLjbAbhl6yqCIrr4ZHjtzsDHx4UyD/iiqhJcwQ5C+qsOwQxcickP1e76Dmju',
    'QzknlT2OthlFo/BdrQyqiuACqVcjdW3UaNaKIMEiIDUiSNPDjeSPpCi9iRuiQqmiYjKDutVI+04ATn8gBfCr3zE49FJgCQ8+y7cjXcFLGRw6ZrvnC0aC8I9ZfwSt+Zeh+lS6mztAjlNBrWiVn7KgFlELztarHwfOos5V4E/D49UqF3+rlikqWqH4CnomNGCT+pE5loak',
    'zKDGmELUS07u5EzZ4H2EPKAFiJ966k7KvkeLdEZIR+t2IYgWX5EzKiVHrR2G/Ee47l7Y6S7qWqiTeqV6AcebuqAE6oJSRMTmEnDoAgB0CRUYVq86cKreYsx+PqWKVZpLPqpDbz1gJIgUnIexcgugnF/L3TzA6n8JcMRO4vu3xBI+EXgH42MupI4fotlfUnLMur8h7ztf',
    'KFrYosRpniJ4NAVwrnK2WmGABOknwpcEJ4jWIDEl+itMH4mgNI8rOkfII42cQU0WyqwoQo3eGPy/bG0y6BSaRcc72xG/298xOPQYwD44K6BSETzHbjiV9h6fx3VK1TIofgLWgtCiOU9LFSRiABfJmkampq7v8DBdJH5XTRSkIbFEISq/rg1fL41SsaR2ICqL4td/CZTF',
    'LwG4tf4gs0XSZ3DoQODPwimyndgNWOCxwMmMj6nsd5jZZuEP4wmeo9aMkM/7hJQbuh5iuKxeYK42+5rccNXftY+PClJbhiBkUZ8gCHhPUXVSFeoE5C/VeyN5VJ+rGRIqjShQqACjaIouTS6FXQv9PwtJIHd/FiAq2En4vPzO3rUTscA7GRzaG3BbbwWS6p2j155Be+Hp',
    'lJu6issCTvfCtUUtbDyoq0x/muGRJMWnUTFq0x8oweAawnnCqlV1dQaQEPtHEKepNfCv9bomDTpZ0oxzIIhExZEJqNzMP8maSAHPqQCqKmH17wG8cSvdxM5kBd4erEC2LcKXY9d9ir5Fp2E3dsFmDdNsC9AyALsyUYTemuwe9xB5gPB/rbkCDbdaYSqmrokHKqyRZAHr',
    'NHHAGI7ZRFAkiJx6ZOwl+NMQ/mW9Fy9l/eKTRwKPCxd2VyjPjlbgxE9985vzZeXV5f1bgWTlH7PuHzVf+D4p1ndRm0ukdbWEslOtYly68r1gq1WOrYCdX7k1itfq/wH8JdZAqltQEufC68Mq7wGelVWoQKirEkwVKI0NJC5hpC0o7r+2dOHmCv2WMnevyc6sAA544vtP',
    'PeeVgRzKtgz4rsyC8D9Be4/3U6wrVMs8pvDVFVBMh5Xvaj+Pm32ryB6LNqxDNPE1dqgsA5qEg64WZPD5lcKl7qLKH7g5WMTIM0SlSwgER66dcgLJrwsXwPWmWSvzLyKWwaEFgfiRnRj83R93cQJwXu8PrUO9KzOWLyk5evUZ9C06lWJtlzgpRfAmv5gOiL5ZUUsssTZS',
    '5VZ9aO4VR1Qq3xvr8rRq3TbBUktS5h3/ljpljKBO6p4AdVVrd0wGxzoCCefROnL0elq5DHHkWYa1/8M/ye98mbHMrQABPVvgRcA+j2DW76GwgwosZnDoYMbHbqmKWHrp3Tet+XtaC0+ju64Lzod5RrzJ70yFKhyJNCqN7gwRnwNSW2XiNFUOsqorI5ZxiQhqnKd4Izo3',
    'oZ5GQvo4Ur4oiM8xVUUdri4EkVglEgpHRAQRA+LASZMqVpQWiLU/0dr/l3MqQIL+X5GYil1JAeL3FaCfwSGZk9s/ZvUptBZ+nGJjgbgM63zcVExDZ7JBuKr0JF8k5te1Yt7qKn2pa6QwdeW+SLXqNW3mdwaMS6L66s2ePo7vDUkACdrjq8wMsYAkvKG2d41KIDVSOlU1',
    'l/fG/3NhADvsK36O3EXQf6/wJWj3UsbHbgCkWv1R+MeuOlkG9vwk5eYCccbbWqA7AdPrPadPYOm0x+9LSPbQJIAk8fk+jvfRQtO/24RD6MEPzobUbQIwezOKEQOE3D4NnkCrHkFNXgfqMHmuRfk7ynX/3Rv/NxRgZGTEMD6my66590nA03oswq4k/GHGx75XUdkNs3/v',
    'a8jnf06LTaVgw7QNqYXvguCcrYUckbskwI4ajEkQrqr1ef4I4lyaJwjncE2hVs855z/TOXClv9emglQKpHX+v44CUtCYDJBQdZIZBb2Gsx83UTWt9Bw5wOg5l0dhPxto72SZvwcCfeCbSIYZH/t+o2A00rtvWrkEM/9bQteqdkWjve5MwNS6xCz77Jw672eNEYwxSeJF',
    '0kyLT8w4h9W0lk8aLb5StXh54kakLhYWHIqpTXbgaHzTdp3p0YDn6vMHpC8RM0Q3Y2Iu2dPNFsG6HwNVBdCWXEB88jk9F3ZnF74DzFuXvuzoIPxWJfxh9Wj/qLuOJNvjAqTsV1f4oWqSQXcjTKxKVld6XyKUuG5BuX6acsOMlBtmpFw/4/+/fppy/RTl+insdNmgg6vz',
    'ELKC0aRjK2uBs0gVFvpMYoM5VDu7qKQKB20ghzQJQaMFiJ+tipLTmdqIcZcEAmhORjfvEfiBu1C454Ds6Y+b9/YvffYj/xGEX3jhn+/j/ONW7o9ZcD7GLcQWpUdnBp3ZAJtX0qyKN5E/w2QGN13y+H36OXrJIE7rMCxk3cQimmeGn62Y4tKfbsS0Mu+KpUL3UmfkTRXu',
    'VYSgMd6fi/FVW07qli4X+8cCeDT+HKIx6vCgT6IlcWmJiENVHK0FGd2pKzl7wb2MqGELU1dyAFl5tQ01pU/dRQCgPfuMd+envH/01F//bOyfr7jiinzJkiVe+CMjhtGlluHrF2H6l5Hne0mxuVA0Qwx0NsDmu0OtnCZXzuuUyQxaKIsWZFzwoafzggMWyhyRUpWJPOeS',
    '+7j0v1Zh2gMBGwiKQ5zxsYMxgcNPo4b67zqN6xVHY+mXJDdnqh6BWpESV6FpD6BJC4y+E7TcbIkXMYGN5Mwvnb8HMLgLAMDy1He8IX/Hm085c2L1zZ8cGRnJlyxZUlYsH6fDyy/sY8EBy2jNfx52oquQIRl0NsKG3ybm0iZsXolgkaLAuC7f/uCBvOCAhTLTtXQLfytK',
    'V92mO5bSIhsnk0SRcw2zruoQF4Cl2iRqiPUAgQJOog7REo3UcgUUtwAonUWca9DCqFWc5sxs3kiXS3w185YTehXaOHX08/sAe+3kK7/81AdPys/80IfPy1lx2uLFI/no6KitKV58Be/jX3gOfQtfhp3ooOSYDDqbYf3t4LqIK8GV4YKHC4+SqcVOdTjnb58hf3bIntIt',
    'He1cyDN/ywQy42/+MRBRib5ZqSuE0PAZztb3lbBj/iAooUvwQcAA2oMpNFEqTfITWilGpQRW83miZfcyvhHMP1sesJEnBZX7hPSv7qQWwAL5yMfPuvr84ccfd8tBJ5sgfP/jRsII9ePWfZD+vY6lWNcB54Xf3QzrfuVpXjHeVAcyRXFghCwzlJu6nHnywXL8kftSlJbc',
    'SOULXSTwMLjEmsbwrRGGVaxeRPZpsZ6py1gCS1iVb8XyDzUJ+sdjADUVZezJIYeIqTCBRMJIM6FboM59C4Arr9yi+e9lAh+b/NZsJxR+9qcv+eNfXLTs7Ne+8Tuma5clVcqL1dfxHbf6aPoWfIxywjdskInYDrr6l1DOgGR+tTVwr9DKMoqNXd51zAHygdftT7ewZGEa',
    'h5NGuhzXg6WcteAKcGUFxiLHr3GGT5VTiCW/od4/5A8i41jlEoRmLsIa0rFxcUSw5wSMz004AWOU0rborvsdj3nCxQAsP9w+UBYt/sQ9d9IQMAbAmy5advZr88zcZ53LIEwbj735J659Mf2LvgKlRawRjOBKdNWN0N0YSJqiCs286S3JM0exfjOvf8V+ctZJz6AoLZmZ',
    'Hfb7tOucs1y8iXa1OZfgy1Fb++8q/Ctnmf6qsDRJG1e1BK7+rvF5jdYmYgEbsondwuIMKvodzpYJFl+R35/570X7AztpuKeAee4z/vDNxshtL/nQh3NilVKcu3fSffuSLTgPQx+UrgLWq26CqdWBOClqdi8AsTwXyo2TDD3/8Xzj7w5R6xxGUo49cYhzTeOKVL8mPr+K',
    '671v1kTholJo4AFEPQMoKVWcVBl7a5VQyFWBiFag0D+n0O2iM1M5xXRJJl/3Tn31Ay7m1AX07ax+H3jfDZd/6z9CuFcj/lvxxZzZom+St58onc2FuoD4V/3ch3tZK+T1QxYvhEtZnlNOzvD0P1rEstNfSF/LSFlajJFGgUG9gGbNb6wxQLVatVYWNSFaEw/4iCnkkLMP',
    '4WAMEWNo6EO7aG0Snk59NtHH/S4w2QYlA1tCt7C05rew3Ss59yk3wohh2dIHLOcz91McsrMI/6uMj32awaFE+AH0LRPL0194Nu32kRQzXUUy8jasuRXW/xoyg2hRo2lXgpZkothOh8fu3c9/fvwwedyefRJBH4FKdyn9m3Z9m6YLcJWJdnVU4VzIKxRV04gmYR2JJehF',
    '+ySl5TorF+Aqq1CNlrPWp7Cd9Urn9GseFx2+VfJMLcDUTub3M+A24F0MDmV6z1W2Ms0jAfS9efO7GBg4ka7timquph/W/RpW3QB5O8TUVdsEimBE0HKGPsn5j4++hAP/cIEWhZUsk8Dk9UxWCQMdGt+s4f4DCNTSf0YIF1SEBpQXRcVU4/8k+o9IHoXhgb6yJ9B7YmqY',
    'Vs0NdKGuA+hapNv1QUQ2kFNsXukG5PtbA/7mWvUzOwkJFD1vB3gj42OToRBCK9A3KiUnbDqM9sCn6doSLTM1bZgYh7uv8tctjZcjJy/e37pul69/+CUc9szHetCX1SM9TKjwrVq0GjUBsyGyWjvL94uWAQyW1WqXaAlc2Uj3SrACVaNI1Vbm/X1MBTdwgSoUXaQzGb+Q',
    'JZ8vCP/Kt562aWvA35z1ADtTyAe8k/GxnzY2lBhRwzIcb1qzH30D/4ZIhisRzYXOBPz2UqAImbF44YtKQLkBO9nl0+95MW9Ysr8UhZXMiO/HC2pvVer4PK7QnkKbdJk4V5tpCQSP4hBsZcK9qS9RDRFAFYXUNYQN4afVxMn5/aURpCjQzlScMaCQ51JObkbLswFh+eFb',
    'PW09VYB1O5Hf/xLjY18JqV3bAH2cLvTP+yZ5vh/OlZAZxcFdF0NnHSJZXcwZ2DnBkudKsX4T7z3+EHnv8MFSrXxohHdSdfHUM3iouZ3ZvsomEQB2VhhHUIZoAVLGr5ntqyMHXK+/dxUI1O4MOjOR1iNYWvONavc8vnvwXQxrqA/begWIpmLNIwwGo9//xckfOO3d0e/P',
    'An0nnjLKwIAfse40Q3K4ezlsvh3JWqgrAhCzFZjKMqFYu5HXvvwA+fTbXkBpA9GTIHpTrXCZ7fcTH+C9sumpvy+TuD5WCJc9uYam2U+f04Trn6sDKeYR6EwjMxNUbem+hzyTcrJDac4CFQ7aNh7HjJx4RHzDquB3H4lewHiFZ4BjPv/uV3Tm9vvrXkX/vA9J4QpUc7KW',
    'sObnyOrrkbwvVOa4qrQLHHkro9w0KS947hPk6x96GdZ6us4EPTfGYIwJlVXNVa+NIQxSaanrHe6X4gytewTUlYgr6ji+t60s4f6jdWhWGYXHAOlMoZ2J0IBazSCy2pqfqet+nR8cfAvDy8y2bg1vTj/9dAUY+cBJ64CNj7Df/yDjYzc2TP+IGs7Hcfz4Y2kv/CIOp84J',
    'eS4yMQ6/uxw1WWUSVX3dnjqHMVBOTMhTn/IYvnPmK1kwkKOqGBFc6Ml3znk/LpDnWUOw0iP8Oc1WFL7zAE/THoGwurVR9JGWhJUN6+Ezh2WlROpCDeD0ZrQzlShcKPlRzSmmZjDFP/nVP7zNC9dIYL5G3/39SaimSOsj4PcvZnzsM02/H6yuiErf3l+gnQ9SlhZyI91J',
    '1Tu+r2inIkrqyhwvfDczI49ZmPPdT76KJzx2PqWtiZ4Y4sVuLWMMy6/9Fc6lxE86o5e5Z/RYK6TZvUqAXqBUad6a9tVK6K4nW5gwiOp8jD+1EbrTVfdPNTpGrdVsvsF2zud7L7ztwaz+CgPovn+SwTIL3DJ3tLvDef61wPEionrPVXXXZTD95vjJt5O3ljLjujjJRIEV',
    'P4LpcR8ra5m0SYVb2SGzXb718dfwx0/5A5/dywSM8bYmOLqytGR5xqe+8mMd/f8u0DzP1GlPY/0c++3Vo/fTcrISoQj+v6yUQhrKaSuM4l/T028YzX/ZRabX+yRWvFTVngLO+347OUmmH32wqx9m1wTe9AgAPwOcxvjYuO77J3m1YVTk+Y9dc6DL25/SjrM4m0mWofdc',
    'g669Ecn6gwlNSq0FMnFiJ6bkix95JS8/9El0i5JMBOcSEGcMTpV2X4sfXn69nvL+z7BoQTuQO7oVVlCa6eCemN8btlAjEKODJAlFlRSqlcNbBvUNKjPrwXWrZFOzVdw5soFMXfdsfvDi3zzY1Z8ygfHH/vphJIOi6b+E8bFzqhH08bg12GCz4EuYfD7dsqDVyth4J6y8',
    'DMn7/YURfBdsiNtbRik2T/Kx972Ct/zls+kWJXncGkm9zzfGYMuSVivnhltW6NF/82lQi0mvYTWAV5qxf49u+BFMYRVXDZoulIZVo3jCa0Pjh4bmDtdsKxcxaHcaKafB5Pj9PJLybyyoODWtTMqJe7Ut/+g5/1setMvuYbb5ZRKO7UgcECmVDcBJDA6J3nNV/XlxPNtx',
    'kyfT1zfEjC0gz6Q7CXd+H7QIl97WwxRQ8kwo1m3gbce8iA8e/6Jg9k2duAkAqiwtrTzntyvX8dq3/h82TSv0z8OVReL+tYkV4r0ku3AAzjXRe50XcLXfT7KF6pJO4iQfoGphZqO/9TaUNNxHqZi2UewIP1yyhuGDpUqNP1gFiBd/5MQTbgfufhiAYDT9f8v42J0BjNam',
    'f7mUHLPymZj2GRSuBDUiwF3/Pzq9EqRVkSQRXeeZoVy/iVe+4jl8/n2voCwdmcTMnsEErt06vxnThk1TvPbEM/SuO8bpn9cGFfJWK1n99UYNlQFozGpruoBI8Woj1+8qYOiJorJyDVUIKHiwOLUGupuqFrCKEKpmCyngnJpWS8pNN7F2r695N7n0IeE1U8Xbg0NmdPT4',
    'mQQH6A40/RlwBeNjX+/ZO9izfc/9Ugu36Bwkn09RKlkurLkeXfs/iGkhrkgmZCqZgXLDBp53yBPl3I++RvIA4E2chW1qWyciWOt4/Ukjev3V15EvaFMU3tfGMLB3P57GBk69O3glLJ5qUg+YrnhqHiDyE4r1ylVOw+Rqfx/be9UmRZ51DSH4WQJGi7/jhucV3LrsIXM2',
    'c6WDr96BChDPWQLvld7tMoYD8Hvq695L38ChdDpdTDtj6l707gshxPu1eVSyPMNOTLL//n8g3z3rGPaY36Z0DiMhRq9a9R1WHXme6dtP+4Je/MPltB6zCNudqUCb9EzfTCb3gEjNFiaXzTUEFgTcQ/ioi+cPLGAYGklnIzq5CmwnCL8eJj172oi1mvW3KCfPtZe9+lLf',
    '+7D0IedvzBzCuTLcZzvI9GfAFxgf+7nu+yezEz3DK59MPv9DFF0LmqEl/PYCKDf5NugoEOcwotiZaR6z13wu+Nxf88R99qAoLcbUZp/A3JXW0cpz/djnzuOrX/0+rccNUpaRxCl9uKVlmgeuGjnqXEEssHXVY86Wc7J7VaWvs0lyJ/QdugIm7vNmP84RrIDkHI2hOKeS',
    'ZXSnVmkn+ztQeSjAb04FCPE3IyPH3AyM7wBKOPr9lcAog0MmfmaN+kXJ+j9Bq28BtuvI+oVVy2HTrxDTF+LrME7VGLAlbUrO+6dj5FkHPI6isLRMNsvsl6Wl3cr5xrJL+PA/fIl80XzKsgyAPg6CmiEL9EfMBEoP8nfqaiIpAkNrpTL5tvDVOYGXqKd7WdT6qiTKGXTT',
    'PdBZ38gTxImi0jtsOtb6S2aMK9/HT157H8PLzEMBfnMqQMAB2ehb3zoFXEW9ufP2Rv6nMD62wX9kwvUvE8vwfX8u+cBSZjaWSCtj852w6nLI+qimbqtFRMlQ3EyHfznjGF72wj/ysX7WpHhxYJ2j3W5xyfLrOfHkj2L6MpztemXCNca4mZ79FetvXft/V+cm6yggFoW4',
    'AnVdH79r0hMQ28un18DmccR2Pc4M70tHy6j2Dp62VqWvJd3NP3RXH3Xu9jL9WyoDi7bue1tOgD4k4Hc142PnNoFfyGC9/No9MO3PxZWAnYF7fuDvq0oZz89nBsr1G/jEKX/JsX9xiBRFCPfSFWsMhfOx/k233s4bTjhNS2vBKM4WiJZVCOnb+TLfCUyYrds7hVvn3ovH',
    'OqcVlUu6mrvgOh4All2YuBem1lZrShot6DUV7OsIQoSjhSoYsTMb1MrJ29P0z60AQSiHPnPgkhCjb28+YGTWNmnDeBZrwZPeR3vhUygmC0y/YfU1MPm/HvWHQgpByXNDuW4Db3/Lyzj1hMOlKMqqhj+GfAi4EOuPr1rHXx3396zbMIHp7/MVPOnQJuryrFZMBvVUgM+F',
    '/qXWAPFm3yWz/Gw96r2zEZ24G+1MVkCvmiWczgusIgebKIRzSCtTV76T/z7+zu1p+rdkAZTBoezaiy9eB1y0ndxAXP0XMT52ue47R4XPX67YH9P3HjrrLVmeyfTvYM1VkLVQgj/FkbWEYu16XvmK5/L5014jPq8fwF40ybgqnz8xOc3S4z/A7bfdqfmC+Vhrk9BNZ4Vb',
    'oUagub+f1F29pjHjPXEXYsQrVYFqEfgCi0yvhem1nvbF1bR1UvRZjZxVDWPiKtdRiulrUUx8nWvf+m8sHsm3p+nfkgJw/mevAuBT7z/mG9CoTX6wR5ze8fezwr4K+GUfJe9fiCudKMJ9lyJuyssiZM4yI5QbNvLCQ58m5/7jm0Rw1Wbb4KoiDVVFsowsMxz3jg9zzRVX',
    'a9+e81FryfOcLMvI8hxjMjIjZKIYcWSVS0gigJ5f4XA1t5DQAFlmyIwfKJELZN2N5JMrMXYSY7LA9DbHv9VzA10yaDqmgUurSJti4ueY7js8OXb6DinZm7Ud69Kl4owxvP9v33olg0N3AU/iwQ+Mitu9/QfjYz/V1PfHHv5X3noo0n4jM6tL8gVG1/0MNt8GIdGjwefb',
    'TRvY/0mPk+9+7i0+1g9l3K4CanFGD5QzHd7yrtP57je/DQv2prN6lefWTSuEclLVUqKOMsth42o6nRlp4Ii5SsBCpBANwcTkBHbNvVi6UBR+6kjZqenirAULFwFZmBbgqIZ9xBNJ7BoWVK1iMiNabtLMHs21H5zm2k0GRvVhUQAf2djcGJlW+DfgtAepAHFvoW4I+5qX',
    'M6YvpT2KZBnOFMysMqy6OJRXlx6FZjmu02WvvebznS+8ncHH7kFRlmTG1DnrJDLL84yrf/Iz7rlnnFcd9ToKG6t8DJgcMVm1nZOzJWoL8tzXVbzwuc9s1gGGkxqRKPZgHOruoef/8ZNZ9eoX0WobXGczxuSYvM+/RkvWbphg7IYVaBbBRRj2FLyNnwkYR7v4aVECLaOd',
    'v7bXjdzK4pGc5aM7bI/EOVH+yMiIGR0dde/+0JkHnvXVH91EnUF/MKv/24yPHdVA/jHse/WNfybmsRdqOV2SzzPc+yNY99+Q9/viB2MQNWQKP/qXd3LkoU+VblHWiD/xY73IKCL6rWAlU75DXBzRFsM/pVaAXtegfprI/X3GeT+4jjee+CnyPRf4XVsl85lACdk+yTzD',
    'KTmIKckXtMV1Puh+/tEzdrTwt2QBGB0ddQwOmbM+duovGRy6Engp2z44Khacfmb26g+FVq51mopFJFOduAM23AzZQBVsS9HBTk7ylS+8S4489KnMJfzIMKWFnAZDWZZzshCxylurmYsCTsNYwLiyNc0AJctFamUL57PWJoMetcKO1ir9/S3+/QfXBKAiyf5CPXu7+Li/',
    'IBvoo5g61918RhT+Di/VN1vx3JcfxOqPQ6avYnzMbzObrv5Rcbzy50eoaf8JxaZS7VQmq68ENx3oT8/02Ykp/uEDr5fjXvV8iqKk3TL3m6WIQNDhc/5Gws0YJBR/ZvE+C88hmMxgjBFpJP4lDlvxxaJBsq6qpfOfmImEz/L3WSsnywz9/S3uXb2Rq667GdqBoJKEWqkK',
    'SRXv77I+ismrdNM9J8JwFoSvj5wC+O1ZDeNj3wd+QT2WfVtcyz/OcjUHhU1unfsgzgoYZeOtML0CxCDaxWSK27yRY486XD78zr+g6PpY37mesyW7ZIhIQOnNb2GSfXfnBHZCsws4dSs9oaA2uoNMDDpDSjWaI4fzb9Tl1/6CdeP3krXbPsQTrSa41vsK2BIxbVz3p2om',
    'X81d35iBgx62Qd3368Cu+NY/GHyp+Ce2wQrE1X8j42MXMTgkDeQ/Ko6X/+QwJDuCYrKk3Jyx/rpGkYUAlB15zjMGkwUpcxPLCSSPczxTK9H7/4YCxX6AOThPl5r/qlycyoe4akJoM1Kup3bDhVf8HNGsOk0c41JvCkEQfnGbWv0Lbv7iehjZ7mTPg1aAJUuWlEGA38E3',
    'am6LFfjSFnGD1RPD8Cpl441Q3AeSVcjYXy1Dp1Pcv42ppmMlitNYO9p8vczGgVV4o71VMjR8f0+GIKGINe0TUBHRVitn4+Yprrz2RnReX+ggToZI+fyBBdqU3bu1230Fv/rsShjOHk7hP6ACBCuQBSvwD1thBeL+QquAb4dSr4T1W2pZctnTEXkN5ZSjWGdk402IaTVy',
    '4IGq1TyTOcqXegSjmhiPMD5dtGfER4IR5hRg86UuJoY0reerp3I2tKoGnuo9gH/Pf13/S367Ypys3ap3B8PW7VwiLVzxG5XySH7z5du98Jc97P2ZD6gAwQoYxsfO2wosEB8/L2T8sirjd2u4xBknYdrzUC3ZeLNoublKs/lO20jNFqBObWjcsNZR2PrveHOqOKtY53A2',
    '3tQ3fMTXWPXvd2X4v8Nai3WKdVr9v+oJiGFfVQmk1SCHZgqV6vt0y5KytFX08cNLr4eyREzP9m24EpO3cPY3KsX/y6+/+muGHxnhbzEMnAsLhOEMZwLn3s9Lo7k/vxlfq7BMLC/41z2w5ethWinWZ7L5V6GrxybbodXTtBbMHyAzhqyv/bBdEGdd4kskWfHaxAc+4Ygx',
    'OXPwCVxyzY3QP+DrAKqdHikxrTau/F/N5E+57dwVMJyxbNkj1pm9VQqQWIF/Z3DoPcDz5vDv0Z3eOnLiEdeNnlNnF/0uHZQM7PFXmP79cLaQzb/K1E2BtCroVnEvTqFvHrffeTfXXHcznZmOqp/gjJiwN5bEfZHCdqt1XUOCx7TmBxTxiZf6eZdsDlV2O/qEJ+wrzz74',
    'AGz1nsTka49KB1vwX9fdzPjKtdpqt33TaWb41W13cftv/hfJ5/mKIZ8/KMn626i9Vk35Om5bds8jZfYfkAmc86h3Ej8cuGIOBYjM3yjjY6c3pnbHPVIOu+BqWoteTHdtIfddnKHdZMo2VVZM1KKdNX64ozooC98mlUYDcS6v1L682cGjzYweyZiXaup2CLXzHNat5sR3',
    'ncCXz/qwTzFnpifSqKMGB1jraLVyFr/qb7jqwmuUx+zt6/xt6AiaPy8wfJkimZV8Xht133f97mhuXTaxMwh/qy1AVSvgleBKBocuxO8skipB3Nb9ew1LOTLi8/2HfftAhOdhp5xM/NKonQDT8tmvUOtXpWln7oXOJiRveQ6/1V/tjqWNeF1mx/O9zRvSs8mu1j45upws',
    'zynLRSxYuGBOjkATT+B6CMKBgQHNFs0jW9jGe49+NOAWv6mbimSttrru13TFM9/iUf6IgdGdYiBHvo2v10Drvi/Qw62G04ZbGT/iJgaT3TquPDzEteY1ZANtZlYVTN6eEZIlYSv2enuW6XvRYgIxfqhjU1RhvpbevwGL76mCtzhXH+rZ/cmWLhI6hmp3n7gO2dKnBJbQ',
    'OWxZQNHFaRprmlJM3gasUJzqVlzwSfhOIA0e3lDvIUUBPVbA+/nxsV8Cn04igviDfhx+XO0alh9uGT4/w5bD2A5svl20nEg2Xq733WNqpZ/jH6lSpdp2vSJYqh0x4p+Rf9cmH5A6l/AajXvtqpsjrpeeUeA9m0P0XLCK0E1mBAWXoiJSSN5qC3q3wb7M3XHBJ/2qb3JT',
    'u54CEKqHB4dMYAdX9OCAi5uQecTnOe9a+0ysPJOZ+xzTKwySBQyX1MFPrYRiA41qnGRvHNHmdq11Ra8m2CH5aK0ncsfuGglKpDS3Wfe8Q1mXcYnMOR8wzTpqgyOqOnkcasFkfai7pJ3xEnvXhVfA4jwsjJ1uI45tVoAQ1wvjYxPA2xMudBVwXaUkAIvD+Z38OaaVM7Wi',
    'FLs5rEpXT72cWoUWG3y8HUuiw9aqkuyZWzdK+gIKwYXmS60sgIbSKq839Qyexvat1G3k1cbOzlaNnHF0Wy/6n3PpZi3I+30qVyQXLZFyetTd9aM/nbnjh7/1YG95yU56PLhyLw8Ic8bHLgI+F84zxvjYZgaHavJn+emWxYtzRF+Lm0CmfxvaY8MGTSgyfR/aXV9jgaRc',
    'SrW5R69UpRyaNGzWJp5k5626375u7kzPVSlKwj6a0FNgRLaQNNJZUKMsOv7LtgbaWbt/RStv/6m954rT/TtGzM6A9Le/AvhVbhkcykZOPOED+IbSW5s2M5j/DUNPR+RZTP/OUW72W7Y46/3x9H0ws84PSq32ym3ug1MNRtZ6m1TS7dQTi5BoBPQSS2HOrqTbs1MXZDa9',
    'vs6RcCLUA8SOE19T5mw3x07l/bl+6Sl/8MQXdH576WXe5ON2JrC33RUgrvLQUHoscHkD5ETzny8akizPZWpFqfhmSUSQzlp0ZjUqrmdCRnNj5MZ2bbGcKrgKnbWHbtqwSYUvIvBTerZ8jxm6Rr446HDSKFJnDk1gqVyZ57kBWns/Zs9fgP75zO0/ftttN3x5zc5u8reb',
    'AiSuQBgfu5LxseVJpAD7HByuZt8SOhvQmdVhg0NFuhtgZnVY+TqrSlZjS7T386rOaj31MxF43G49URRpwLQa+MW9eVSbSL+R7jGJdRepcv0mpqEMJZkxxphWURT3TExMnfydr5/5fJn4xYVWh0PZ3M5t8revAniB68jIiOkp+xKWLbU89eV9ouX/w9QK0NIgBuluRKdW',
    '1uAr3Q07EbBGMlfrGr04KCkieXG18DWdn59s8Z4CP+IY2MQ99LiJ6r+xzMs7ImeNLzJsOec2zczMfHbdunXPXbhw/hdEZEa1YvWUXezIt8dJRkd7fd2IwKjSfuEfaXfjk5j6nZ/KUE7BdNirD1PlAOImzPVuWpXEpZqsTnN6pxLGwlTAsLb+ItrYvSW+KraW1TUEWvEE',
    'vjGz6gFUEXEGIxgf5lpr77Vqv+VKd/bAwMAd4ftkfrDFrrXqt7sCzDoWY1iOI+MQuutblFMFaCaV8MWv0HQyZ4WzUolXHE9PSB6bdzQpItGq1lJTI5/QvpoiumpXP+e3XVGrxhgLSJ638jgOoCzLn5WqX9uwtvPv++678L4oeMCJyC4r+B2rAPHoTDyHYp1nx2ZWg3Yr',
    '4de7ryYTuUWr/XUqXF49STK0UROypinaRio3alBFBWuVlwpxvkPFoVYoZ1oDA/0ZQLfbXVuU9nJni69fdNFFFy1d6luyguD10SD4HasAy4NL6K55NuVG6KwVXKchLJWabKnjdKkZvmpLBNW6Wb+Wr1bbpAfELzX3X9G/0YfUw75U1TnBKEKuJstFcjTLyBY+Zs3GzRPX',
    'AhfcccftPzrooINWxp9zxRVX5Icffrh9NAn+/rMpD/2cyrM+NZ8N193I5O37S7nRIlncoEpiYaUmq1oSaBbFHNL4deCZNGrG0G2uQl8Vr18oTiNz6U16Vm/p5hST/dq0Bq5rtfsu3Pcpf3Tlisu/sqo6h1/tBFOvPEqPHaAAoar1gGMPZOOKW+neF9qkFK2mJ9bpPI37',
    'uAcxaUMBJLEM0nD36ndspIL2tfgNIpkiEvcGjJO3FHe3YG4SuCoTLi2e1L6JG24oEqFHJX1UC/3hsQD7Lt6bqZUniHAIIs8Q1ccr7OPzvDRz9o05fLVQJUxvCH48lIMEregd3yompXk7gqxD5A5wN4rKz5yRn6Mzt7HuN5uaX3c4rPRlO2WyZldUgLmPRc/eE5n+QxzP',
    'QNgf2A/08SB7oewNuhfCAlTaiBpBWkCWJHWdiJT4ZtMZkAlgPaqrFVaLye5W7O+QfAUmuxM3de9sYUfuY7GB5Wmi4ff2kB177sUZLN+6IRP7PnceE5MDtGw/Ls8x5Twc7cq8S2axxQx97Um6rRk2FlNwa3frvgPsFvgjbQGqQrzFCfu4PCX7HwKbOSxwX/gt+ygs093C',
    '3vkUYGu/y9Y0n8z19+5j97H72H3sPnYfu4+tP/4v3XIclQRpMaYAAAAASUVORK5CYII='
  ].join('');


  // The full lockup - the two leaves with the OLIVER 4 wordmark under them -
  // supplied at v2.3.2 for the About popover. The header keeps the mark on its
  // own: the wordmark needs vertical room the 46px header does not have.
  //
  // Same treatment as the mark above and for the same reasons: the supplied
  // artwork is a 645x693 PNG, so it is trimmed to its own alpha bounds, padded
  // to a common 206x220 box so both variants sit identically, resampled to
  // 220px tall and quantised to 256 colours before being inlined as a
  // data URI. 220px is four times the 52px About draws it at, so it holds to
  // 3x DPI; quantising takes the pair from 104KB of base64 to 17KB, and the
  // banding it introduces in the blue gradient is not resolvable at 52px.
  // The originals and the resampled pair are in `logo-source/` if the artwork
  // ever needs regenerating at another size. Nothing reads them at runtime -
  // the extension makes no network request at all.
  //
  // ON_LIGHT has the near-black navy leaf and wordmark and is the one the
  // light panel uses; ON_DARK has the white leaf and wordmark. Neither works
  // on the other's background - the navy leaf disappears against the dark
  // panel and the white one against the light - so the pair is not optional.
  var LOGO_FULL_W = 206;
  var LOGO_FULL_H = 220;

  var LOGO_FULL_ON_LIGHT = 'data:image/png;base64,' + [
    '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'
  ].join('');

  var LOGO_FULL_ON_DARK = 'data:image/png;base64,' + [
    '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'
  ].join('');

  function logo(doc, size) {
    var px = String(size || 38);
    var s = doc.createElementNS(SVG_NS, 'svg');
    s.setAttribute('viewBox', '0 0 32 32');
    s.setAttribute('width', px);
    s.setAttribute('height', px);
    s.setAttribute('role', 'img');
    s.setAttribute('aria-label', 'Oliver 4 D365 Toolkit');
    // No border radius: the artwork is transparent rather than a filled tile,
    // and rounding the box would clip the tips of the leaves.
    style(s, { flex: 'none', display: 'block' });

    var img = doc.createElementNS(SVG_NS, 'image');
    img.setAttribute('x', '0');
    img.setAttribute('y', '1.3643');
    img.setAttribute('width', '32');
    img.setAttribute('height', '29.2713');
    img.setAttribute('preserveAspectRatio', 'none');
    function paint(name) {
      var uri = name === 'dark' ? LOGO_ON_DARK : LOGO_ON_LIGHT;
      // href is the standard attribute; xlink:href is set alongside it because
      // it is what some older renderers still look for.
      img.setAttribute('href', uri);
      img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', uri);
    }
    paint(DEFAULT_THEME);
    s.setTheme = paint;
    s.appendChild(img);
    return s;
  }

  // The same artwork handling as logo(), for the full lockup. Sized by height
  // rather than by a single px, because the box is taller than it is wide and
  // "the logo is 52" means 52 tall in a row that also holds a close button.
  // The <image> fills the box exactly - the padding to a common ratio was done
  // to the artwork, not here - so nothing needs the optical offset the mark's
  // wrapper carries.
  function fullLogo(doc, height) {
    var h = Number(height) || 52;
    var w = Math.round((h * LOGO_FULL_W / LOGO_FULL_H) * 100) / 100;
    var s = doc.createElementNS(SVG_NS, 'svg');
    s.setAttribute('viewBox', '0 0 ' + LOGO_FULL_W + ' ' + LOGO_FULL_H);
    s.setAttribute('width', String(w));
    s.setAttribute('height', String(h));
    s.setAttribute('role', 'img');
    s.setAttribute('aria-label', 'Oliver 4');
    style(s, { flex: 'none', display: 'block' });

    var img = doc.createElementNS(SVG_NS, 'image');
    img.setAttribute('x', '0');
    img.setAttribute('y', '0');
    img.setAttribute('width', String(LOGO_FULL_W));
    img.setAttribute('height', String(LOGO_FULL_H));
    img.setAttribute('preserveAspectRatio', 'none');
    function paint(name) {
      var uri = name === 'dark' ? LOGO_FULL_ON_DARK : LOGO_FULL_ON_LIGHT;
      img.setAttribute('href', uri);
      img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', uri);
    }
    paint(DEFAULT_THEME);
    s.setTheme = paint;
    s.appendChild(img);
    return s;
  }

  var ICON = {
    // Window controls. Collapse is a single rule, expand and restore are two
    // corner brackets pointing out and in - the pair a title bar usually uses.
    collapse: ['M3.5 8h9'],
    // Shown on the collapse button once the panel IS collapsed. The bar it is
    // reduced to, with the panel dropping back out from under it - a single
    // rule in both states said "collapse" twice and gave no hint that the
    // second press does the opposite.
    reopen: ['M3.5 4.4h9', 'M8 7.1v4.5', 'M5.4 9L8 11.6 10.6 9'],
    expand: ['M6.6 3.2H3.2v3.4', 'M3.2 3.2L6.9 6.9', 'M9.4 12.8h3.4V9.4', 'M12.8 12.8L9.1 9.1'],
    restore: ['M3.4 6.9h3.4V3.5', 'M6.8 6.9L3.1 3.2', 'M12.6 9.1H9.2v3.4', 'M9.2 9.1l3.7 3.7'],
    // Theme switch. A sun with four rays and a crescent - drawn short so they
    // read at the 14px the switch uses.
    sun: ['M8 5.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z', 'M8 1.9v1.4', 'M8 12.7v1.4',
      'M1.9 8h1.4', 'M12.7 8h1.4', 'M3.7 3.7l1 1', 'M11.3 11.3l1 1', 'M12.3 3.7l-1 1',
      'M4.7 11.3l-1 1'],
    moon: ['M12.6 9.8A5 5 0 0 1 6.2 3.4 5.1 5.1 0 1 0 12.6 9.8z'],
    // About. A circle with an i in it, drawn as strokes so it takes the button
    // colour like everything else.
    info: ['M8 2.2a5.8 5.8 0 1 0 0 11.6 5.8 5.8 0 0 0 0-11.6z', 'M8 7.3v3.6', 'M8 5.2h.01'],
    // Download, for the CSV control - a tray with an arrow coming into it.
    download: ['M8 2.9v6.4', 'M5.4 6.9L8 9.5l2.6-2.6', 'M3.2 11.4v1.3h9.6v-1.3'],
    refresh: ['M13 8A5 5 0 1 1 8 3', 'M8 0.9L10.8 3L8 5.1'],
    close: ['M4 4l8 8', 'M12 4l-8 8'],
    search: ['M7.2 2.6a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2z', 'M10.6 10.6L13.6 13.6'],
    // warning triangle
    warning: ['M8 2.4L14.6 13.6H1.4z', 'M8 6.6v3.3', 'M8 11.7h.01'],
    // external link
    external: ['M9.4 3.2h3.4v3.4', 'M12.8 3.2L7.5 8.5', 'M12.2 9.4v3a1.4 1.4 0 0 1-1.4 1.4H3.9a1.4 1.4 0 0 1-1.4-1.4V5.5a1.4 1.4 0 0 1 1.4-1.4h3'],
    // Disclosure. Right when the row is shut, down when it is open - two
    // icons rather than one rotated, because a rotation is a style a test can
    // read only by trusting the transform, and the shape is the state.
    chevron: ['M6.2 3.8L10.4 8L6.2 12.2'],
    chevronOpen: ['M3.8 6.2L8 10.4L12.2 6.2'],
    // Back out of a viewer to the list it was opened from.
    back: ['M12.8 8H3.6', 'M7.2 4.4L3.6 8L7.2 11.6'],
    // The other direction, on a row that opens something. A chevron said
    // "this expands", which stopped being true at v2.2.5 when the definition
    // took the pane - an arrow says "this goes somewhere".
    enter: ['M3.2 8h7.6', 'M7.6 4.6L11 8L7.6 11.4']
  };

  // Icons for the Change the form switches. Stroke only, so they inherit the
  // row's text colour and go blue when the switch is on. Drawn to match the
  // concept: open padlock, asterisk, eye, hash, pencil.
  var ACTION_ICON = {
    unlock: ['M4.4 8.9a1.4 1.4 0 0 1 1.4-1.4h6.8a1.4 1.4 0 0 1 1.4 1.4v3.7a1.4 1.4 0 0 1-1.4 1.4H5.8a1.4 1.4 0 0 1-1.4-1.4z',
      'M6.4 7.5V5.6a2.6 2.6 0 0 1 5-0.9'],
    optional: ['M8 3v10', 'M4 5l8 6', 'M12 5l-8 6'],
    show: ['M1.6 8S4 4.2 8 4.2 14.4 8 14.4 8 12 11.8 8 11.8 1.6 8 1.6 8Z',
      'M8 6.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z'],
    schema: ['M6 2.6L4.6 13.4', 'M11.4 2.6L10 13.4', 'M2.6 6h11', 'M2.2 10h11'],
    dirty: ['M11.4 2.9L13.1 4.6L5.6 12.1L3 13l0.9-2.6z'],
    // The eye of `show` with a line through it. Blur is the opposite of "show
    // hidden fields", and the two rows sit in the same panel, so the icons are
    // deliberately the same shape with the slash telling them apart.
    blur: ['M1.6 8S4 4.2 8 4.2 14.4 8 14.4 8 12 11.8 8 11.8 1.6 8 1.6 8Z',
      'M8 6.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z', 'M3.2 12.8L12.8 3.2']
  };

  /* ------------------------------------------------------------------ UI --- */

  // A square ghost button - the window controls in the header, and the close
  // on the About popover. No fill until hovered, so they sit quietly next to
  // the drag affordance rather than competing with the record's own actions.
  function iconButton(doc, icon, tooltip, handler, size) {
    var b = el(doc, 'button', {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '26px',
      height: '26px',
      padding: '0',
      background: 'transparent',
      color: T.muted,
      border: '1px solid transparent',
      borderRadius: T.radiusInner,
      cursor: 'pointer'
    });
    b.type = 'button';
    b.title = tooltip;
    b.setAttribute('aria-label', tooltip);
    b.appendChild(svg(doc, icon, size || 15));
    b.onmouseenter = function () { b.style.background = T.hover; b.style.color = T.text; };
    b.onmouseleave = function () { b.style.background = 'transparent'; b.style.color = T.muted; };
    b.onclick = handler;
    return b;
  }

  // The small outlined text control used for "copy" beside the record ID and
  // for the copy control in the results pane. Mono, so it reads as a control
  // over data rather than as prose.
  function chipButton(doc, label, tooltip, handler) {
    var b = el(doc, 'button', {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '2px 7px',
      background: 'transparent',
      color: T.muted,
      border: '1px solid ' + T.control,
      borderRadius: '5px',
      cursor: 'pointer',
      font: T.monoSmall,
      lineHeight: '1.5'
    });
    b.type = 'button';
    if (tooltip) {
      b.title = tooltip;
      b.setAttribute('aria-label', tooltip);
    }
    var text = el(doc, 'span', {}, label);
    b.appendChild(text);
    b.labelNode = text;
    b.onmouseenter = function () { b.style.background = T.hover; b.style.color = T.text; };
    b.onmouseleave = function () { b.style.background = 'transparent'; b.style.color = T.muted; };
    if (handler) b.onclick = handler;
    return b;
  }

  // Refresh and Web API. Refresh is the filled one because it is the action
  // taken most often and the only one that changes what the panel is showing.
  // The one filled chip in the panel. Back is the only control that takes you
  // out of a view rather than doing something inside it, so it is filled
  // rather than outlined and it says "Back" rather than naming what it returns
  // to - the pane header already carries that. Both hover handlers have to be
  // rebound: chipButton's own return the chip to transparent, which is the
  // trap paintRow and the About button already avoid.
  function backChip(doc, tooltip) {
    var b = chipButton(doc, 'Back', tooltip);
    style(b, {
      background: T.accent,
      color: T.onAccent,
      borderColor: T.accent,
      fontWeight: '700'
    });
    b.onmouseenter = function () {
      b.style.background = T.accentHover;
      b.style.borderColor = T.accentHover;
    };
    b.onmouseleave = function () {
      b.style.background = T.accent;
      b.style.borderColor = T.accent;
    };
    b.insertBefore(svg(doc, ICON.back, 12), b.firstChild);
    return b;
  }

  function actionButton(doc, label, icon, primary, tooltip, handler) {
    var b = el(doc, 'button', {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      height: '33px',
      padding: '0 12px',
      background: primary ? T.accent : 'transparent',
      color: primary ? T.onAccent : T.ink,
      border: '1px solid ' + (primary ? T.accent : T.control),
      borderRadius: T.radiusInner,
      cursor: 'pointer',
      font: T.font,
      fontSize: '14.5px',
      whiteSpace: 'nowrap'
    });
    b.type = 'button';
    b.title = tooltip || label;
    b.setAttribute('data-oliver4-action', label);
    b.appendChild(svg(doc, icon, 15));
    var text = el(doc, 'span', {}, label);
    b.appendChild(text);
    b.labelNode = text;
    hover(b, primary ? T.accent : 'transparent', primary ? T.accentHover : T.hover);
    if (handler) b.onclick = handler;
    return b;
  }

  // Six dots in a 2x3 grid, the conventional "this is a handle" mark. Drawn
  // with elements rather than an SVG so it stays crisp at 2px.
  function dragDots(doc) {
    var wrap = el(doc, 'span', {
      display: 'grid',
      gridTemplateColumns: '2px 2px',
      gap: '2px 3px',
      opacity: '0.5',
      flex: 'none'
    });
    for (var i = 0; i < 6; i++) {
      wrap.appendChild(el(doc, 'span', {
        width: '2px', height: '2px', background: T.faint
      }));
    }
    return wrap;
  }

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  /* ---------------------------------------------------------------- shell --- */

  // A small segmented group - the shape used for the role chips, the theme
  // switch and the LIST/JSON pair. One inset box with a hairline round it, and
  // whichever option is on carries the raised surface.
  // The product lockup: the mark, OLIVER4, and the tool name under it. There
  // were two hand-built copies of this - the header and the About popover -
  // and they had already drifted a size and a weight apart, About at
  // 14.5px/700 against the header's 15px/600. One function now, the same rule
  // segmentedPair follows. `extra` is an optional node set beside the name,
  // which is where About puts the version. The returned node carries `.mark`,
  // because the artwork is one of the three things a theme change has to
  // repaint by hand.
  function lockup(doc, markSize, extra) {
    var wrap = el(doc, 'div', {
      display: 'flex', alignItems: 'center', gap: '10px', minWidth: '0'
    });
    var mark = logo(doc, markSize);
    wrap.appendChild(mark);
    var titles = el(doc, 'div', {
      display: 'flex', flexDirection: 'column', gap: '1px', minWidth: '0'
    });
    titles.appendChild(el(doc, 'div', {
      font: '11px ' + T.monoFamily,
      letterSpacing: '0.2em',
      color: T.accentText,
      whiteSpace: 'nowrap'
    }, 'OLIVER4'));
    var name = el(doc, 'div', {
      display: 'flex', alignItems: 'baseline', gap: '8px', minWidth: '0'
    });
    name.appendChild(el(doc, 'div', {
      fontSize: '15px', fontWeight: '600', letterSpacing: '-0.01em',
      color: T.text, whiteSpace: 'nowrap'
    }, 'Dynamics 365 Toolkit'));
    if (extra) name.appendChild(extra);
    titles.appendChild(name);
    wrap.appendChild(titles);
    wrap.mark = mark;
    return wrap;
  }

  // About's own lockup, which stopped being the header's at v2.3.2. Three
  // things changed and they all follow from the artwork: the popover now shows
  // the full mark with the OLIVER 4 wordmark in it, so the OLIVER4 line the
  // shared lockup drew above the tool name was the same word said twice and
  // came out; with that gone the tool name moves up to sit against the top of
  // the mark; and the version drops underneath it rather than sitting beside
  // it, because a three line column reads down and a name with something
  // trailing it does not.
  //
  // The site link is last. It is the only thing in the panel that leaves the
  // page, so it is deliberately at the bottom of the stack rather than in the
  // header, and it is a plain anchor - a real link, middle-clickable and
  // copyable - rather than a button that calls window.open. target and rel are
  // both set: the toolkit is injected into somebody's live record and must not
  // navigate the form away, and the new tab must not get a handle back to it.
  function aboutLockup(doc, height) {
    var wrap = el(doc, 'div', {
      display: 'flex', alignItems: 'center', gap: '13px', minWidth: '0'
    });
    var mark = fullLogo(doc, height);
    mark.setAttribute('data-oliver4-region', 'about-logo');
    wrap.appendChild(mark);

    var titles = el(doc, 'div', {
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      gap: '2px', minWidth: '0'
    });
    var name = el(doc, 'div', {
      fontSize: '15px', fontWeight: '600', letterSpacing: '-0.01em',
      color: T.text, whiteSpace: 'nowrap'
    }, 'Dynamics 365 Toolkit');
    name.setAttribute('data-oliver4-region', 'about-name');
    titles.appendChild(name);

    var version = el(doc, 'div', {
      font: T.monoTiny, color: T.muted, whiteSpace: 'nowrap'
    }, VERSION);
    version.setAttribute('data-oliver4-region', 'about-version');
    titles.appendChild(version);

    var link = el(doc, 'a', {
      font: T.font, fontSize: '12px', color: T.accentText,
      textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'pointer'
    }, WEBSITE_LABEL);
    link.href = WEBSITE;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = WEBSITE;
    link.setAttribute('data-oliver4-region', 'about-link');
    link.onmouseenter = function () { link.style.textDecoration = 'underline'; };
    link.onmouseleave = function () { link.style.textDecoration = 'none'; };
    titles.appendChild(link);

    wrap.appendChild(titles);
    wrap.mark = mark;
    return wrap;
  }

  function segmentedGroup(doc) {
    return el(doc, 'div', {
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      padding: '2px',
      background: T.hover,
      border: '1px solid ' + T.border,
      borderRadius: '6px',
      flex: 'none'
    });
  }

  // Two treatments for the chosen option. The default raises it on a lighter
  // surface, which is right for the theme switch: it is chrome, and a filled
  // blue square beside the About button would read as another action. The
  // accent treatment fills it, which is what the pairs inside the results pane
  // use - there the pair is the control you are actually working, and the
  // raised-surface version was too quiet to answer "which view am I in".
  function paintSegment(node, on, accent) {
    if (accent) {
      node.style.background = on ? T.accent : 'transparent';
      node.style.color = on ? T.onAccent : T.muted;
      node.style.boxShadow = 'none';
      return;
    }
    node.style.background = on ? T.window : 'transparent';
    node.style.color = on ? T.text : T.muted;
    node.style.boxShadow = on ? '0 1px 2px rgba(0, 0, 0, 0.10)' : 'none';
  }

  // Pick one of two or three. The theme switch, the LIST / JSON pair and the
  // WITH RECORDS / ALL pair were three copies of the same twenty lines, which
  // is how the LIST / JSON pair ended up being the only one of them that never
  // reported its state to a screen reader. One shape now, so they cannot drift
  // apart again. Returns the group with a paint(value) that raises the match.
  function segmentedPair(doc, options, onPick, accent) {
    var group = segmentedGroup(doc);
    var buttons = options.map(function (opt) {
      var b = el(doc, 'button', {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: opt.icon ? '26px' : 'auto',
        height: opt.icon ? '20px' : 'auto',
        padding: opt.icon ? '0' : '4px 9px',
        borderRadius: '4px',
        background: 'transparent',
        border: '0',
        cursor: 'pointer',
        font: T.monoTiny
      }, opt.icon ? undefined : opt.label);
      b.type = 'button';
      if (opt.title) {
        b.title = opt.title;
        b.setAttribute('aria-label', opt.title);
      }
      if (opt.region) b.setAttribute('data-oliver4-region', opt.region);
      if (opt.icon) b.appendChild(svg(doc, opt.icon, 13));
      b.onclick = function () { onPick(opt.value); };
      group.appendChild(b);
      return b;
    });
    group.paint = function (value) {
      options.forEach(function (opt, i) {
        var on = opt.value === value;
        paintSegment(buttons[i], on, accent);
        buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    };
    return group;
  }

  function build(doc, win) {
    var old = doc.getElementById(PANEL_ID);
    if (old) old.parentNode.removeChild(old);

    var store = getStore(win);
    var noteTimer = null;
    if (store.docked === undefined) store.docked = true;
    var theme = THEMES[store.theme] ? store.theme : DEFAULT_THEME;
    var mode = (store.windowMode === 'min' || store.windowMode === 'max')
      ? store.windowMode : 'open';

    // Fixed height rather than the max-height the panel carried up to v2.1.9.
    // It docks at full viewport height now, so the letterbox that rule was
    // written to avoid is gone: the results pane is nearly the whole panel and
    // it is the pane that scrolls, with the sidebar scrolling separately.
    var panel = el(doc, 'div', {
      position: 'fixed',
      zIndex: '2147483647',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: T.window,
      color: T.text,
      border: '1px solid ' + T.border,
      boxShadow: T.shadow,
      font: T.font,
      lineHeight: '1.5'
    });
    panel.id = PANEL_ID;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Oliver 4 D365 Toolkit');
    applyTheme(panel, theme);

    /* header - the tool, the person using it, and the window controls. It is
       also the drag handle, so the separate "Drag to move" title bar the panel
       carried up to v2.1.9 is gone: two bars of chrome above the record was
       one too many once the panel became full height. */

    var header = el(doc, 'div', {
      flex: 'none',
      height: T.headerHeight + 'px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '0 12px 0 14px',
      background: T.bar,
      borderBottom: '1px solid ' + T.line,
      cursor: 'move',
      userSelect: 'none'
    });
    header.setAttribute('data-oliver4-region', 'header');

    var brand = el(doc, 'div', {
      display: 'flex', alignItems: 'center', gap: '11px', flex: 'none'
    });
    brand.appendChild(dragDots(doc));
    var headerLockup = lockup(doc, 34);
    brand.appendChild(headerLockup);
    header.appendChild(brand);

    // Who is signed in used to sit here, between the brand and the chrome,
    // and it never had the room: the header carries the drag dots, the mark,
    // a two line lockup, the theme switch, About and three window controls, so
    // a real user name and two role chips were both being cut off in a docked
    // panel. It moved to the head of the sidebar at v2.2.2, where it has the
    // full 296px and the roles can wrap onto as many lines as they need.
    header.appendChild(el(doc, 'span', { flex: '1', minWidth: '0' }));

    /* theme switch - sun and moon, the option in use raised. Deliberately not
       gated behind the role check: reading the panel should not depend on
       being allowed to use it. */

    // Regions rather than actions: data-oliver4-action means something you do
    // to the record, and the chrome is not that.
    var themeSwitch = segmentedPair(doc, [
      { value: 'light', icon: ICON.sun, title: 'Light theme', region: 'theme-light' },
      { value: 'dark', icon: ICON.moon, title: 'Dark theme', region: 'theme-dark' }
    ], function (name) { ui.setTheme(name); });
    themeSwitch.setAttribute('data-oliver4-region', 'theme');
    themeSwitch.title = 'Switch between the light and dark theme';
    header.appendChild(themeSwitch);

    /* About - the three standing notices, which used to sit permanently above
       the status bar. They moved behind this button at v2.2.0 so the panel
       could give its height to the listing instead. */

    var aboutButton = el(doc, 'button', {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      height: '26px',
      padding: '0 10px',
      borderRadius: '5px',
      border: '1px solid ' + T.border,
      background: 'transparent',
      color: T.muted,
      cursor: 'pointer',
      font: T.font,
      fontSize: '12.5px',
      whiteSpace: 'nowrap',
      flex: 'none'
    });
    aboutButton.type = 'button';
    aboutButton.title = 'About this tool';
    aboutButton.setAttribute('data-oliver4-region', 'about-button');
    aboutButton.appendChild(svg(doc, ICON.info, 13));
    aboutButton.appendChild(el(doc, 'span', {}, 'About'));
    header.appendChild(aboutButton);

    var windowControls = el(doc, 'div', {
      display: 'flex', alignItems: 'center', gap: '2px', flex: 'none'
    });
    var minButton = iconButton(doc, ICON.collapse, 'Collapse to the header',
      function () { ui.setMode(ui.mode === 'min' ? 'open' : 'min'); }, 13);
    minButton.setAttribute('data-oliver4-region', 'collapse');
    var maxButton = iconButton(doc, ICON.expand, 'Grow the panel over the form',
      function () { ui.setMode(ui.mode === 'max' ? 'open' : 'max'); }, 13);
    maxButton.setAttribute('data-oliver4-region', 'maximise');
    var closeButton = iconButton(doc, ICON.close, 'Close', function () {
      if (panel.parentNode) panel.parentNode.removeChild(panel);
    }, 13);
    closeButton.setAttribute('data-oliver4-region', 'close');
    windowControls.appendChild(minButton);
    windowControls.appendChild(maxButton);
    windowControls.appendChild(closeButton);
    header.appendChild(windowControls);

    /* about popover */

    // A column rather than a block from v2.3.3, and bounded by the panel it
    // hangs inside. The popover is taller than the shortest panel the toolkit
    // allows (T.minHeight is 380, and the notices alone run past that), so on
    // a small or resized-down window it used to run off the bottom and the
    // last notice simply could not be read - the panel clips its children.
    //
    // maxHeight leaves the 8px it sits below the header and the same 14px
    // margin it keeps at the sides, so the popover stops short of the panel's
    // bottom edge rather than meeting it. The head is flex: none and the body
    // scrolls, so the tool name, the version, the site link and - the point of
    // it - the close button stay put while the notices move under them. A
    // popover that scrolled as one would take its own close button off screen,
    // which is the shape of the problem, not a fix for it.
    var about = el(doc, 'div', {
      display: 'none',
      flexDirection: 'column',
      position: 'absolute',
      top: (T.headerHeight + 8) + 'px',
      right: '14px',
      width: '430px',
      maxWidth: 'calc(100% - 28px)',
      maxHeight: 'calc(100% - ' + (T.headerHeight + 8 + 14) + 'px)',
      zIndex: '30',
      background: T.window,
      border: '1px solid ' + T.border,
      borderRadius: '10px',
      boxShadow: T.shadow,
      overflow: 'hidden'
    });
    about.setAttribute('data-oliver4-region', 'about');
    about.setAttribute('role', 'dialog');
    about.setAttribute('aria-label', 'About this tool');

    var aboutHead = el(doc, 'div', {
      flex: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      padding: '11px 14px',
      background: T.bar,
      borderBottom: '1px solid ' + T.line
    });
    aboutHead.setAttribute('data-oliver4-region', 'about-head');
    // The popover names the tool rather than saying "About this tool" and
    // leaving you to work out which tool. 78px: twice the 26 the shared lockup
    // drew the mark at up to v2.3.1, and half as much again at v2.3.3. The
    // wordmark sits under the leaves and takes about a sixth of the height, so
    // the lockup has to be drawn considerably larger than a bare mark before
    // the word under it is a word rather than a texture.
    var aboutTitle = aboutLockup(doc, 78);
    aboutHead.appendChild(aboutTitle);
    aboutHead.appendChild(iconButton(doc, ICON.close, 'Close', function () {
      ui.showAbout(false);
    }, 13));
    about.appendChild(aboutHead);

    var aboutBody = el(doc, 'div', {
      flex: '1',
      minHeight: '0',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px',
      fontSize: '13.5px', lineHeight: '1.55', color: T.text
    });
    aboutBody.setAttribute('data-oliver4-region', 'about-body');
    // Each notice keeps a coloured rule beside it so the three read as three
    // separate statements rather than as one paragraph of small print.
    function notice(colour, text) {
      var row = el(doc, 'div', { display: 'flex', gap: '10px' });
      row.appendChild(el(doc, 'div', {
        flex: 'none', width: '3px', borderRadius: '2px', background: colour
      }));
      row.appendChild(el(doc, 'div', { minWidth: '0' }, text));
      // The two kinds of row look alike and are not alike: a description says
      // what the tool is, a notice says what using it means. They carry
      // different regions so a suite can count one without catching the other
      // - counting rows that happened to be flex was how check 15 read three
      // notices right up until the descriptions took the same rule.
      row.setAttribute('data-oliver4-region', 'about-notice');
      aboutBody.appendChild(row);
    }
    // What the tool is, above the three notices. Somebody opening About for
    // the first time needs to know what they are looking at before they are
    // told what it will not do - and the panel names itself everywhere else
    // without ever saying what it is for. It takes the same coloured rule as
    // the notices from v2.2.9: the popover is a column of statements, and one
    // of them arriving without a rule read as a preamble to the rest.
    function paragraph(text) {
      var row = el(doc, 'div', { display: 'flex', gap: '10px' });
      row.appendChild(el(doc, 'div', {
        flex: 'none', width: '3px', borderRadius: '2px', background: T.accentText
      }));
      row.appendChild(el(doc, 'div', { minWidth: '0' }, text));
      row.setAttribute('data-oliver4-region', 'about-description');
      aboutBody.appendChild(row);
      return row;
    }
    paragraph('This is a read only toolkit for Dynamics 365 and Power Apps ' +
      'model-driven forms. It runs from a browser extension rather than from a ' +
      'solution, so nothing is installed in the environment and the panel ' +
      'exists only in the page you opened it on.');
    paragraph('It reads this record, the table it belongs to and the form\'s ' +
      'own configuration through the Dynamics 365 client already running on ' +
      'the page, showing every field on the table with its value and its full ' +
      'column definition, the choices behind a choice column, how many ' +
      'related records in each relationship, and the scripts, handlers and ' +
      'business rules behind the form. It can also change what the form is ' +
      'showing you - unlocking read only fields, revealing hidden ones, ' +
      'dropping required field levels, displaying schema names beside labels.');
    paragraph('This is not a Microsoft supported tool.');
    // A rule between what the tool is and what it will not do, so the three
    // notices below read as conditions on it rather than as more of it.
    aboutBody.appendChild(el(doc, 'div', {
      height: '1px', background: T.line, margin: '2px 0'
    }));

    notice(T.accentText,
      'This tool is only accessible to users with a System Administrator security role.');
    notice(T.accentText,
      'This tool has not been accessibility tested. Its features only provide shortcuts to ' +
      'functionality that is already available by other means.');
    notice(T.accentText,
      'This tool stores nothing and sends nothing anywhere. It reads from the form and from ' +
      'Dataverse using your own permissions, writes nothing back, and everything it changes ' +
      'is undone by refreshing the page. The one file it writes is a CSV, and only when you ' +
      'ask for one.');
    // No footer. The version moved up beside the tool name, and the
    // environment URL moved to the status bar, where it is on screen the whole
    // time rather than behind a button.
    about.appendChild(aboutBody);

    /* body - everything the collapse button hides */

    var body = el(doc, 'div', {
      flex: '1', minHeight: '0', display: 'flex', flexDirection: 'column'
    });
    body.setAttribute('data-oliver4-region', 'body');

    /* record row */

    var recordRow = el(doc, 'div', {
      flex: 'none',
      padding: '13px 14px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      borderBottom: '1px solid ' + T.line
    });
    recordRow.setAttribute('data-oliver4-region', 'record');

    var recordLeft = el(doc, 'div', {
      flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '7px'
    });
    // The record name is the largest thing in the panel: it is the answer to
    // "which record am I about to change".
    var nameRow = el(doc, 'div', {
      fontSize: '20px',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      color: T.text,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }, '');
    var meta = el(doc, 'div', {
      display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: '0'
    });
    // Table name reads as a token rather than prose, so it gets the chip
    // treatment - it is a value you copy into a query, not a sentence.
    var tableChip = el(doc, 'span', {
      font: T.monoSmall,
      color: T.accentSoft,
      background: T.chipBg,
      padding: '3px 7px',
      borderRadius: '4px',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }, '');
    var idValue = el(doc, 'span', {
      font: T.monoSmall,
      color: T.muted,
      userSelect: 'all',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      minWidth: '0'
    }, '');
    var copyChip = chipButton(doc, 'copy', 'Copy record ID');
    copyChip.setAttribute('data-oliver4-action', 'Copy record ID');
    meta.appendChild(tableChip);
    meta.appendChild(idValue);
    meta.appendChild(copyChip);
    recordLeft.appendChild(nameRow);
    recordLeft.appendChild(meta);

    // The buttons, and under them whatever the last action had to say. The
    // message used to sit under the record ID on the left, where a two word
    // answer to a button on the right made you look away from the button to
    // find it. Here it is directly under Web API, right aligned, which is
    // where the eye already is.
    var recordSide = el(doc, 'div', {
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
      gap: '7px', flex: 'none', minWidth: '0'
    });
    var recordActions = el(doc, 'div', {
      display: 'flex', gap: '8px', flex: 'none', flexWrap: 'wrap',
      justifyContent: 'flex-end'
    });
    // Hidden until there is something to say, so it reserves no space. It does
    // not wrap: recordLeft is the flexible column, so a message wider than the
    // buttons takes its width off the record ID, which truncates - one line
    // that stays one line, rather than a message that reflows the row.
    var note = el(doc, 'div', {
      display: 'none', font: T.monoSmall, color: T.muted,
      textAlign: 'right', whiteSpace: 'nowrap'
    }, '');
    note.setAttribute('data-oliver4-region', 'note');
    note.setAttribute('role', 'status');
    recordSide.appendChild(recordActions);
    recordSide.appendChild(note);

    recordRow.appendChild(recordLeft);
    recordRow.appendChild(recordSide);
    body.appendChild(recordRow);

    /* main - a fixed sidebar of controls and a results pane that fills the
       rest. The controls stay put while a listing scrolls beside them, which
       is the point of the two column layout: a modified form is never a
       surprise, because the switches are always in view. */

    var main = el(doc, 'div', {
      flex: '1', minHeight: '0', display: 'flex'
    });
    main.setAttribute('data-oliver4-region', 'main');

    var tools = el(doc, 'div', {
      flex: 'none',
      width: T.sidebarWidth + 'px',
      display: 'flex',
      flexDirection: 'column',
      background: T.panel,
      borderRight: '1px solid ' + T.line,
      overflowY: 'auto',
      overflowX: 'hidden'
    });
    tools.setAttribute('data-oliver4-region', 'tools');

    /* identity - who is signed in and what they are allowed to do, at the head
       of the sidebar. Hidden until the role check answers rather than showing
       a name with no roles beside it, which would read as "no roles". */

    var identity = el(doc, 'div', {
      display: 'none',
      flex: 'none',
      flexDirection: 'column',
      gap: '9px',
      padding: '12px 14px 13px'
    });
    identity.setAttribute('data-oliver4-region', 'identity');

    var userRow = el(doc, 'div', {
      display: 'flex', alignItems: 'center', gap: '9px', minWidth: '0'
    });
    userRow.setAttribute('data-oliver4-region', 'identity-user');
    var avatar = el(doc, 'span', {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none',
      width: '30px',
      height: '30px',
      borderRadius: '15px',
      background: T.accent,
      color: T.onAccent,
      fontSize: '11.5px',
      fontWeight: '700'
    }, '');
    var userText = el(doc, 'div', {
      display: 'flex', flexDirection: 'column', gap: '1px', minWidth: '0'
    });
    userText.appendChild(el(doc, 'div', {
      fontSize: '10.5px',
      fontWeight: '700',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: T.muted,
      whiteSpace: 'nowrap'
    }, 'Signed in as'));
    // Truncated with the full value on hover rather than wrapped: a two line
    // name would push the roles and the first section down.
    var userName = el(doc, 'div', {
      fontSize: '14.5px', color: T.text, minWidth: '0',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
    }, '');
    userText.appendChild(userName);
    userRow.appendChild(avatar);
    userRow.appendChild(userText);

    // Wraps rather than truncating. This is the whole reason the block moved:
    // in the header it could show two roles and a "+3", and a role name long
    // enough to matter was cut off inside its own chip.
    var roleRow = el(doc, 'div', {
      display: 'flex', flexWrap: 'wrap', gap: '4px', minWidth: '0'
    });
    roleRow.setAttribute('data-oliver4-region', 'roles');

    identity.appendChild(userRow);
    identity.appendChild(roleRow);
    tools.appendChild(identity);

    var results = el(doc, 'div', {
      flex: '1',
      minWidth: '0',
      display: 'flex',
      flexDirection: 'column',
      background: T.results
    });
    results.setAttribute('data-oliver4-region', 'results');

    main.appendChild(tools);
    main.appendChild(results);
    body.appendChild(main);

    // Four stacked rows rather than two, from v2.2.7. The pane had a bold
    // title, a mono count and nothing else, which told you what the listing
    // was called and not what you were looking at. Top to bottom: where you
    // are and the way back, the name of it with its controls, a sentence of
    // plain English, and the count last - the count is the technical line, so
    // it is the one that got demoted rather than the one that led.
    //
    // Nothing here is addressed by child index any more: every row carries a
    // region and helpers.js reads them by name.
    var resultHead = el(doc, 'div', {
      flex: 'none',
      background: T.bar,
      padding: '9px 14px 10px',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gridTemplateAreas: '"crumbs crumbs" "title tools" "note note" "meta meta"',
      alignItems: 'center',
      rowGap: '4px',
      columnGap: '10px',
      borderBottom: '1px solid ' + T.line
    });
    // The trail, with Back at the head of it. Hidden entirely when there is
    // nowhere to be - a message in the pane is not somewhere you navigated to.
    // One line, always. It used to wrap, which moved the title down the pane
    // as soon as a field had a long name - the header changing height as you
    // clicked through a listing is worse than not reading the whole name, and
    // the whole name is still in the title above the listing it came from.
    //
    // From v2.3.2 the row is a bar of its own rather than a run of pills
    // sitting loose on the header. The header is T.bar and the trail was on
    // it, so at a glance the crumbs read as three chips belonging to the title
    // under them; a surface change, a hairline and a radius make it one strip
    // that is obviously the navigation and obviously not the title's controls.
    var resultCrumbs = el(doc, 'div', {
      gridArea: 'crumbs',
      display: 'none',
      alignItems: 'center',
      gap: '4px',
      flexWrap: 'nowrap',
      minWidth: '0',
      overflow: 'hidden',
      background: T.window,
      border: '1px solid ' + T.line,
      borderRadius: '8px',
      padding: '4px 7px',
      marginBottom: '2px'
    });
    var resultTitle = el(doc, 'div', {
      gridArea: 'title',
      fontSize: '18px', fontWeight: '700', color: T.text, letterSpacing: '-0.01em',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
    }, '');
    // The sentence. The UI face rather than mono, and a reading size rather
    // than a caption size: it is the one line in the pane written for somebody
    // who has not seen the tool before.
    var resultNote = el(doc, 'div', {
      gridArea: 'note',
      display: 'none',
      fontSize: '13.5px',
      lineHeight: '1.5',
      color: T.soft,
      minWidth: '0'
    }, '');
    var resultMeta = el(doc, 'div', {
      gridArea: 'meta',
      font: T.monoSmall, color: T.muted, minWidth: '0',
      lineHeight: '1.45', whiteSpace: 'normal', overflowWrap: 'anywhere'
    }, '');
    // Controls belonging to whatever is on screen. Emptied on every render, so
    // a listing can never inherit the previous one's copy or filter controls.
    var resultTools = el(doc, 'div', {
      gridArea: 'tools',
      display: 'flex', alignItems: 'center', gap: '8px', flex: 'none'
    });
    resultHead.appendChild(resultCrumbs);
    resultHead.appendChild(resultTitle);
    resultHead.appendChild(resultTools);
    resultHead.appendChild(resultNote);
    resultHead.appendChild(resultMeta);

    var resultAside = el(doc, 'div', { flex: 'none', display: 'none' });

    // This is the scroller now, not the panel. The panel is full height, so a
    // long listing is read in a tall pane rather than through a letterbox -
    // which is what the v2.0.2 "the whole panel scrolls" rule was avoiding.
    var output = el(doc, 'div', {
      flex: '1',
      minHeight: '0',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '4px 14px 14px',
      fontSize: '14.5px',
      color: T.text
    });
    output.setAttribute('data-oliver4-region', 'output');
    output.setAttribute('role', 'region');
    output.setAttribute('aria-label', 'Toolkit output');
    output.setAttribute('aria-live', 'polite');

    var resultFoot = el(doc, 'div', {
      display: 'none',
      flex: 'none',
      padding: '7px 14px',
      borderTop: '1px solid ' + T.line,
      font: T.monoSmall,
      color: T.muted
    }, '');

    resultHead.setAttribute('data-oliver4-region', 'result-head');
    resultCrumbs.setAttribute('data-oliver4-region', 'result-crumbs');
    resultTitle.setAttribute('data-oliver4-region', 'result-title');
    resultNote.setAttribute('data-oliver4-region', 'result-note');
    resultMeta.setAttribute('data-oliver4-region', 'result-meta');
    resultFoot.setAttribute('data-oliver4-region', 'result-foot');
    resultTools.setAttribute('data-oliver4-region', 'result-tools');
    resultAside.setAttribute('data-oliver4-region', 'result-aside');

    results.appendChild(resultHead);
    results.appendChild(resultAside);
    results.appendChild(output);
    results.appendChild(resultFoot);

    /* status bar */

    var statusBar = el(doc, 'div', {
      flex: 'none',
      height: T.statusHeight + 'px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '0 30px 0 14px',
      background: T.bar,
      borderTop: '1px solid ' + T.line,
      font: T.monoTiny,
      color: T.muted
    });
    statusBar.setAttribute('data-oliver4-region', 'status');
    var copyrightNode = el(doc, 'span', {
      flex: '1 3 auto', minWidth: '0',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
    }, '© 2026 Oliver4 Dynamics 365 Toolkit Browser Extension');
    copyrightNode.setAttribute('data-oliver4-region', 'copyright');
    statusBar.appendChild(copyrightNode);

    /* which environment the panel is reading. Green with a lit pip means there
       is a live Dynamics client on this page - deliberately not a claim about
       the role check, because a user who is denied is still connected. Long
       host names lose their tail rather than pushing the version off the bar,
       and the full value is on hover. */

    var envPill = el(doc, 'div', {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      flex: '0 1 auto',
      minWidth: '0',
      height: '20px',
      padding: '0 8px',
      borderRadius: '10px',
      border: '1px solid transparent',
      background: 'transparent',
      color: T.muted,
      boxSizing: 'border-box'
    });
    envPill.setAttribute('data-oliver4-region', 'environment');
    var envPip = el(doc, 'span', {
      flex: 'none', width: '7px', height: '7px', borderRadius: '4px',
      background: T.control
    });
    var envText = el(doc, 'span', {
      minWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
    }, 'not connected');
    envPill.appendChild(envPip);
    envPill.appendChild(envText);
    statusBar.appendChild(envPill);

    statusBar.appendChild(el(doc, 'span', { flex: 'none' }, VERSION));
    body.appendChild(statusBar);

    // Both bottom corners, as the concept has them. The left one keeps the
    // right edge where it is, which is what a docked panel wants; the right
    // one is the ordinary bottom-right resize, and it undocks.
    function gripNode(side, glyph, cursor) {
      var g = el(doc, 'div', {
        position: 'absolute',
        bottom: '0',
        width: '18px',
        height: '18px',
        cursor: cursor,
        color: T.grip,
        fontSize: '13px',
        lineHeight: '17px',
        textAlign: side === 'left' ? 'left' : 'right',
        boxSizing: 'border-box',
        userSelect: 'none',
        zIndex: '5'
      }, glyph);
      g.style[side] = '0';
      g.style[side === 'left' ? 'paddingLeft' : 'paddingRight'] = '4px';
      g.title = 'Drag to resize';
      return g;
    }
    var grip = gripNode('right', '◢', 'nwse-resize');
    grip.setAttribute('data-oliver4-region', 'grip');
    var gripLeft = gripNode('left', '◣', 'nesw-resize');
    gripLeft.setAttribute('data-oliver4-region', 'grip-left');

    panel.appendChild(header);
    panel.appendChild(about);
    panel.appendChild(body);
    panel.appendChild(grip);
    panel.appendChild(gripLeft);
    doc.body.appendChild(panel);

    // Only what something outside build() actually reads. Anything reaching
    // into the panel from a test or from another tool goes through
    // data-oliver4-region instead, so a handle nobody calls is one more thing
    // to keep true - ui.titleBar survived the v2.2.0 rebuild pointing at the
    // header, which is not a title bar at all.
    // The trail and the sentence, held rather than only drawn, because
    // setTitle empties the header several times during one tool's turn.
    var contextTrail = null;
    var contextNote = '';

    function paintContext() {
      resultNote.textContent = contextNote;
      resultNote.style.display = contextNote ? 'block' : 'none';

      resultCrumbs.textContent = '';
      if (!contextTrail) {
        resultCrumbs.style.display = 'none';
        return;
      }
      resultCrumbs.style.display = 'flex';

      // Back goes first and only exists when there is somewhere to go: the
      // last ancestor crumb carrying a handler. At the top of a tool there is
      // nothing to go back to, and a disabled Back would be worse than none.
      var up = null;
      for (var i = 0; i < contextTrail.length - 1; i++) {
        if (contextTrail[i] && contextTrail[i].go) up = contextTrail[i];
      }
      if (up) {
        var back = backChip(doc, 'Back to ' + up.label);
        back.setAttribute('data-oliver4-region', 'result-back');
        back.onclick = up.go;
        resultCrumbs.appendChild(back);
      }

      contextTrail.forEach(function (item, index) {
        var label = typeof item === 'string' ? item : item.label;
        // item.go is still read - by the Back chip above, which is built from
        // the last ancestor carrying one. The crumb itself no longer uses it.
        var last = index === contextTrail.length - 1;

        // The separator carries weight of its own from v2.2.8. At 10px in
        // T.control it was a hairline between two runs of plain text and read
        // as punctuation; it is now a heavier stroke at a text tone, so the
        // trail has a rhythm you can see from across the pane.
        if (index) {
          var sep = el(doc, 'span', {
            display: 'flex', alignItems: 'center', color: T.faint, flex: 'none',
            padding: '0 1px'
          });
          var chev = svg(doc, ICON.chevron, 12);
          chev.setAttribute('stroke-width', '2');
          sep.appendChild(chev);
          resultCrumbs.appendChild(sep);
        }

        // Every crumb is a pill from v2.2.8 - a rounded shape rather than a
        // run of text - so the trail reads as a set of places rather than a
        // sentence. Pill radius rather than the panel's 5px chip: the trail is
        // not a control strip and should not be mistaken for one.
        //
        // Two states from v2.3.2, not three. Nothing in the trail is clickable
        // any more: Back sits at the head of the row and does the one thing an
        // ancestor crumb did, and a second way to do it that looked like a
        // button was the only reason the trail had a third state to draw. So
        // every place you have been is a grey pill and the view you are in is
        // the accented one - where you are against where you have been, which
        // is all a trail has to say once it is not also a control.
        //
        // The grey is deliberately heavier than the T.hover fill those labels
        // carried: on the trail's own surface a hover-tone pill was a shape
        // you had to look for. T.line for the fill and T.label for the text
        // lift it clear of the bar without competing with the current view,
        // which keeps the bold weight to itself.
        var crumb = el(doc, 'span', {
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 10px',
          border: '1px solid transparent',
          borderRadius: '999px',
          background: last ? T.accentTintStrong : T.line,
          font: T.font,
          fontSize: '12.5px',
          fontWeight: last ? '700' : '400',
          color: last ? T.text : T.label,
          cursor: 'default',
          // The crumb you are on is the one that gives way: it shrinks and
          // ends in an ellipsis, and everything ahead of it - Back, the
          // ancestors, the separators - keeps its full width.
          flex: last ? '0 1 auto' : 'none',
          maxWidth: '100%',
          minWidth: '0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }, label);
        crumb.setAttribute('data-oliver4-region', 'crumb-' + (index + 1));
        crumb.title = label;
        resultCrumbs.appendChild(crumb);
      });
    }

    var ui = {
      doc: doc, win: win, store: store, panel: panel,
      header: header, body: body, grip: grip, gripLeft: gripLeft,
      recordActions: recordActions, tools: tools,
      resultTools: resultTools, output: output,
      name: nameRow, table: tableChip, id: idValue, copyChip: copyChip,
      maxButton: maxButton, minButton: minButton,
      // Read by applyGeometry, which lives outside build(): both are hidden
      // while the panel is collapsed to its header.
      aboutButton: aboutButton, themeSwitch: themeSwitch,
      theme: theme, mode: mode,
      buttons: [],

      setTheme: function (name) {
        if (!THEMES[name]) return;
        ui.theme = name;
        store.theme = name;
        applyTheme(panel, name);
        paintTheme(name);
      },

      setMode: function (name) {
        var was = ui.mode;
        ui.mode = (name === 'min' || name === 'max') ? name : 'open';
        store.windowMode = ui.mode;
        applyGeometry(ui);
        // Coming back out of the collapsed bar is the one mode change that can
        // land on a different record: the Unified Interface navigates without
        // reloading the page, and while the panel is a bar nothing on screen
        // is watching. Whatever put the panel back - the collapse button or
        // maximise - the record is re-read before it is shown again.
        if (was === 'min' && ui.mode !== 'min' && ui.onExpand) ui.onExpand();
      },

      // Set once the record reader exists. build() runs before it, so this is
      // a hook rather than a call.
      onExpand: null,

      showAbout: function (on) {
        var open = on === undefined ? about.style.display === 'none' : !!on;
        // flex, not block: the popover is a fixed head over a scrolling body
        // from v2.3.3, and a block would give the body no height to scroll in.
        about.style.display = open ? 'flex' : 'none';
        // Reopening starts at the top. Somebody who scrolled to the last
        // notice, closed the popover and opened it again was landing halfway
        // down a panel whose title was off screen.
        if (open) aboutBody.scrollTop = 0;
        aboutButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        var rest = open ? T.chipBg : 'transparent';
        aboutButton.style.background = rest;
        aboutButton.style.borderColor = open ? T.accent : T.border;
        aboutButton.style.color = open ? T.accentText : T.muted;
        // Re-bound rather than set once, or leaving the button while the
        // popover is open would reset it to transparent and lose the tint -
        // the same trap paintRow avoids for a lit tool row.
        hover(aboutButton, rest, open ? T.chipBg : T.hover);
      },

      // The pane header. Every render sets it, so a title left over from the
      // previous tool can never sit above a different listing.
      //
      // It repaints the trail and the sentence rather than clearing them: a
      // tool sets those once, at the click, and then calls setTitle several
      // times as it goes - "Reading fields..." and then the listing - and the
      // trail has to survive that. Whatever ends a tool's turn on the pane
      // (releaseDisplay, an error) clears the context instead.
      setTitle: function (title, metaText) {
        resultTitle.textContent = title || '';
        resultTitle.title = title || '';
        resultMeta.textContent = metaText || '';
        resultTools.textContent = '';
        resultAside.textContent = '';
        resultAside.style.display = 'none';
        output.scrollTop = 0;
        ui.foot('');
        paintContext();
      },

      // Where this pane sits and what it is showing. Items are strings, or
      // { label: ..., go: ... } where go is what to do when the crumb is
      // clicked. Back is drawn from the last clickable ancestor, so a view
      // declares where it sits and gets the way out of it for free rather than
      // building its own - and the way out is always in the same place.
      context: function (items, note) {
        contextTrail = items && items.length ? items : null;
        contextNote = note || '';
        paintContext();
      },
      trailText: function () { return resultCrumbs.textContent; },
      noteText: function () { return resultNote.textContent; },
      // Set on its own by the views that re-count as you filter them, without
      // disturbing the title or the controls beside it.
      resultMetaText: function (metaText) {
        resultMeta.textContent = metaText || '';
      },
      titleText: function () { return resultTitle.textContent; },
      metaText: function () { return resultMeta.textContent; },
      aside: function (node) {
        resultAside.appendChild(node);
        resultAside.style.display = 'block';
        return node;
      },
      foot: function (text) {
        resultFoot.textContent = text || '';
        resultFoot.style.display = text ? 'block' : 'none';
      },
      // Five seconds from when it was said, and nothing takes it away early.
      // refreshRecord used to clear the note on every click, so "Copied to
      // clipboard." disappeared the moment you touched anything else - often
      // before it had been read. A later message replaces this one and starts
      // its own five seconds; nothing else stops the clock.
      note: function (text) {
        if (noteTimer) { win.clearTimeout(noteTimer); noteTimer = null; }
        note.textContent = text || '';
        note.style.display = text ? 'block' : 'none';
        if (!text) return;
        noteTimer = win.setTimeout(function () {
          noteTimer = null;
          note.textContent = '';
          note.style.display = 'none';
        }, NOTE_LIFE);
      },
      // host is the organisation URL with the scheme stripped, because
      // "https://" is the eleven characters of it that never tell you
      // anything. connected is whether a Dynamics client answered on this page.
      environment: function (host, connected) {
        envText.textContent = host || 'not connected';
        envPill.title = host
          ? (connected ? 'Connected to ' + host : host)
          : 'No Dynamics 365 client on this page';
        envPip.style.background = connected ? T.live : T.control;
        envPill.style.background = connected ? T.liveBg : 'transparent';
        envPill.style.borderColor = connected ? T.liveBorder : 'transparent';
        envPill.style.color = connected ? T.live : T.muted;
      },
      identify: function (name, roles) {
        var list = roles || [];
        // A deployment that does not hand back a user name gets the roles on
        // their own rather than an initials circle reading "?".
        userRow.style.display = name ? 'flex' : 'none';
        avatar.textContent = initials(name);
        userName.textContent = name || '';
        userName.title = name || '';
        roleRow.textContent = '';
        // System Administrator leads and is the only tinted chip: it is the
        // role the whole authorisation position rests on. The rest are plain
        // outlines, and every one of them is shown in full - the wrap is what
        // the sidebar was chosen for. ROLE_CHIP_LIMIT is a guard against a
        // service account with forty roles pushing the tools off screen, not
        // a display choice, so the overflow chip carries the rest on hover.
        list.slice(0, ROLE_CHIP_LIMIT).forEach(function (role, i) {
          var chip = el(doc, 'span', {
            padding: '3px 8px',
            borderRadius: '4px',
            font: '11.5px ' + T.monoFamily,
            boxSizing: 'border-box',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            border: '1px solid ' + (i === 0 ? 'transparent' : T.border),
            background: i === 0 ? T.chipBg : 'transparent',
            color: i === 0 ? T.accentSoft : T.muted
          }, role);
          chip.title = role;
          roleRow.appendChild(chip);
        });
        if (list.length > ROLE_CHIP_LIMIT) {
          var rest = list.slice(ROLE_CHIP_LIMIT);
          var extra = el(doc, 'span', {
            padding: '3px 8px',
            borderRadius: '4px',
            font: '11.5px ' + T.monoFamily,
            border: '1px solid ' + T.border,
            color: T.muted
          }, '+' + rest.length + ' more');
          extra.title = rest.join(', ');
          roleRow.appendChild(extra);
        }
        roleRow.style.display = list.length ? 'flex' : 'none';
        identity.style.display = (name || list.length) ? 'flex' : 'none';
      }
    };

    aboutButton.onclick = function () { ui.showAbout(); };

    // The three things a custom property cannot carry: the two pieces of logo
    // artwork, and which side of the theme switch is raised.
    function paintTheme(name) {
      headerLockup.mark.setTheme(name);
      aboutTitle.mark.setTheme(name);
      themeSwitch.paint(name);
    }
    paintTheme(theme);
    ui.showAbout(false);

    applyGeometry(ui);
    makeDraggable(ui);
    makeResizable(ui);
    return ui;
  }

  /* ------------------------------------------------------- drag / resize --- */

  function viewport(win) {
    return {
      width: (win.innerWidth || 1280),
      height: (win.innerHeight || 800)
    };
  }

  function clamp(value, low, high) {
    if (high < low) return low;
    return Math.max(low, Math.min(high, value));
  }

  // How close to the right edge a released drag has to land to snap back into
  // the dock. Wide enough to hit without aiming, narrow enough that a panel
  // parked near the edge on purpose stays where it was put.
  var DOCK_SNAP = 32;

  // One function decides where the panel is, from three pieces of state: the
  // window mode, whether it is docked, and the size and position a drag left
  // behind. Everything that moves the panel writes that state and calls
  // applyGeometry, so there is one place that turns state into pixels.
  function geometryFor(win, store, mode) {
    var v = viewport(win);
    // No window state puts the panel against a viewport edge. The inset is
    // what the shadow needs to read as a shadow rather than as a hard border,
    // and it is why the panel is rounded on all four corners now instead of
    // squaring off whichever side it was flush with.
    var inset = insetFor(v);
    var room = { width: Math.max(T.minWidth, v.width - inset * 2),
      height: Math.max(T.minHeight, v.height - inset * 2) };
    if (mode === 'max') {
      return { left: inset, top: inset, width: room.width, height: room.height };
    }
    var width = clamp((store.panelSize && store.panelSize.width) || T.width,
      T.minWidth, room.width);
    var g;
    if (store.docked !== false) {
      // Full height unless a grip has set one. The dock was full height by
      // definition up to v2.2.2, which left the bottom-left grip doing half
      // its job while docked - it could set the width and not the height,
      // which is not what a corner grip looks like it does.
      g = { left: Math.max(inset, v.width - width - inset), top: inset,
        width: width,
        height: store.dockedHeight
          ? clamp(store.dockedHeight, T.minHeight, room.height)
          : room.height };
    } else {
      var height = clamp((store.panelSize && store.panelSize.height) || Math.min(T.height, v.height),
        T.minHeight, room.height);
      var pos = store.panelPos || { left: v.width - width - T.offset, top: T.offset };
      g = {
        left: clamp(pos.left, inset, Math.max(inset, v.width - width - inset)),
        top: clamp(pos.top, inset, Math.max(inset, v.height - height - inset)),
        width: width,
        height: height
      };
    }
    if (mode === 'min') {
      // The header and its two borders, so the collapsed strip is exactly the
      // bar and nothing else.
      g.height = T.headerHeight + 2;
      // And half the width, anchored on the top right corner of where the
      // open panel was. Collapsed is meant to say "still here" without taking
      // the form's room, and a full width bar says the opposite. The right
      // edge is what holds still because that is the edge the panel docks to
      // and the edge the window controls sit on - shrinking towards the left
      // would walk the close button across the screen every time.
      var right = g.left + g.width;
      g.width = miniWidth(g.width);
      g.left = clamp(right - g.width, inset, Math.max(inset, v.width - g.width - inset));
      g.top = clamp(g.top, inset, Math.max(inset, v.height - g.height - inset));
    }
    return g;
  }

  // The collapsed width for a panel of this open width. Its own floor rather
  // than T.minWidth: T.minWidth is what the two columns need, and the
  // collapsed bar has no columns.
  function miniWidth(openWidth) {
    return clamp(Math.round(openWidth * T.miniScale),
      Math.min(T.miniMinWidth, openWidth), openWidth);
  }

  // The inset shrinks on a small viewport rather than eating a fixed 32px of
  // a 420px-tall window. It is read in three places - the geometry, the dock
  // snap and the drag clamp - so it is one function rather than three copies.
  function insetFor(v) {
    return Math.max(0, Math.min(T.dockInset, Math.floor(Math.min(v.width, v.height) / 12)));
  }

  function applyGeometry(ui) {
    var g = geometryFor(ui.win, ui.store, ui.mode);
    ui.panel.style.left = g.left + 'px';
    ui.panel.style.top = g.top + 'px';
    ui.panel.style.width = g.width + 'px';
    ui.panel.style.height = g.height + 'px';

    var mini = ui.mode === 'min';
    var maxed = ui.mode === 'max';

    ui.body.style.display = mini ? 'none' : 'flex';
    // Rounded in every state now. Up to v2.2.1 a docked or maximised panel
    // squared off the edges it was flush with; nothing is flush any more, so
    // there is no edge to square off against.
    ui.panel.style.borderRadius = T.radius;
    ui.grip.style.display = mini ? 'none' : 'block';
    ui.gripLeft.style.display = mini ? 'none' : 'block';
    // About and the theme switch go with the body. Neither of them acts on
    // anything you can see while the panel is a bar - About's popover has
    // nothing to hang under, and a theme is a choice about a panel that is
    // not on screen - and the bar is half width, so the room they take is the
    // room the tool's own name needs. What is left is the mark, the name and
    // the three window controls: enough to say the tool is still here and to
    // get it back.
    if (ui.aboutButton) ui.aboutButton.style.display = mini ? 'none' : 'flex';
    if (ui.themeSwitch) ui.themeSwitch.style.display = mini ? 'none' : 'flex';
    if (ui.maxButton) {
      ui.maxButton.title = maxed ? 'Restore the panel size' : 'Grow the panel over the form';
      ui.maxButton.setAttribute('aria-pressed', maxed ? 'true' : 'false');
      ui.maxButton.textContent = '';
      ui.maxButton.appendChild(svg(ui.doc, maxed ? ICON.restore : ICON.expand, 13));
    }
    if (ui.minButton) {
      ui.minButton.title = mini ? 'Expand the panel' : 'Collapse to the header';
      ui.minButton.setAttribute('aria-pressed', mini ? 'true' : 'false');
      // The icon flips too, the same way maximise does. A single rule in both
      // states said "collapse" twice, so a collapsed panel gave no sign that
      // the button now does the opposite.
      ui.minButton.textContent = '';
      ui.minButton.appendChild(svg(ui.doc, mini ? ICON.reopen : ICON.collapse, 13));
    }
    // A popover anchored under the header has nothing to sit against once the
    // panel is a bare header, so it closes with the panel.
    if (mini) ui.showAbout(false);
    return g;
  }

  // A transparent sheet over the whole viewport while a drag is running. The
  // form is full of iframes, and without this the pointer crossing one takes
  // the mousemove stream with it and the panel sticks mid-drag.
  function dragShield(ui, cursor) {
    var shield = el(ui.doc, 'div', {
      position: 'fixed',
      left: '0', top: '0', right: '0', bottom: '0',
      zIndex: '2147483646',
      cursor: cursor,
      background: 'transparent'
    });
    ui.doc.body.appendChild(shield);
    return shield;
  }

  function onDrag(ui, handle, cursor, start) {
    handle.onmousedown = function (e) {
      if (e.button) return;
      e.preventDefault();
      var from = start(e);
      if (!from) return;
      var shield = dragShield(ui, cursor);

      function move(ev) { from.move(ev); }
      function up() {
        ui.doc.removeEventListener('mousemove', move, true);
        ui.doc.removeEventListener('mouseup', up, true);
        if (shield.parentNode) shield.parentNode.removeChild(shield);
        from.done();
      }
      ui.doc.addEventListener('mousemove', move, true);
      ui.doc.addEventListener('mouseup', up, true);
    };
  }

  // The current rendered box, which is the honest starting point for a drag
  // whatever mode the panel is in.
  function panelBox(ui) {
    return {
      left: parseFloat(ui.panel.style.left) || 0,
      top: parseFloat(ui.panel.style.top) || 0,
      width: ui.panel.offsetWidth || parseFloat(ui.panel.style.width) || T.width,
      height: ui.panel.offsetHeight || parseFloat(ui.panel.style.height) || T.height
    };
  }

  // The header is the drag handle and it is also full of controls. A mousedown
  // on one of them bubbles up to here, so a press on About or the theme switch
  // would otherwise start a drag - and because starting a drag undocks the
  // panel, clicking a button would have moved the window.
  function insideControl(node, stop) {
    while (node && node !== stop) {
      var tag = node.tagName ? String(node.tagName).toLowerCase() : '';
      if (tag === 'button' || tag === 'input' || tag === 'a') return true;
      node = node.parentNode;
    }
    return false;
  }

  // Dragging the header undocks the panel, and dropping it back against the
  // right edge re-docks it. Maximised, the header does not drag at all -
  // there is nowhere for a full viewport panel to go.
  function makeDraggable(ui) {
    onDrag(ui, ui.header, 'move', function (e) {
      if (ui.mode === 'max') return null;
      if (insideControl(e.target, ui.header)) return null;
      var startX = e.clientX;
      var startY = e.clientY;
      var box = panelBox(ui);
      // What the panel would be if it were open. Dragging a collapsed bar
      // must not shrink the panel behind it: the stored size and position are
      // always the open panel's, and the bar is derived from them, so the drag
      // records the open geometry and converts the pointer back into it.
      var open = geometryFor(ui.win, ui.store, 'open');
      // How far the bar sits right of where the open panel's left edge would
      // be. Zero unless collapsed, because collapsing holds the right edge
      // still and takes the width off the left.
      var shift = ui.mode === 'min' ? open.width - box.width : 0;
      // Undocking happens on the first actual movement, not on the press. A
      // press that never moves is a click, and a click must not rearrange the
      // window.
      var moved = false;
      return {
        move: function (ev) {
          var v = viewport(ui.win);
          if (!moved) {
            if (ev.clientX === startX && ev.clientY === startY) return;
            moved = true;
            // Undocking has to record the height the dock was giving it, or
            // the floating panel would fall back to the default and jump.
            ui.store.panelSize = { width: open.width, height: open.height };
            ui.store.docked = false;
          }
          ui.store.panelPos = {
            left: clamp(box.left + (ev.clientX - startX), 0, Math.max(0, v.width - box.width)) - shift,
            top: clamp(box.top + (ev.clientY - startY), 0, Math.max(0, v.height - box.height))
          };
          applyGeometry(ui);
        },
        done: function () {
          if (!moved) return;
          var v = viewport(ui.win);
          var pos = ui.store.panelPos || { left: 0, top: 0 };
          // Measured against where the dock actually puts the right edge,
          // which is one inset in from the viewport, not on it. The right edge
          // is the bar's own while collapsed, which is the edge the pointer
          // was pushing towards.
          if (pos.left + shift + box.width >= v.width - insetFor(v) - DOCK_SNAP) {
            ui.store.docked = true;
            applyGeometry(ui);
          }
        }
      };
    });
  }

  function makeResizable(ui) {
    // Bottom right: width and height, top left corner pinned. A docked panel
    // cannot be resized this way without leaving the dock, so it undocks.
    onDrag(ui, ui.grip, 'nwse-resize', function (e) {
      if (ui.mode === 'max') return null;
      var startX = e.clientX;
      var startY = e.clientY;
      var box = panelBox(ui);
      var moved = false;
      return {
        move: function (ev) {
          var v = viewport(ui.win);
          if (!moved) {
            if (ev.clientX === startX && ev.clientY === startY) return;
            moved = true;
            ui.store.docked = false;
            ui.store.panelPos = { left: box.left, top: box.top };
          }
          ui.store.panelSize = {
            width: clamp(box.width + (ev.clientX - startX), T.minWidth,
              Math.max(T.minWidth, v.width - box.left)),
            height: clamp(box.height + (ev.clientY - startY), T.minHeight,
              Math.max(T.minHeight, v.height - box.top))
          };
          applyGeometry(ui);
        },
        done: function () { /* state is already written */ }
      };
    });

    // Bottom left: the left and bottom edges, with the right edge pinned. That
    // is the whole difference from the other grip - this one keeps the right
    // edge, so it is the grip that resizes a panel without taking it out of
    // the dock. Up to v2.2.2 it also refused to change the height while
    // docked, because the dock was full height by definition; the dock carries
    // a height now, so both edges move in both states.
    onDrag(ui, ui.gripLeft, 'nesw-resize', function (e) {
      if (ui.mode === 'max') return null;
      var startX = e.clientX;
      var startY = e.clientY;
      var box = panelBox(ui);
      var right = box.left + box.width;
      var docked = ui.store.docked !== false;
      if (!ui.store.panelPos) ui.store.panelPos = { left: box.left, top: box.top };
      return {
        move: function (ev) {
          var v = viewport(ui.win);
          var inset = insetFor(v);
          var width = clamp(box.width - (ev.clientX - startX), T.minWidth,
            Math.max(T.minWidth, right - inset));
          var height = clamp(box.height + (ev.clientY - startY), T.minHeight,
            Math.max(T.minHeight, v.height - inset - box.top));
          // A docked panel keeps its height on its own key. panelSize.height
          // is the FLOATING height, so it is left alone while docked -
          // otherwise undocking would jump to whatever the dock was last
          // dragged to. The width is shared: it is the same width either way.
          if (docked) {
            ui.store.panelSize = {
              width: width,
              height: (ui.store.panelSize && ui.store.panelSize.height) || box.height
            };
            ui.store.dockedHeight = height;
          } else {
            ui.store.panelSize = { width: width, height: height };
            ui.store.panelPos = { left: right - width, top: box.top };
          }
          applyGeometry(ui);
        },
        done: function () { /* state is already written */ }
      };
    });
  }

  /* ----------------------------------------------------------- tool rows --- */

  // A section of the sidebar rather than the bordered card the panel used up
  // to v2.1.9. The sidebar is one narrow column now, so a border round each
  // group only ate width; the small caps heading and the hairline between
  // sections carry the separation instead.
  //
  // The two sections behave differently - Change the form is multi-select and
  // acts on the form, Inspect is single-select and drives the one results pane
  // - and the controls themselves are what say so: switches for the first,
  // radios for the second. A running count of how many switches were on was
  // tried at v2.0.2 and dropped, and the sentence that replaced it went the
  // same way at v2.2.2, so a section heading is now a heading and nothing
  // else. There is no hint slot to put one back into.
  function addPanel(ui, title) {
    var wrap = el(ui.doc, 'div', {
      flex: 'none',
      display: 'flex',
      flexDirection: 'column',
      // A rule above every section but the first, so the sidebar reads as two
      // groups without either of them being boxed.
      borderTop: ui.tools.childNodes.length ? '1px solid ' + T.line : '0'
    });
    wrap.setAttribute('data-oliver4-region', 'section-' + title.toLowerCase().replace(/[^a-z]+/g, '-'));

    var head = el(ui.doc, 'div', {
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px',
      padding: '13px 14px 6px'
    });
    head.appendChild(el(ui.doc, 'div', {
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: T.muted,
      whiteSpace: 'nowrap'
    }, title));

    // One column. The two column grid belonged to a full width panel; in a
    // 296px sidebar a second column would truncate every label.
    var grid = el(ui.doc, 'div', {
      display: 'flex',
      flexDirection: 'column',
      gap: '1px',
      padding: '0 8px 12px'
    });

    wrap.appendChild(head);
    wrap.appendChild(grid);
    ui.tools.appendChild(wrap);
    return { wrap: wrap, grid: grid };
  }

  // Shared chrome for both kinds of row: a full width button carrying an
  // indicator, a label and an optional trailing value.
  function toolRow(ui, grid, label) {
    var row = el(ui.doc, 'button', {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      width: '100%',
      minHeight: '36px',
      padding: '6px 9px',
      background: 'transparent',
      border: '0',
      borderRadius: T.radiusInner,
      boxShadow: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      font: T.font,
      color: T.text
    });
    row.type = 'button';
    row.title = label;
    // A stable handle on the row. Matching on textContent is not a safe way to
    // find one - in a test or anywhere else - because the visible text is the
    // label plus whatever else the row happens to render.
    row.setAttribute('data-oliver4-tool', label);
    grid.appendChild(row);
    ui.buttons.push(row);
    return row;
  }

  function rowLabel(ui, row, label) {
    var text = el(ui.doc, 'span', {
      flex: '1', minWidth: '0', fontSize: '15px', color: T.text,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
    }, label);
    row.appendChild(text);
    row.labelNode = text;
    return text;
  }

  // Lit row treatment, shared so a switch and a radio read as the same kind of
  // "on": a blue tint with a 2px bar down the left edge.
  function paintRow(row, on) {
    row.style.background = on ? row.onTint : 'transparent';
    row.style.boxShadow = on ? 'inset 2px 0 0 ' + T.accentText : 'none';
    // A switch and a radio are different promises to a screen reader: several
    // switches can be on at once, only one radio in the group can be.
    row.setAttribute(row.isRadio ? 'aria-checked' : 'aria-pressed', on ? 'true' : 'false');
    if (row.labelNode) row.labelNode.style.color = on ? T.bright : T.text;
    if (row.iconNode) row.iconNode.style.color = on ? T.accentText : T.muted;
    hover(row, on ? row.onTint : 'transparent', on ? row.onTint : T.hover);
  }

  // Change the form. The switch carries the state; the label never changes, so
  // the row reads the same whether it is on or off.
  function addSwitchRow(ui, grid, label, icon, handler) {
    var row = toolRow(ui, grid, label);
    row.onTint = T.accentTint;

    var iconWrap = el(ui.doc, 'span', { display: 'flex', color: T.muted, flex: 'none' });
    iconWrap.appendChild(svg(ui.doc, icon, 16));
    row.appendChild(iconWrap);
    row.iconNode = iconWrap;

    rowLabel(ui, row, label);

    var track = el(ui.doc, 'span', {
      position: 'relative',
      flex: 'none',
      width: '30px',
      height: '17px',
      borderRadius: '9px',
      background: T.track
    });
    var knob = el(ui.doc, 'span', {
      position: 'absolute',
      top: '2px',
      left: '2px',
      width: '13px',
      height: '13px',
      borderRadius: '7px',
      background: T.onAccent,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
      transition: 'left 0.12s ease, background 0.12s ease'
    });
    track.appendChild(knob);
    row.appendChild(track);

    row.setAttribute('role', 'switch');
    row.setState = function (on) {
      track.style.background = on ? T.accent : T.track;
      knob.style.left = on ? '15px' : '2px';
      paintRow(row, on);
    };
    row.setState(false);
    row.onclick = handler;
    return row;
  }

  // Inspect. A radio, because only one of these can be showing at a time and a
  // radio is the control that says so before you click it.
  function addRadioRow(ui, grid, label, handler) {
    var row = toolRow(ui, grid, label);
    row.onTint = T.accentTintStrong;

    var dot = el(ui.doc, 'span', {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none',
      width: '15px',
      height: '15px',
      borderRadius: '8px',
      border: '1px solid ' + T.radioOff,
      boxSizing: 'border-box'
    });
    var pip = el(ui.doc, 'span', {
      width: '7px', height: '7px', borderRadius: '4px', background: 'transparent'
    });
    dot.appendChild(pip);
    row.appendChild(dot);

    rowLabel(ui, row, label);

    row.isRadio = true;
    row.setAttribute('role', 'radio');
    row.setState = function (on) {
      dot.style.borderColor = on ? T.accentText : T.radioOff;
      pip.style.background = on ? T.accentText : 'transparent';
      paintRow(row, on);
    };
    row.setState(false);
    row.onclick = handler;
    return row;
  }

  // Greys out every control. The handlers check authorisation too, so
  // re-enabling a button through the DOM does not get anyone anywhere.
  function setEnabled(ui, on) {
    ui.buttons.forEach(function (b) {
      b.disabled = !on;
      b.style.opacity = on ? '1' : '0.4';
      b.style.cursor = on ? 'pointer' : 'not-allowed';
    });
  }

  /* -------------------------------------------------------- result views --- */

  // Errors get a red tinted block with a warning icon, so they are not mistaken
  // for the ordinary status text.
  function fail(ui, text, title) {
    // An error replaces the output, so a lit inspector would be claiming to
    // show a listing that is no longer there, and anything still in flight
    // must not write its answer over the top of the error.
    releaseDisplay();
    claimResults();
    ui.setTitle(title || 'Problem', '');
    ui.output.textContent = '';

    var block = el(ui.doc, 'div', {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '10px 12px',
      background: T.dangerBg,
      border: '1px solid ' + T.dangerBorder,
      borderRadius: T.radiusInner,
      color: T.danger,
      lineHeight: '1.5'
    });

    var glyph = svg(ui.doc, ICON.warning, 15);
    glyph.style.marginTop = '2px';
    block.appendChild(glyph);

    // The title goes in the pane header rather than being repeated inside the
    // block, so an error reads as one message and not as two.
    block.appendChild(el(ui.doc, 'div', {}, text));

    ui.output.appendChild(block);
  }

  function deny(ui, reason) {
    setEnabled(ui, false);
    fail(ui, reason, 'Not available');
  }

  function say(ui, text) {
    ui.setTitle('', '');
    ui.output.textContent = '';
    ui.output.appendChild(el(ui.doc, 'div', { color: T.ink }, text));
  }

  // The row shape used by every listing: label on the left, value on the right
  // in mono, hairline between rows, empty values called out as empty rather
  // than left blank.
  function dataRow(ui, left, right, opts) {
    var options = opts || {};
    var row = el(ui.doc, 'div', {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      columnGap: '14px',
      alignItems: 'baseline',
      padding: '8px 0',
      // Under each row rather than over it, so a listing reads as rows with a
      // rule between them rather than as a rule followed by rows - and so it
      // matches the field list, which is built the same way.
      borderBottom: '1px solid ' + T.lineFaint
    });
    var label = el(ui.doc, 'div', {
      color: T.label,
      wordBreak: 'break-word',
      fontWeight: options.strong ? '700' : '400'
    }, '');
    if (typeof left === 'string') label.textContent = left;
    else label.appendChild(left);
    if (options.title) label.title = options.title;

    var value = el(ui.doc, 'div', {
      font: T.mono,
      color: options.empty ? T.empty : T.accentSoft,
      textAlign: 'right',
      wordBreak: 'break-word',
      fontWeight: options.strong ? '700' : '400'
    }, right === null || right === undefined ? '' : String(right));

    row.appendChild(label);
    row.appendChild(value);
    return row;
  }

  // One sentence per Inspect tool, in the words somebody would use to ask for
  // it rather than the words the API uses. Keyed on the row's own label, so a
  // tool added without one simply shows no sentence rather than the wrong one.
  var INSPECT_NOTES = {
    'All fields': 'Every column on this table with the value this record holds - not ' +
      'only the columns that are on the form. Select a row to see how a column is set up.',
    'Choice field values': 'Every choice column on this form, with the options behind ' +
      'it and the value each option stores.',
    'Related record count': 'How many records hang off this one, relationship by ' +
      'relationship. Useful before a delete, a merge or a migration check.',
    'Record properties': 'Who created this record and who changed it last, with the ' +
      'dates, and where it sits in its lifecycle.',
    'JavaScript libraries': 'The script files attached to this form. Select one to read it.',
    'Event handlers': 'The functions this form calls, what makes each one run, and which ' +
      'library it comes from.',
    'Business rules': 'The business rules on this table, and whether each one is ' +
      'switched on.',
    Performance: 'Ways to measure how this page loads, using Microsoft\'s own tools.'
  };

  var FIELD_NOTE = 'How this column is set up on the table, and what the form is doing ' +
    'with it right now.';
  var LIBRARY_NOTE = 'The script exactly as it is stored in this environment.';

  // The trail for a tool sitting directly under Inspect. Inspect itself is not
  // clickable: the sidebar is always on screen, so there is nothing to go back
  // to and a crumb that did nothing would be worse than a plain label.
  function inspectTrail(label) {
    return [{ label: 'Inspect' }, { label: label }];
  }

  function nothing(ui, text) {
    return el(ui.doc, 'div', { color: T.ink, padding: '6px 0' }, text || 'Nothing to show.');
  }

  function rows(ui, pairs, heading, metaText) {
    ui.setTitle(heading || '', metaText || '');
    ui.output.textContent = '';
    if (!pairs.length) {
      ui.output.appendChild(nothing(ui));
      return;
    }
    var list = el(ui.doc, 'div', {});
    pairs.forEach(function (pair) {
      list.appendChild(dataRow(ui, pair[0], pair[1], { empty: !pair[1] }));
    });
    ui.output.appendChild(list);
  }

  // Rows grouped under a sub-heading, for output that is a list per column.
  function groups(ui, list, heading) {
    ui.setTitle(heading || '', '');
    ui.output.textContent = '';
    if (!list.length) {
      ui.output.appendChild(nothing(ui));
      return;
    }
    list.forEach(function (group, index) {
      var head = el(ui.doc, 'div', {
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px',
        flexWrap: 'wrap',
        fontSize: '15px',
        fontWeight: '600',
        color: T.text,
        marginTop: index ? '18px' : '10px',
        marginBottom: '3px'
      });
      // A group title is "Display name  [schemaname]". The schema name is a
      // token you would paste into a query, so it is split back out and given
      // the same chip treatment the table name gets in the record row rather
      // than being left as part of the sentence.
      var parts = SCHEMA_SUFFIX.exec(group.title);
      if (parts) {
        head.appendChild(el(ui.doc, 'span', {},
          group.title.replace(SCHEMA_SUFFIX, '').trim()));
        head.appendChild(el(ui.doc, 'span', {
          font: T.monoSmall,
          fontWeight: '400',
          color: T.accentSoft,
          background: T.chipBg,
          padding: '2px 6px',
          borderRadius: '4px'
        }, parts[1]));
      } else {
        head.appendChild(el(ui.doc, 'span', {}, group.title));
      }
      ui.output.appendChild(head);
      var body = el(ui.doc, 'div', {});
      group.pairs.forEach(function (pair) {
        body.appendChild(dataRow(ui, pair[0], pair[1], { empty: !pair[1] }));
      });
      ui.output.appendChild(body);
    });
  }

  // Output meant to be read here or taken elsewhere. The list view is laid out
  // like the other listings - label left, value right - and the JSON view is
  // for pasting into code. Copy takes whichever view is showing.
  //
  // The list view also has a filter box. It belongs to that view only: the JSON
  // view is for pasting a complete record definition elsewhere, so narrowing it
  // would quietly hand over a partial one. Copy follows whatever is on screen.
  function fieldLabel(item) {
    return item.display ? item.display + '  [' + item.logical + ']' : item.logical;
  }

  function fieldList(items) {
    return items.map(function (i) {
      return fieldLabel(i) + ' = ' + (i.value === null ? '(empty)' : i.value);
    }).join('\n');
  }

  function fieldJson(items) {
    var map = {};
    items.forEach(function (i) {
      map[i.logical] = { displayName: i.display || null, type: i.type || null, value: i.value };
    });
    return JSON.stringify(map, null, 2);
  }

  // Quoted only where it has to be, so a file of short values stays readable
  // opened in anything other than a spreadsheet.
  function csvCell(value) {
    var text = value === null || value === undefined ? '' : String(value);
    return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function fieldCsv(items) {
    var lines = [['Display name', 'Schema name', 'Type', 'Value'].join(',')];
    items.forEach(function (i) {
      lines.push([csvCell(i.display), csvCell(i.logical), csvCell(i.type),
        csvCell(i.value === null ? '' : i.value)].join(','));
    });
    return lines.join('\r\n');
  }

  // The one file the toolkit writes, and only when asked. A Blob and an
  // object URL - no network request, nothing uploaded, and the URL is revoked
  // straight after. There is no way to observe whether the browser actually
  // saved the file, so nothing here claims it did: an exception reports
  // "blocked" and a clean run says nothing, leaving the browser's own download
  // indicator to be the confirmation.
  function downloadText(win, filename, text, mime) {
    var doc = win.document;
    // A byte order mark, so Excel opens it as UTF-8 rather than as the local
    // code page and turns every accented name into mojibake.
    var blob = new win.Blob(['\ufeff' + text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var url = win.URL.createObjectURL(blob);
    var link = doc.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    doc.body.appendChild(link);
    link.click();
    doc.body.removeChild(link);
    win.setTimeout(function () {
      try { win.URL.revokeObjectURL(url); } catch (e) { /* already gone */ }
    }, 1000);
  }

  // Matched on both names, which is what the row shows. Typing "case" finds it
  // by display name and typing "ticketnumber" finds the same field by its
  // logical name, so neither has to be the one you happen to know.
  function matchesFilter(item, needle) {
    if (item.display && item.display.toLowerCase().indexOf(needle) > -1) return true;
    return !!item.logical && item.logical.toLowerCase().indexOf(needle) > -1;
  }

  // A pill toggle, used for the two scope chips over the field list. Not a
  // segmented group: these two are alternative scopes over the same list, and
  // a filled pill says "this is what you are looking at" more plainly at the
  // size the row allows.
  function scopeChip(doc, label, handler) {
    var b = el(doc, 'button', {
      padding: '5px 12px',
      borderRadius: '14px',
      border: '1px solid ' + T.border,
      background: 'transparent',
      color: T.muted,
      cursor: 'pointer',
      font: T.font,
      fontSize: '12px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      flex: 'none'
    }, label);
    b.type = 'button';
    b.setState = function (on) {
      b.style.background = on ? T.accent : 'transparent';
      b.style.borderColor = on ? T.accent : T.border;
      b.style.color = on ? T.onAccent : T.muted;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    };
    b.onclick = handler;
    return b;
  }

  // A heading inside the results pane: the label in the accent colour with a
  // rule running out from it to the pane's edge, which is the same idiom the
  // About popover uses for its notices. It was a small grey line up to v2.2.5
  // and it did not read as a heading - the two halves of a column definition
  // ran together as one list of pairs.
  function sectionHeading(ui, text, first) {
    var wrap = el(ui.doc, 'div', {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      margin: first ? '2px 0 4px' : '24px 0 4px'
    });
    wrap.setAttribute('data-oliver4-region', 'section-heading');
    wrap.appendChild(el(ui.doc, 'div', {
      font: '12.5px ' + T.monoFamily,
      fontWeight: '700',
      letterSpacing: '0.09em',
      color: T.accentText,
      flex: 'none'
    }, text.toUpperCase()));
    wrap.appendChild(el(ui.doc, 'div', {
      height: '1px', background: T.line, flex: '1'
    }));
    return wrap;
  }

  // One column, in full. It fills the results pane rather than opening under
  // its row - see section 5. It draws saying only what it is doing: the
  // definition is one request, and drawing the half that needs no request
  // first would put two states of the same column on screen a second apart.
  //
  // Two guards decide whether the answer is allowed to land. active() is the
  // pane level one every listing uses - another Inspect row may have been
  // clicked while this was in flight. box.parentNode is the view level one:
  // if the pane has gone back to the list, or on to another column, the block
  // this is writing into is no longer in the document.
  function fieldDetailBlock(ui, xrm, item, table, cache, active) {
    var box = el(ui.doc, 'div', { padding: '2px 0 14px' });
    box.setAttribute('data-oliver4-region', 'field-detail-' + item.logical);

    // The value the row was showing. The pane it came from is gone, so it
    // leads the view rather than being something you go back for.
    function valueBlock() {
      var empty = item.value === null;
      var wrap = el(ui.doc, 'div', {
        padding: '10px 12px',
        marginBottom: '6px',
        background: empty ? 'transparent' : T.accentTint,
        border: '1px solid ' + (empty ? T.lineFaint : T.accentTintStrong),
        borderRadius: T.radiusInner
      });
      wrap.setAttribute('data-oliver4-region', 'field-value');
      wrap.appendChild(el(ui.doc, 'div', {
        font: T.monoTiny, color: T.muted, letterSpacing: '0.06em', marginBottom: '4px'
      }, 'VALUE ON THIS RECORD'));
      wrap.appendChild(el(ui.doc, 'div', {
        font: T.mono,
        lineHeight: '1.5',
        color: empty ? T.empty : T.accentSoft,
        whiteSpace: 'normal',
        overflowWrap: 'anywhere',
        userSelect: 'text'
      }, empty ? 'empty' : item.value));
      return wrap;
    }

    function pairsInto(node, pairs) {
      pairs.forEach(function (pair) {
        node.appendChild(dataRow(ui, pair[0], pair[1], { empty: !pair[1] }));
      });
    }

    function draw(pairs) {
      box.textContent = '';

      var text = [];
      box.appendChild(valueBlock());

      var body = el(ui.doc, 'div', {});
      if (pairs.length) {
        body.appendChild(sectionHeading(ui, 'On the table', true));
        pairsInto(body, pairs);
        pairs.forEach(function (pair) { text.push(pair[0] + ': ' + pair[1]); });
      }

      // Read at draw time, not at request time, so it describes the form as it
      // stands rather than as it was when the request went out.
      var formPairs = formFieldPairs(xrm, item.logical);
      body.appendChild(sectionHeading(ui, 'On this form', !pairs.length));
      if (formPairs && formPairs.length) {
        pairsInto(body, formPairs);
        text.push('');
        text.push('On this form');
        formPairs.forEach(function (pair) { text.push(pair[0] + ': ' + pair[1]); });
      } else {
        // Not a failure. Show all fields lists every column on the table, and
        // most of them are not on any given form.
        body.appendChild(el(ui.doc, 'div', {
          color: T.empty, padding: '8px 0'
        }, 'This column is not on the form that is open.'));
        text.push('');
        text.push('Not on this form.');
      }
      box.appendChild(body);

      // The copy chip belongs to the pane header now, beside back, rather than
      // floating over the first heading. It is handed the text here because
      // this is the only place that knows what was drawn.
      box.copyText = (item.display ? item.display + '  ' : '') +
        '[' + item.logical + ']\n' +
        'Value: ' + (item.value === null ? '(empty)' : item.value) + '\n' +
        text.join('\n');
      if (box.onCopyReady) box.onCopyReady(box.copyText);
    }

    if (cache[item.logical]) {
      draw(cache[item.logical]);
      return box;
    }

    box.appendChild(valueBlock());
    box.appendChild(el(ui.doc, 'div', { color: T.ink, padding: '8px 0' },
      'Reading the column definition...'));

    attributeDetail(xrm, table, item.logical, item.raw).then(function (data) {
      if (!active() || !box.parentNode) return;
      var pairs = detailPairs(data || {});
      // Only the definition is cached. The form state beside it is read again
      // every time the row is drawn, because it is the half that changes while
      // the panel is open.
      cache[item.logical] = pairs;
      draw(pairs);
    }, function (e) {
      if (!active() || !box.parentNode) return;
      box.textContent = '';
      box.appendChild(valueBlock());
      box.appendChild(el(ui.doc, 'div', { color: T.danger, padding: '8px 0' },
        'Could not read the column definition' +
        (e && e.message ? ' - ' + e.message : '') + '.'));
      // The form half needs no request, so it is still worth showing.
      var formPairs = formFieldPairs(xrm, item.logical);
      if (formPairs && formPairs.length) {
        box.appendChild(sectionHeading(ui, 'On this form'));
        pairsInto(box, formPairs);
      }
    });

    return box;
  }

  function copyableList(ui, items, table, win, xrm, active) {
    var format = 'list';
    var filter = '';
    // 'all' or 'value'. It defaulted to all up to v2.2.6 so that a narrowed
    // count could not be mistaken for the whole table at first sight. It
    // defaults to With value now, on the user's call: the fields this record
    // actually holds are what the listing is opened for, and a table like
    // Incident buries them among two hundred empty ones. What protected the
    // count still does - the heading and the foot both read "N of M fields on
    // <table>" the moment anything narrows the list, so the pane says it is
    // narrowed before you read a single row.
    var scope = 'value';
    // Which of the two views the pane is showing: the list, or one column in
    // full. A definition runs to twenty rows and reads as a document, so it
    // takes the pane rather than opening inside the listing - see section 5.
    var view = 'list';
    // Where the list was scrolled to when a column was opened, so going back
    // returns you to the row you clicked rather than to the top.
    var listScroll = 0;
    // Definitions already read, by logical name. Collapsing and reopening a
    // row costs nothing the second time, and switching view or filtering does
    // not re-request what is already held.
    var detailCache = {};
    // A listing rendered without one - a test driving the view directly - is
    // still allowed to write, rather than throwing on a guard that is not there.
    var isActive = typeof active === 'function' ? active : function () { return true; };

    var withValues = items.filter(function (i) { return i.value !== null; }).length;

    // The filter and the scope are list view controls. In JSON view both are
    // hidden and ignored, and the typed text is kept so switching back
    // restores the same view.
    function visible() {
      if (format === 'json') return items;
      var needle = filter.trim().toLowerCase();
      return items.filter(function (i) {
        if (scope === 'value' && i.value === null) return false;
        return !needle || matchesFilter(i, needle);
      });
    }

    function text() {
      return format === 'json' ? fieldJson(items) : fieldList(visible());
    }

    ui.setTitle('All fields', '');

    /* pane header controls - the view switch and the three ways of taking the
       listing elsewhere, all mono so they read as controls over data rather
       than as prose */

    var formatSwitch = segmentedPair(ui.doc, [
      { value: 'list', label: 'LIST', title: 'Show the list view' },
      { value: 'json', label: 'JSON',
        title: 'Show the JSON view - every field, for pasting elsewhere' }
    ], function (value) {
      if (format === value) return;
      format = value;
      filterWrap.style.display = value === 'json' ? 'none' : 'flex';
      formatSwitch.paint(format);
      render();
    }, true);
    formatSwitch.paint(format);
    ui.resultTools.appendChild(formatSwitch);

    var copyButton = chipButton(ui.doc, 'copy', 'Copy what is on screen');
    ui.resultTools.appendChild(copyButton);

    var csvButton = chipButton(ui.doc, 'CSV',
      'Download what is on screen as a CSV file');
    csvButton.insertBefore(svg(ui.doc, ICON.download, 12), csvButton.firstChild);
    ui.resultTools.appendChild(csvButton);

    /* filter and scope, above the listing rather than in the header, so the
       filter has the full width and the header keeps its controls */

    var filterWrap = el(ui.doc, 'div', {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 14px',
      borderBottom: '1px solid ' + T.lineFaint
    });

    var filterField = el(ui.doc, 'div', {
      position: 'relative', display: 'flex', alignItems: 'center',
      flex: '1', minWidth: '0'
    });

    // White in both themes, deliberately. It is the only thing in the panel
    // you type into, and on the dark surfaces a dark field read as more panel.
    var filterInput = el(ui.doc, 'input', {
      width: '100%',
      height: '32px',
      boxSizing: 'border-box',
      padding: '0 30px',
      background: T.inputBg,
      color: T.inputText,
      border: '1px solid ' + T.inputBorder,
      borderRadius: T.radiusInner,
      font: T.font,
      fontSize: '14px',
      outline: 'none'
    });
    filterInput.type = 'text';
    filterInput.placeholder = 'Filter by name or schema';
    filterInput.title = 'Filter the list by display name or logical name. Escape clears it.';
    filterInput.setAttribute('aria-label', 'Filter fields by display name or logical name');

    // Anything sitting inside the field takes the field's colours.
    var searchGlyph = el(ui.doc, 'span', {
      position: 'absolute',
      left: '9px',
      display: 'flex',
      color: T.inputText,
      opacity: '0.55',
      pointerEvents: 'none'
    });
    searchGlyph.appendChild(svg(ui.doc, ICON.search, 14));

    var clearFilter = el(ui.doc, 'button', {
      position: 'absolute',
      right: '5px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
      height: '20px',
      padding: '0',
      background: 'transparent',
      color: T.inputText,
      border: '0',
      borderRadius: '4px',
      cursor: 'pointer',
      visibility: 'hidden'
    });
    clearFilter.type = 'button';
    clearFilter.appendChild(svg(ui.doc, ICON.close, 14));
    clearFilter.title = 'Clear the filter';
    clearFilter.setAttribute('aria-label', 'Clear the filter');
    hover(clearFilter, 'transparent', T.inputHover);

    filterField.appendChild(searchGlyph);
    filterField.appendChild(filterInput);
    filterField.appendChild(clearFilter);
    filterWrap.appendChild(filterField);

    function setScope(next) {
      scope = next;
      allChip.setState(scope === 'all');
      valueChip.setState(scope === 'value');
      render();
    }
    var allChip = scopeChip(ui.doc, 'All ' + items.length, function () { setScope('all'); });
    allChip.title = 'Every field on the table, whether or not this record has a value';
    allChip.setAttribute('data-oliver4-region', 'scope-all');
    var valueChip = scopeChip(ui.doc, 'With value ' + withValues, function () { setScope('value'); });
    valueChip.title = 'Only the fields this record holds a value for';
    valueChip.setAttribute('data-oliver4-region', 'scope-value');
    allChip.setState(false);
    valueChip.setState(true);
    filterWrap.appendChild(allChip);
    filterWrap.appendChild(valueChip);
    ui.aside(filterWrap);

    function setFilter(value) {
      filter = value;
      if (filterInput.value !== value) filterInput.value = value;
      clearFilter.style.visibility = value ? 'visible' : 'hidden';
      render();
    }

    filterInput.oninput = function () { setFilter(filterInput.value); };

    // The host app binds its own keyboard shortcuts, so keystrokes are kept in
    // the box rather than let through to the form behind the panel.
    filterInput.onkeydown = function (e) {
      e.stopPropagation();
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        setFilter('');
      }
    };

    clearFilter.onclick = function () {
      setFilter('');
      try { filterInput.focus(); } catch (e) { /* detached */ }
    };

    // Two lines on the left - what the form calls the field over what you type
    // in a query - then the type, then the value. The value wraps rather than
    // being cut off: a Memo is often the reason the field list is open.
    function fieldRow(item) {
      var empty = item.value === null;
      var row = el(ui.doc, 'div', {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '8px 0',
        borderBottom: '1px solid ' + T.lineFaint,
        cursor: 'pointer'
      });
      hover(row, 'transparent', T.hover);
      row.setAttribute('data-oliver4-region', 'field-row-' + item.logical);
      row.setAttribute('role', 'button');
      row.title = 'Show the definition of this column';
      row.onclick = function () { openFieldView(item); };

      // The mark leads the row rather than trailing it, so the column of
      // arrows reads as the thing you click and the value column keeps its
      // right edge. An arrow rather than a chevron, in the accent colour
      // rather than a faint one: it opens another view, and it is the only
      // thing on the row that is a control.
      var mark = el(ui.doc, 'div', {
        flex: 'none', width: '15px', display: 'flex', paddingTop: '3px',
        color: T.accentText
      });
      mark.appendChild(svg(ui.doc, ICON.enter, 14));
      row.appendChild(mark);

      // Half and half of what the mark leaves. The type column that sat
      // between them until v2.2.5 was taking width from both of them to repeat
      // something the column definition says in full.
      var names = el(ui.doc, 'div', { flex: '1 1 0%', minWidth: '0' });
      names.appendChild(el(ui.doc, 'div', {
        fontSize: '14.5px',
        color: empty ? T.dim : T.text,
        letterSpacing: '-0.005em',
        overflowWrap: 'anywhere'
      }, item.display || item.logical));
      if (item.display) {
        names.appendChild(el(ui.doc, 'div', {
          font: T.monoSmall, color: T.label, marginTop: '2px', overflowWrap: 'anywhere'
        }, item.logical));
      }
      row.appendChild(names);

      row.appendChild(el(ui.doc, 'div', {
        font: T.mono,
        lineHeight: '1.45',
        color: empty ? T.empty : T.accentSoft,
        flex: '1 1 0%',
        minWidth: '0',
        textAlign: 'right',
        whiteSpace: 'normal',
        overflowWrap: 'anywhere'
      }, empty ? 'empty' : item.value));
      return row;
    }

    function renderBody() {
      ui.output.textContent = '';
      var list = visible();

      if (!list.length) {
        ui.output.appendChild(nothing(ui,
          items.length && (filter.trim() || scope === 'value')
            ? 'No fields match what you have narrowed the list to.'
            : 'Nothing to show.'));
        return;
      }

      if (format === 'json') {
        ui.output.appendChild(el(ui.doc, 'div', {
          font: T.monoBlock,
          lineHeight: '1.55',
          color: T.label,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          userSelect: 'text'
        }, text()));
        return;
      }

      // The paragraph that used to sit here, explaining that the listing is
      // the table rather than the form, moved into the pane header at v2.2.7.
      // It is the same sentence for every reading of the listing, so it
      // belongs with the heading rather than above the rows.
      var grid = el(ui.doc, 'div', {});
      grid.setAttribute('data-oliver4-region', 'field-list');
      list.forEach(function (item) { grid.appendChild(fieldRow(item)); });
      ui.output.appendChild(grid);
    }

    // The pane's own controls, re-appended rather than rebuilt: setTitle
    // empties the header when the view changes, but these are the same nodes
    // with the same state on them - the format switch knows which half is lit
    // and the filter box still holds what was typed into it.
    function listChrome() {
      ui.setTitle('All fields', '');
      ui.context(inspectTrail('All fields'), INSPECT_NOTES['All fields']);
      ui.resultTools.appendChild(formatSwitch);
      ui.resultTools.appendChild(copyButton);
      ui.resultTools.appendChild(csvButton);
      ui.aside(filterWrap);
      filterWrap.style.display = format === 'json' ? 'none' : 'flex';
    }

    function showList() {
      view = 'list';
      listChrome();
      render();
      // Back to the row that was clicked, not to the top of the table.
      ui.output.scrollTop = listScroll;
    }

    // A column called "Reference field" must not come out as "Reference field
    // field", so the word is only added when it is not already the last one.
    function fieldTitle(name) {
      var text = String(name == null ? '' : name);
      if (!text) return 'Field';
      return /\bfields?$/i.test(text) ? text : text + ' field';
    }

    // One column takes the whole pane. Everything the listing was showing goes
    // with it - the filter, the scope chips, the format switch - because none
    // of them mean anything to a single column, and leaving them there was
    // what made the definition hard to tell from the list it came from.
    function openFieldView(item) {
      listScroll = ui.output.scrollTop;
      view = 'field';
      // "Enquiry type field" rather than "Enquiry type". The title is the one
      // line that has to stand on its own - a bare display name reads as a
      // value on a form, and the word says what you are looking at. The trail
      // below it keeps the bare name: it is a place, not a description, and it
      // is the crumb that truncates when the header runs out of room.
      ui.setTitle(fieldTitle(item.display || item.logical),
        item.logical + ' on ' + table);
      // Back lives in the trail now, at the head of it, so it is in the same
      // place here as it is in the library viewer.
      ui.context([
        { label: 'Inspect' },
        { label: 'All fields', go: showList },
        { label: item.display || item.logical }
      ], FIELD_NOTE);

      var copyOne = chipButton(ui.doc, 'copy', 'Copy this column definition');
      copyOne.setAttribute('data-oliver4-region', 'field-copy');
      ui.resultTools.appendChild(copyOne);

      ui.output.textContent = '';
      var block = fieldDetailBlock(ui, xrm, item, table, detailCache, isActive);
      ui.output.appendChild(block);
      ui.output.scrollTop = 0;
      ui.foot('');

      copyOne.onclick = function () {
        // Nothing to copy until the definition has drawn, and saying so is
        // better than putting half a column on the clipboard.
        if (!block.copyText) { copyOne.labelNode.textContent = 'not yet'; return; }
        try {
          win.navigator.clipboard.writeText(block.copyText).then(
            function () { copyOne.labelNode.textContent = 'copied'; },
            function () { copyOne.labelNode.textContent = 'blocked'; }
          );
        } catch (e) {
          copyOne.labelNode.textContent = 'blocked';
        }
      };
    }

    function render() {
      // Only the list redraws itself. A column view is drawn once, by the
      // click that opened it, and the filter behind it cannot reach it.
      //
      // The pane header is deliberately NOT repainted here. render runs on
      // every keystroke in the filter box, and setTitle empties the aside the
      // box lives in - which takes the focus out of it with it. The header is
      // painted when the view changes and left alone otherwise.
      if (view !== 'list') return;
      var list = visible();
      // The heading never lets a narrowed list pass for the whole table.
      if (format !== 'json' && list.length !== items.length) {
        var shownWithValues = list.filter(function (i) { return i.value !== null; }).length;
        ui.resultMetaText(list.length + ' of ' + items.length + ' fields on ' +
          table + ' - ' + shownWithValues + ' hold a value');
      } else {
        ui.resultMetaText(items.length + ' fields on ' + table +
          ' - ' + withValues + ' hold a value');
      }
      copyButton.labelNode.textContent = 'copy';
      csvButton.labelNode.textContent = 'CSV';
      renderBody();
      ui.foot(format === 'json'
        ? 'JSON view - the full record definition, filter and scope ignored'
        : 'showing ' + list.length + ' of ' + items.length);
    }

    copyButton.onclick = function () {
      try {
        win.navigator.clipboard.writeText(text()).then(
          function () { copyButton.labelNode.textContent = 'copied'; },
          function () { copyButton.labelNode.textContent = 'blocked'; }
        );
      } catch (e) {
        copyButton.labelNode.textContent = 'blocked';
      }
    };

    // Follows what is on screen, the same rule copy follows: the narrowed rows
    // in list view, every field in JSON view.
    csvButton.onclick = function () {
      try {
        downloadText(win, table + '-fields.csv',
          fieldCsv(format === 'json' ? items : visible()), 'text/csv');
      } catch (e) {
        csvButton.labelNode.textContent = 'blocked';
      }
    };

    render();
  }

  /* ------------------------------------------------------ library source --- */

  // A hook value built from a name that was never meant to be one. Web resource
  // names carry slashes and dots, so they are folded to one shape here and
  // tests select on the prefix rather than on the name itself.
  function regionName(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  // The content column is base64. atob returns the bytes as characters, which
  // is not the same as the text: a curly quote in a comment, or a name in a
  // script that is not Latin, comes back mangled unless the bytes are decoded
  // as UTF-8. The byte count comes from here rather than from the string
  // length, so the size reported is the file's, not the decoded text's.
  function decodeWebResource(win, content) {
    if (!content) return { text: '', bytes: 0 };
    var raw;
    try {
      raw = win.atob(String(content).replace(/\s+/g, ''));
    } catch (e) {
      throw new Error('the file could not be decoded from base64');
    }
    var text = raw;
    try {
      if (typeof win.TextDecoder === 'function' && typeof win.Uint8Array === 'function') {
        var bytes = new win.Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i) & 0xff;
        text = new win.TextDecoder('utf-8').decode(bytes);
      }
    } catch (e) {
      text = raw;
    }
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    return { text: text, bytes: raw.length };
  }

  // One record, read only when a library is opened. Nothing is fetched from
  // the hosting location and nothing leaves the environment - this is the same
  // Dataverse read the form definition and the metadata already go through.
  function readWebResource(xrm, lib, win) {
    // The name goes into the filter as it stands. A web resource name "can only
    // include letters, numbers, periods, and nonconsecutive forward slash
    // characters", none of which need escaping in a query string - and
    // percent-encoding the slashes would risk the client encoding the percent
    // signs again and looking up a name nobody has. The quote doubling is kept
    // because it costs nothing and a name that somehow held one would otherwise
    // close the literal early.
    var value = String(lib.name).replace(/'/g, "''");
    var options = '?$select=name,displayname,webresourcetype,ismanaged,modifiedon,content' +
      "&$filter=name eq '" + value + "'";

    return xrm.WebApi.retrieveMultipleRecords('webresource', options).then(function (result) {
      var entities = (result && result.entities) || [];
      if (!entities.length) return null;
      var row = entities[0];
      var decoded = decodeWebResource(win, row.content);
      return {
        name: row.name || lib.name,
        display: row.displayname || '',
        type: row['webresourcetype' + ANNOTATION] || row.webresourcetype || '',
        managed: row.ismanaged,
        modified: row['modifiedon' + ANNOTATION] || row.modifiedon || '',
        text: decoded.text,
        bytes: decoded.bytes
      };
    });
  }

  function sizeText(bytes) {
    if (bytes === null || bytes === undefined) return '';
    if (bytes < 1024) return bytes + ' bytes';
    return Math.round(bytes / 1024) + ' KB';
  }

  // Anything longer than this is drawn cut, with the cut stated and a control
  // to draw the rest. Copy always takes the whole file whichever is on screen -
  // the cut is what the panel can lay out, not what was read.
  var SOURCE_LIMIT = 200000;

  /* ------------------------------------------------------ syntax colours --- */

  function wordSet(words) {
    var set = {};
    words.split(' ').forEach(function (word) { set[word] = true; });
    return set;
  }

  var JS_KEYWORDS = wordSet(
    'var let const function return if else for while do break continue new ' +
    'typeof instanceof in of delete void try catch finally throw switch case ' +
    'default class extends super import export from async await yield static ' +
    'get set with debugger');

  // Values rather than instructions, and coloured apart from the keywords at
  // v2.2.6 because that is what they are. It also settles a question the
  // scanner used to answer by name: a slash after "null" or "this" is
  // division, and now that they are not keywords their kind says so on its own.
  var JS_CONSTANTS = wordSet('true false null undefined this NaN Infinity');

  // Seven kinds get a colour and everything else takes the block's own.
  // Anything finer - telling a class from a variable, a parameter from a local
  // - needs a parser rather than a scanner, and a confidently wrong colour is
  // worse than no colour at all. Blue is deliberately not among them: the
  // panel already uses it for values and for anything you would paste into a
  // query.
  //
  // The tokens are named here rather than looked up by key at draw time, so
  // that a colour reached for by the viewer is one `theme-test.js` can see in
  // the source. A dynamic `T[whatever]` would report as a palette entry
  // nothing reads, which is the check that catches a token gone stale.
  var CODE_COLOUR = {
    keyword: T.codeKeyword,
    constant: T.codeConstant,
    string: T.codeString,
    number: T.codeNumber,
    comment: T.codeComment,
    'function': T.codeFunction,
    property: T.codeProperty,
    operator: T.codeOperator
  };

  // Everything coloured as an operator. Brackets, commas, semicolons and the
  // dots between property names are deliberately left plain: they are the
  // shape of the code rather than something it does, and colouring them would
  // put a span around every third character.
  var OPERATOR_CHARS = '=+-*/%<>!&|^~?:';

  // Above this the source is drawn plain and the panel says so. Colouring is
  // one pass over the text, which is quick; it is the elements it produces
  // that cost, and a very large file would make tens of thousands of them.
  var HIGHLIGHT_LIMIT = 120000;

  function isDigit(c) { return c >= '0' && c <= '9'; }
  function isWordStart(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === '$';
  }
  function isWordChar(c) { return isWordStart(c) || isDigit(c); }

  // Whether a slash at this point starts a regular expression or divides.
  // Nothing else in the scanner needs to look backwards, and this does because
  // getting it wrong is not cosmetic: a slash read as division in /['"]/ opens
  // a string on the quote inside it that runs to the next quote in the file,
  // and everything between comes out the wrong colour.
  var REGEX_BEFORE = '(,=:[!&|?{};+-*%^~<>';

  function regexAllowed(prev, prevKind) {
    if (!prev) return true;
    if (prevKind === 'keyword') return true;
    if (prevKind === 'punct' || prevKind === 'operator') {
      return REGEX_BEFORE.indexOf(prev.charAt(prev.length - 1)) > -1;
    }
    // After a name, a property, a call, a constant, a number, a string, a ")"
    // or a "]" it is division.
    return false;
  }

  // Whether the next thing after a name is an opening bracket, which is what
  // makes it a call. It does not look past a line break: a name at the end of
  // one line and a bracket at the start of the next is far more likely to be
  // two statements than one call.
  function callAhead(text, from) {
    var j = from;
    while (j < text.length) {
      var c = text.charAt(j);
      if (c === ' ' || c === '\t') { j++; continue; }
      return c === '(';
    }
    return false;
  }

  // One left to right pass returning [kind, text] pairs, with runs of
  // uncoloured text merged so a line of punctuation is one text node rather
  // than thirty. Nothing is sliced off the source as it goes: on a large file
  // that would copy the remainder of it at every step.
  function scanJs(text) {
    var out = [];
    var plain = '';
    var prev = '';
    var prevKind = '';
    var i = 0;
    var n = text.length;

    function flush() {
      if (plain) { out.push(['', plain]); plain = ''; }
    }
    function emit(kind, value) {
      flush();
      out.push([kind, value]);
      prev = value;
      prevKind = kind;
    }

    while (i < n) {
      var c = text.charAt(i);
      var d = text.charAt(i + 1);

      if (c === '/' && d === '/') {
        var line = text.indexOf('\n', i);
        if (line === -1) line = n;
        emit('comment', text.slice(i, line));
        i = line;
        continue;
      }

      if (c === '/' && d === '*') {
        var close = text.indexOf('*/', i + 2);
        var stop = close === -1 ? n : close + 2;
        emit('comment', text.slice(i, stop));
        i = stop;
        continue;
      }

      if (c === '"' || c === "'" || c === '`') {
        var j = i + 1;
        while (j < n) {
          var q = text.charAt(j);
          if (q === '\\') { j += 2; continue; }
          if (q === c) { j++; break; }
          // An unterminated quote stops at the end of its line rather than
          // colouring the rest of the file as one string. A template literal
          // is the exception - it is allowed to span lines.
          if (q === '\n' && c !== '`') break;
          j++;
        }
        emit('string', text.slice(i, j));
        i = j;
        continue;
      }

      if (c === '/' && regexAllowed(prev, prevKind)) {
        var k = i + 1;
        var closed = false;
        var inClass = false;
        while (k < n) {
          var r = text.charAt(k);
          if (r === '\\') { k += 2; continue; }
          if (r === '\n') break;
          if (r === '[') inClass = true;
          else if (r === ']') inClass = false;
          else if (r === '/' && !inClass) { k++; closed = true; break; }
          k++;
        }
        if (closed) {
          while (k < n && text.charAt(k) >= 'a' && text.charAt(k) <= 'z') k++;
          emit('string', text.slice(i, k));
          i = k;
          continue;
        }
        // Not a regular expression after all - fall through and treat it as
        // the punctuation it is.
      }

      if (isDigit(c) || (c === '.' && isDigit(d))) {
        var num = i;
        if (c === '0' && (d === 'x' || d === 'X' || d === 'b' || d === 'B' || d === 'o' || d === 'O')) {
          num = i + 2;
          while (num < n && isWordChar(text.charAt(num))) num++;
        } else {
          while (num < n && isDigit(text.charAt(num))) num++;
          if (text.charAt(num) === '.') {
            num++;
            while (num < n && isDigit(text.charAt(num))) num++;
          }
          if (text.charAt(num) === 'e' || text.charAt(num) === 'E') {
            var exp = num + 1;
            if (text.charAt(exp) === '+' || text.charAt(exp) === '-') exp++;
            if (isDigit(text.charAt(exp))) {
              num = exp;
              while (num < n && isDigit(text.charAt(num))) num++;
            }
          }
        }
        emit('number', text.slice(i, num));
        i = num;
        continue;
      }

      if (isWordStart(c)) {
        var w = i;
        while (w < n && isWordChar(text.charAt(w))) w++;
        var word = text.slice(i, w);
        if (JS_KEYWORDS[word]) {
          emit('keyword', word);
        } else if (JS_CONSTANTS[word]) {
          emit('constant', word);
        } else if (callAhead(text, w)) {
          // A name with a bracket after it is being called, and the call is
          // what you scan a form script for.
          emit('function', word);
        } else if (prevKind === 'punct' && prev === '.') {
          emit('property', word);
        } else {
          plain += word;
          prev = word;
          prevKind = 'name';
        }
        i = w;
        continue;
      }

      if (OPERATOR_CHARS.indexOf(c) > -1) {
        var op = i;
        while (op < n && OPERATOR_CHARS.indexOf(text.charAt(op)) > -1) {
          // A run of operator characters must not swallow the start of a
          // comment: "x =/* note */ y" is an assignment and a comment, not a
          // three character operator.
          var next = text.charAt(op + 1);
          if (op > i && text.charAt(op) === '/' && (next === '/' || next === '*')) break;
          op++;
        }
        emit('operator', text.slice(i, op));
        i = op;
        continue;
      }

      plain += c;
      if (c !== ' ' && c !== '\t' && c !== '\n' && c !== '\r') {
        prev = c;
        prevKind = 'punct';
      }
      i++;
    }

    flush();
    return out;
  }

  // Line numbers in their own column, as one node holding every number rather
  // than a node per line: a three thousand line file is two elements this way
  // and six thousand the other. The columns stay level because both use the
  // same face and the same line height, which is also why the source must not
  // wrap - a wrapped line would put every number below it out by one.
  function sourceBlock(ui, text, colour) {
    var count = text.split('\n').length;
    var numbers = [];
    for (var i = 1; i <= count; i++) numbers.push(i);

    var wrap = el(ui.doc, 'div', {
      display: 'flex', gap: '12px', alignItems: 'flex-start', paddingTop: '10px'
    });
    wrap.appendChild(el(ui.doc, 'div', {
      font: T.monoBlock,
      lineHeight: '1.55',
      color: T.empty,
      textAlign: 'right',
      whiteSpace: 'pre',
      flex: 'none',
      userSelect: 'none'
    }, numbers.join('\n')));

    var code = el(ui.doc, 'div', {
      font: T.monoBlock,
      lineHeight: '1.55',
      color: T.label,
      whiteSpace: 'pre',
      overflowX: 'auto',
      flex: '1',
      minWidth: '0',
      userSelect: 'text'
    }, colour ? '' : text);
    code.setAttribute('data-oliver4-region', 'library-source');

    if (colour) {
      scanJs(text).forEach(function (token) {
        if (!token[0]) {
          code.appendChild(ui.doc.createTextNode(token[1]));
          return;
        }
        var span = el(ui.doc, 'span', { color: CODE_COLOUR[token[0]] }, token[1]);
        span.setAttribute('data-oliver4-region', 'code-' + token[0]);
        code.appendChild(span);
      });
    }

    wrap.appendChild(code);
    return wrap;
  }

  // The viewer replaces the pane rather than opening under the row. A library
  // is the one thing in the panel that is read rather than scanned, and the
  // list it came from is four rows long - keeping those four rows above a
  // thousand lines of source would cost more than it gives. Back returns to
  // the list, which is rebuilt from the cached form definition.
  function librarySource(ui, xrm, store, formXml, lib, win, active) {
    var showAll = false;

    function chrome() {
      ui.setTitle(lib.name, '');
      ui.context([
        { label: 'Inspect' },
        {
          label: 'JavaScript libraries',
          go: function () { libraryList(ui, xrm, store, formXml, win, active); }
        },
        { label: lib.name }
      ], LIBRARY_NOTE);

      var open = chipButton(ui.doc, 'open', 'Open this web resource in a new tab');
      open.insertBefore(svg(ui.doc, ICON.external, 12), open.firstChild);
      open.setAttribute('data-oliver4-region', 'library-open');
      open.onclick = function () {
        var url;
        try {
          url = xrm.Utility.getGlobalContext().getClientUrl() + '/WebResources/' + lib.name;
        } catch (e) {
          open.labelNode.textContent = 'blocked';
          return;
        }
        var tab = null;
        try { tab = win.open(url, '_blank'); } catch (e) { tab = null; }
        // Same rule the Web API button follows: a blocked popup is reported by
        // handing over the URL, not by claiming a tab that is not there.
        if (!tab) {
          open.labelNode.textContent = 'blocked';
          ui.output.appendChild(dataRow(ui, 'Popup blocked', url));
        }
      };
      ui.resultTools.appendChild(open);

      return { open: open };
    }

    function draw(data) {
      var tools = chrome();
      ui.output.textContent = '';

      if (!data) {
        ui.output.appendChild(el(ui.doc, 'div', { color: T.ink, lineHeight: '1.55' },
          'No web resource is registered under this name in this environment. ' +
          'The form refers to it, so it has either been deleted or it lives in a ' +
          'solution that is not installed here.'));
        return;
      }

      var count = data.text ? data.text.split('\n').length : 0;
      ui.resultMetaText([
        data.type || 'web resource',
        count + (count === 1 ? ' line' : ' lines'),
        sizeText(data.bytes),
        data.managed ? 'managed' : 'unmanaged',
        data.modified ? 'modified ' + data.modified : ''
      ].filter(function (part) { return !!part; }).join(' - '));

      var copyButton = chipButton(ui.doc, 'copy', 'Copy the whole file');
      copyButton.setAttribute('data-oliver4-region', 'library-copy');
      copyButton.onclick = function () {
        try {
          win.navigator.clipboard.writeText(data.text).then(
            function () { copyButton.labelNode.textContent = 'copied'; },
            function () { copyButton.labelNode.textContent = 'blocked'; }
          );
        } catch (e) {
          copyButton.labelNode.textContent = 'blocked';
        }
      };
      ui.resultTools.insertBefore(copyButton, tools.open);

      if (!data.text) {
        ui.output.appendChild(nothing(ui, 'The web resource is empty.'));
        return;
      }

      var long = data.text.length > SOURCE_LIMIT && !showAll;
      if (long) {
        var note = el(ui.doc, 'div', {
          display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
          color: T.ink, padding: '2px 0 6px'
        });
        note.appendChild(el(ui.doc, 'span', {},
          'Showing the first ' + SOURCE_LIMIT.toLocaleString() + ' characters of ' +
          data.text.length.toLocaleString() + '. Copy takes the whole file.'));
        var moreButton = chipButton(ui.doc, 'show everything', 'Draw the rest of the file');
        moreButton.setAttribute('data-oliver4-region', 'library-show-all');
        moreButton.onclick = function () { showAll = true; draw(data); };
        note.appendChild(moreButton);
        ui.output.appendChild(note);
      }

      var drawn = long ? data.text.slice(0, SOURCE_LIMIT) : data.text;
      var colour = drawn.length <= HIGHLIGHT_LIMIT;
      if (!colour) {
        ui.output.appendChild(el(ui.doc, 'div', {
          font: T.monoSmall, color: T.muted, padding: '2px 0 6px'
        }, 'Syntax colours are off above ' + HIGHLIGHT_LIMIT.toLocaleString() +
          ' characters - the colouring is one element per coloured word, and ' +
          'this file would make too many of them.'));
      }
      ui.output.appendChild(sourceBlock(ui, drawn, colour));
      ui.foot(lib.name);
    }

    var held = store.webResources[lib.name];
    if (held) { draw(held); return; }

    chrome();
    ui.output.textContent = '';
    ui.output.appendChild(el(ui.doc, 'div', { color: T.ink }, 'Reading the web resource...'));

    readWebResource(xrm, lib, win).then(function (data) {
      if (!active()) return;
      if (data) store.webResources[lib.name] = data;
      draw(data);
    }, function (e) {
      if (!active()) return;
      fail(ui, 'Could not read the web resource' +
        (e && e.message ? ' - ' + e.message : '') + '.', 'JavaScript library');
    });
  }

  function libraryRow(ui, lib, onOpen) {
    var row = el(ui.doc, 'div', {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 0',
      borderBottom: '1px solid ' + T.lineFaint,
      cursor: 'pointer'
    });
    hover(row, 'transparent', T.hover);
    row.setAttribute('data-oliver4-region', 'library-row-' + regionName(lib.name));
    row.setAttribute('role', 'button');
    row.title = 'Show the source of this library';
    row.onclick = onOpen;

    row.appendChild(el(ui.doc, 'div', {
      font: T.mono, color: T.accentSoft, flex: '1', minWidth: '0',
      overflowWrap: 'anywhere'
    }, lib.name));

    var mark = el(ui.doc, 'div', { flex: 'none', display: 'flex', color: T.faint });
    mark.appendChild(svg(ui.doc, ICON.chevron, 12));
    row.appendChild(mark);
    return row;
  }

  function libraryList(ui, xrm, store, formXml, win, active) {
    var libs = readLibraries(formXml);
    ui.setTitle('JavaScript libraries', 'on form "' + formXml.name + '"');
    ui.context(inspectTrail('JavaScript libraries'), INSPECT_NOTES['JavaScript libraries']);
    ui.output.textContent = '';

    if (!libs.length) {
      ui.output.appendChild(nothing(ui));
      return;
    }

    var list = el(ui.doc, 'div', {});
    list.setAttribute('data-oliver4-region', 'library-list');
    libs.forEach(function (lib) {
      list.appendChild(libraryRow(ui, lib, function () {
        librarySource(ui, xrm, store, formXml, lib, win, active);
      }));
    });
    ui.output.appendChild(list);
  }

  // The default view is "the relationships that hold records", which cannot be
  // known until every count is in, so all of them are counted before anything
  // is drawn. A wide table is dozens of requests, so the wait is reported as it
  // goes rather than sitting on a blank panel.
  function countAll(ui, xrm, record, entitySet, list, active) {
    var counts = {};
    var done = 0;

    ui.setTitle('Related record count', '');
    ui.output.textContent = '';
    var progress = el(ui.doc, 'div', { color: T.ink });
    ui.output.appendChild(progress);

    function report() {
      progress.textContent = 'Counting related records - ' + done + ' of ' + list.length + '...';
    }
    report();

    return throttle(list, COUNT_LANES, function (rel) {
      if (!active()) return null;
      return countRelated(xrm, entitySet, record.id, rel).then(function (result) {
        counts[rel.schema] = { count: result.count, capped: result.capped, note: null };
        done++;
        report();
      }, function () {
        // Nearly always a table this user has no read privilege on rather than
        // a broken query, so the row says so and the rest of the listing stands.
        counts[rel.schema] = { count: null, capped: false, note: 'no access' };
        done++;
        report();
      });
    }).then(function () {
      return counts;
    });
  }

  function countText(result) {
    if (!result) return 'unknown';
    if (result.note) return result.note;
    if (result.count === null) return 'unknown';
    if (result.capped) return 'over ' + COUNT_CAP;
    return String(result.count);
  }

  // A relationship whose count came back as a number above nought. Anything
  // that could not be counted is deliberately not in this set, so it is never
  // presented as though it holds records.
  function holdsRecords(result) {
    return !!result && !result.note && result.count !== null && result.count > 0;
  }

  // Shown in the default view. An uncounted relationship is not a confirmed
  // nought, so hiding it would turn a failure into an empty answer.
  function worthShowing(result) {
    return holdsRecords(result) || !result || !!result.note || result.count === null;
  }

  var RELATIONSHIP_SECTIONS = [
    { kind: '1:N', title: 'Child records (1:N)' },
    { kind: 'N:N', title: 'Many to many records (N:N)' }
  ];

  /* --------------------------------------------------- performance tools --- */

  // Neither of these is part of the toolkit. They are Microsoft's own tools,
  // and this view is a shortcut to them plus a plain statement of what happens
  // next - both need a step in the tool they open, not here.

  // Both tools are switched on by a query string parameter on the app URL, so
  // both are a link rather than anything cleverer.
  //
  // Live monitor: monitor=true, then Live monitor on the command bar.
  // https://learn.microsoft.com/en-us/power-apps/maker/monitor-modelapps
  //
  // Performance Centre: perf=true. Not documented on Microsoft Learn - the
  // sources are community ones, so treat it as unsupported.
  // https://crmtipoftheday.com/1160/bring-up-client-performance-center/
  function urlWithParam(win, name) {
    var href;
    try {
      href = win.location.href;
    } catch (e) {
      return null;
    }
    if (new RegExp('[?&]' + name + '=true(&|$)', 'i').test(href)) return href;
    return href + (href.indexOf('?') > -1 ? '&' : '?') + name + '=true';
  }

  // The in-page alternative, for measuring the page you are already on rather
  // than a fresh load. Alt, not Ctrl: Ctrl+Shift+Q was the classic web client
  // and does nothing in the Unified Interface.
  var PERF_CENTRE_SHORTCUT = 'Alt+Shift+Q';

  // One block per tool: what it is, what the button does, and what you have to
  // do once it opens.
  function toolLinks(ui, items) {
    ui.output.textContent = '';
    var list = el(ui.doc, 'div', {
      display: 'flex', flexDirection: 'column', gap: '8px'
    });

    items.forEach(function (item) {
      var block = el(ui.doc, 'div', {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '10px 12px',
        border: '1px solid ' + T.borderPanel,
        borderRadius: T.radiusPanel,
        background: T.panel
      });

      var text = el(ui.doc, 'div', { flex: '1', minWidth: '0' });
      text.appendChild(el(ui.doc, 'div', {
        fontSize: '15px', fontWeight: '600', color: T.text
      }, item.title));
      text.appendChild(el(ui.doc, 'div', {
        marginTop: '3px', fontSize: '13.5px', lineHeight: '1.55', color: T.soft
      }, item.detail));
      var status = el(ui.doc, 'div', {
        display: 'none', marginTop: '6px', font: T.monoSmall, color: T.accentSoft
      }, '');
      text.appendChild(status);
      block.appendChild(text);

      var button = actionButton(ui.doc, item.label, item.icon, true, item.title, function () {
        var said = item.run();
        status.textContent = said || '';
        status.style.display = said ? 'block' : 'none';
      });
      block.appendChild(button);

      list.appendChild(block);
    });

    ui.output.appendChild(list);
  }

  // Relationships grouped by type, with the number of records on the other end
  // of each. Counting has already happened by the time this runs, so the switch
  // between the two views costs nothing.
  function relationshipList(ui, record, list, counts) {
    var showAll = false;

    ui.setTitle('Related record count', '');

    // The same control as the LIST / JSON pair, so the two panes read as one
    // kind of thing rather than as two different ones.
    var viewSwitch = segmentedPair(ui.doc, [
      { value: false, label: 'WITH RECORDS',
        title: 'Show only the relationships that hold records' },
      { value: true, label: 'ALL', title: 'Show every relationship on this table' }
    ], function (value) {
      if (showAll === value) return;
      showAll = value;
      viewSwitch.paint(showAll);
      render();
    }, true);
    viewSwitch.paint(showAll);
    ui.resultTools.appendChild(viewSwitch);

    function sectionTitle(text, first) {
      return el(ui.doc, 'div', {
        font: '12px ' + T.monoFamily,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: T.accentText,
        marginTop: first ? '10px' : '18px',
        marginBottom: '4px'
      }, text);
    }

    function render() {
      var rows = showAll ? list : list.filter(function (rel) {
        return worthShowing(counts[rel.schema]);
      });

      var populated = list.filter(function (rel) {
        return holdsRecords(counts[rel.schema]);
      }).length;
      var uncounted = list.filter(function (rel) {
        var result = counts[rel.schema];
        return !result || result.note || result.count === null;
      }).length;

      // The narrowed view says how much it is hiding, and neither view counts
      // a relationship it could not count among the ones holding records.
      ui.resultMetaText((showAll
        ? list.length + ' relationships on ' + record.table
        : rows.length + ' of ' + list.length + ' relationships on ' + record.table) +
        ' - ' + populated + ' hold records' +
        (uncounted ? ', ' + uncounted + ' could not be counted' : ''));

      ui.output.textContent = '';

      if (!rows.length) {
        ui.output.appendChild(nothing(ui));
        ui.foot('showing 0 of ' + list.length);
        return;
      }

      RELATIONSHIP_SECTIONS.forEach(function (section) {
        var inSection = rows.filter(function (rel) { return rel.kind === section.kind; });
        if (!inSection.length) return;

        ui.output.appendChild(sectionTitle(
          section.title + ' - ' + inSection.length, !ui.output.firstChild));

        var group = el(ui.doc, 'div', {});
        inSection.forEach(function (rel) {
          var result = counts[rel.schema];
          // In the All view most rows are noughts, so the ones that actually
          // hold something are picked out. In the default view every row holds
          // records, and bolding all of them would say nothing.
          var stands = showAll && holdsRecords(result);
          // The schema name is what you need when you go looking for the
          // relationship in the maker portal, so it is on the row without
          // taking up a column.
          group.appendChild(dataRow(ui, rel.label, countText(result), {
            strong: stands,
            empty: countText(result) === '0',
            title: rel.schema + '  -  ' + rel.kind + '  -  ' + rel.table
          }));
        });
        ui.output.appendChild(group);
      });

      ui.foot('showing ' + rows.length + ' of ' + list.length);
    }

    render();
  }

  /* ---------------------------------------------------------------- boot --- */

  var win;
  try {
    win = (window.top && window.top.document) ? window.top : window;
  } catch (e) {
    win = window;
  }
  var doc = win.document;

  var ui = build(doc, win);
  var store = getStore(win);
  var record = null;
  var authorised = false;

  // Hidden rather than left blank, so a table with no primary name column
  // leaves no gap above the table chip. Truncated rather than wrapped, with
  // the full value on hover - a two line record name would push the tools down.
  function setName(value) {
    ui.name.textContent = value || '';
    ui.name.title = value || '';
    ui.name.style.display = value ? 'block' : 'none';
  }

  // Toggle state is kept on the window so it survives closing and reopening
  // the panel. The Unified Interface navigates between records without
  // reloading the page, so state left over from a different record has to be
  // discarded or the toggles would claim changes that are no longer applied.
  function syncStore(record, docs) {
    var id = record ? record.id : null;
    if (store.recordId === id) return false;

    stopSchemaWatch(store);
    // Blur is record scoped like everything else here - a deliberate choice,
    // taken knowing the cost: navigate to another record and the values on it
    // are readable until the toggle is switched back on. The alternative was
    // blur surviving navigation, which would have been the only piece of
    // state in the toolkit that does.
    stopBlurWatch(store);
    if (docs) {
      clearHighlights(docs, 'schema');
      clearHighlights(docs, 'dirty');
      clearHighlights(docs, 'blur');
    }
    store.labels = {};
    store.schemaOn = false;
    store.hidden = null;
    store.hiddenOn = false;
    store.locked = null;
    store.unlockedOn = false;
    store.mandatory = null;
    store.mandatoryOn = false;
    store.dirtyOn = false;
    store.blurOn = false;
    store.blurTally = null;
    store.recordId = id;
    return true;
  }

  // Each state toggle registers a closure that re-reads the store.
  var stateToggles = [];

  function resyncToggles() {
    stateToggles.forEach(function (sync) { sync(); });
  }

  // Returns whether the record on screen changed, so a caller that did not
  // ask for this - expanding the panel - can tell the difference between a
  // re-read that found the same record and one that did not.
  function refreshRecord() {
    if (!authorised) {
      record = null;
      ui.table.textContent = 'not available';
      ui.id.textContent = 'not available';
      setName('');
      return false;
    }
    var fw = findFormWindow();
    var xrm = fw && fw.Xrm;
    record = getRecord(xrm);
    var moved = syncStore(record, fw ? reachableDocs(fw) : null);
    if (moved) {
      resyncToggles();
      // The listing on screen was for the previous record.
      releaseDisplay();
      // And so was the message. This is the one thing that takes the note away
      // before its five seconds are up: "Copied to clipboard." is about an ID
      // that is no longer the one on screen.
      ui.note('');
    }
    if (record) {
      ui.table.textContent = record.table;
      ui.table.title = record.table;
      ui.id.textContent = record.id;
      ui.id.title = record.id;
      setName(record.name);
    } else {
      setName('');
      var name = xrm ? PAGE_NAMES[currentPageType(xrm)] : null;
      ui.table.textContent = 'none';
      ui.table.title = 'none';
      ui.id.textContent = (name && name !== 'a record form')
        ? 'no record open - you are on ' + name
        : 'no saved record on screen';
      ui.id.title = ui.id.textContent;
    }
    // The note is deliberately NOT cleared here. It clears itself on its own
    // five second clock - see ui.note.
    return moved;
  }

  // Expanding the panel re-reads the record. You can browse to another record
  // while the panel is collapsed, and the bar shows nothing that would give
  // that away, so the panel that comes back would otherwise be describing
  // whatever was open when you collapsed it.
  //
  // The pane is only disturbed if the record actually moved. Collapsing and
  // expanding on the same record is a window action, not a refresh, and it
  // must leave a listing you were reading exactly where it was. When the
  // record has moved, refreshRecord has already dropped that listing, so this
  // takes a fresh ticket as well - anything still in flight for the previous
  // record has to be dropped rather than written over the top.
  ui.onExpand = function () {
    if (!refreshRecord()) return;
    claimResults();
    say(ui, 'Pick an action.');
    ui.note('Record changed - refreshed.');
  };

  ui.copyChip.onclick = function () {
    if (!authorised) return;
    refreshRecord();
    if (!record) { ui.note('Nothing to copy.'); return; }
    try {
      win.navigator.clipboard.writeText(record.id).then(
        function () { ui.note('Copied to clipboard.'); },
        function () { ui.note('Copy blocked - select the ID and press Ctrl+C.'); }
      );
    } catch (e) {
      ui.note('Copy blocked - select the ID and press Ctrl+C.');
    }
  };
  ui.buttons.push(ui.copyChip);

  // Refresh and Web API sit with the record they act on rather than up in the
  // header, so it is clear that the record is what gets reloaded and what gets
  // opened. Refresh is the filled one - it is the one used most.
  var refreshButton = actionButton(doc, 'Refresh', ICON.refresh, true,
    'Reload record details', function () {
      if (!authorised) return;
      refreshRecord();
      // Whatever is listed below belongs to whichever record was open when it
      // was requested, so clear it rather than leaving stale data on screen.
      releaseDisplay();
      claimResults();
      say(ui, 'Pick an action.');
      ui.note('Refreshed.');
    });
  ui.recordActions.appendChild(refreshButton);
  ui.buttons.push(refreshButton);

  // Every document the toolkit can reach, so DOM highlighting works whether
  // the form renders in the top window or inside a session iframe.
  function reachableDocs(formWin) {
    var docs = [];
    function add(d) {
      if (!d || !d.querySelectorAll) return;
      for (var i = 0; i < docs.length; i++) if (docs[i] === d) return;
      docs.push(d);
    }
    try { add(formWin && formWin.document); } catch (e) { /* cross-origin */ }
    add(doc);
    try {
      for (var i = 0; i < win.frames.length; i++) add(win.frames[i].document);
    } catch (e) { /* cross-origin */ }
    return docs;
  }

  // Runs fn with the live form window, reporting anything that goes wrong.
  function withForm(fn) {
    if (!authorised) return;
    var fw = findFormWindow();
    if (!fw || !fw.Xrm) {
      fail(ui, 'The Dynamics client could not be reached on this page.');
      return;
    }
    if (!hasForm(fw.Xrm)) {
      fail(ui, notAFormMessage(fw.Xrm));
      return;
    }
    try {
      fn(fw.Xrm, reachableDocs(fw));
    } catch (e) {
      fail(ui, 'Failed: ' + (e && e.message ? e.message : 'unknown error'));
    }
  }

  function withApi(fn) {
    if (!authorised) return;
    var fw = findFormWindow();
    if (!fw || !fw.Xrm || !fw.Xrm.WebApi) {
      fail(ui, 'The Dynamics Web API is not available on this page.');
      return;
    }
    if (!record) {
      // Distinguish "wrong kind of page" from "form open but never saved".
      fail(ui, hasForm(fw.Xrm)
        ? 'This record has not been saved yet, so it has no ID to look up.'
        : notAFormMessage(fw.Xrm));
      return;
    }
    try {
      fn(fw.Xrm);
    } catch (e) {
      fail(ui, 'Failed: ' + (e && e.message ? e.message : 'unknown error'));
    }
  }

  function failed(prefix) {
    return function (e) {
      fail(ui, prefix + ': ' + (e && e.message ? e.message : 'unknown error'));
    };
  }

  // Inspect tools render into the results pane. Only one can be lit at a time,
  // so activating one clears the rest.
  // Runs before the tool rows read the store, so they are painted against the
  // record that is actually open.
  (function () {
    var fw = findFormWindow();
    syncStore(getRecord(fw && fw.Xrm), fw ? reachableDocs(fw) : null);
  })();

  var displayActions = [];
  var activeDisplay = null;

  // Every click that will put something in the results pane takes a ticket.
  // Whatever answers last checks its ticket is still the current one before it
  // writes, so a slow tool that comes back after you have clicked something
  // else drops its output instead of replacing what you are now looking at.
  //
  // This is not the same guard as activeDisplay. That one only covers the
  // Inspect radios, and the case it misses is a switch: Schema names reports
  // two and a half seconds after it was clicked, by which time All fields has
  // been clicked, has answered, and is on screen. The work the switch started
  // is not cancelled - the form highlighting carries on in the background and
  // the switch stays on - it is only the report that is dropped.
  var resultsTicket = 0;
  function claimResults() { return ++resultsTicket; }
  function holdsResults(ticket) { return resultsTicket === ticket; }

  function setActiveDisplay(row) {
    activeDisplay = row;
    displayActions.forEach(function (r) { r.setState(r === row); });
  }

  // Clears the trail and the sentence as well as unlighting the row. Whatever
  // called this is about to put something else in the pane - a form change, a
  // message, an error - and none of those are somewhere you navigated to.
  function releaseDisplay() {
    if (ui && ui.context) ui.context(null, '');
    if (!displayActions || !displayActions.length || !activeDisplay) return;
    setActiveDisplay(null);
  }

  // The Unified Interface can navigate to another record without reloading the
  // page, so the record is re-read before anything acts on it. Otherwise copy,
  // properties, all fields and the Web API URL would silently use whichever
  // record was open when the panel was last drawn.
  function addDisplayAction(grid, label, run) {
    var row = addRadioRow(ui, grid, label, function () {
      refreshRecord();
      if (activeDisplay === row) {
        setActiveDisplay(null);
        say(ui, 'Pick an action.');
        return;
      }
      setActiveDisplay(row);
      // Set before the tool runs, so the pane says what you clicked while it
      // is still reading. setTitle repaints it rather than clearing it.
      ui.context(inspectTrail(label), INSPECT_NOTES[label] || '');
      var ticket = claimResults();
      // Async renders check this before writing, so a tool switched off
      // mid-flight - or overtaken by a later click on anything else - is not
      // written over the top of whatever replaced it.
      run(function () { return activeDisplay === row && holdsResults(ticket); });
    });
    row.isDisplayAction = true;
    displayActions.push(row);
    return row;
  }

  /* ------------------------------------------------------ change the form --- */

  // No hint. A count of how many switches were on was dropped at v2.0.2
  // because it repeated what the switches showed; the rule that replaced it
  // ("as many as you need") went at v2.2.2 for the same reason - the switches
  // are switches, and nobody needed telling they can be on at once.
  var formPanel = addPanel(ui, 'Change the form');
  function setToggle(row, on) {
    row.setState(!!on);
  }

  // Wraps a switch handler with the two things every one of them needs: the
  // record re-read, and the results pane released because a form change
  // replaces whatever listing was showing.
  function formAction(grid, label, icon, handler) {
    var row = addSwitchRow(ui, grid, label, icon, function () {
      refreshRecord();
      releaseDisplay();
      var ticket = claimResults();
      handler(row, function () { return holdsResults(ticket); });
    });
    return row;
  }

  var unlockButton = formAction(formPanel.grid, 'Unlock read only', ACTION_ICON.unlock, function (row) {
    withForm(function (xrm) {
      if (store.unlockedOn) {
        var back = relock(xrm, store);
        setToggle(row, false);
        say(ui, 'Locked ' + back + ' field' + (back === 1 ? '' : 's') + ' again.');
        return;
      }
      var n = unlockFields(xrm, store);
      if (!n) { say(ui, 'No read only fields on this form.'); return; }
      setToggle(row, true);
      say(ui, 'Unlocked ' + n + ' read only field' + (n === 1 ? '.' : 's.'));
    });
  });
  stateToggles.push(function () { setToggle(unlockButton, store.unlockedOn); });

  var hiddenButton = formAction(formPanel.grid, 'Show hidden fields', ACTION_ICON.show, function (row) {
    withForm(function (xrm) {
      if (store.hiddenOn) {
        var back = reHide(xrm, store);
        setToggle(row, false);
        say(ui, 'Hidden again: ' + back.fields + ' fields, ' + back.sections + ' sections, ' + back.tabs + ' tabs.');
        return;
      }
      var n = showHidden(xrm, store);
      setToggle(row, true);
      say(ui, 'Made visible: ' + n.fields + ' fields, ' + n.sections + ' sections, ' + n.tabs + ' tabs.');
    });
  });
  stateToggles.push(function () { setToggle(hiddenButton, store.hiddenOn); });

  var mandatoryButton = formAction(formPanel.grid, 'Remove mandatory', ACTION_ICON.optional, function (row) {
    withForm(function (xrm) {
      if (store.mandatoryOn) {
        var back = restoreMandatory(xrm, store);
        setToggle(row, false);
        say(ui, 'Set ' + back + ' field' + (back === 1 ? '' : 's') + ' back to mandatory.');
        return;
      }
      var n = removeMandatory(xrm, store);
      if (!n) { say(ui, 'No mandatory fields on this form.'); return; }
      setToggle(row, true);
      say(ui, 'Set ' + n + ' field' + (n === 1 ? '' : 's') + ' to optional.');
    });
  });
  stateToggles.push(function () { setToggle(mandatoryButton, store.mandatoryOn); });

  var dirtyButton = formAction(formPanel.grid, 'Unsaved values', ACTION_ICON.dirty, function (row) {
    withForm(function (xrm, docs) {
      if (store.dirtyOn) {
        clearHighlights(docs, 'dirty');
        store.dirtyOn = false;
        setToggle(row, false);
        say(ui, 'Highlighting cleared.');
        return;
      }
      var result = highlightDirty(xrm, docs, store);
      if (!result.names.length) { say(ui, 'No unsaved changes on this form.'); return; }
      store.dirtyOn = true;
      setToggle(row, true);
      rows(ui, result.names.map(function (n) { return [n, 'changed']; }), 'Unsaved values',
        result.highlighted + ' of ' + result.names.length + ' highlighted on the form');
    });
  });
  stateToggles.push(function () { setToggle(dirtyButton, store.dirtyOn); });

  var schemaButton = formAction(formPanel.grid, 'Schema names', ACTION_ICON.schema, function (row, active) {
    withForm(function (xrm, docs) {
      var on = !store.schemaOn;
      var applied = setSchemaNames(xrm, docs, store, on);
      setToggle(row, on);
      if (!on) { say(ui, 'Schema names hidden.'); scheduleSchemaHighlight(docs, on, store); return; }

      say(ui, 'Schema names shown on ' + applied.length + ' fields. Highlighting...');
      scheduleSchemaHighlight(docs, on, store, function (found) {
        // The highlighting has already happened by the time this runs and goes
        // on happening through the watcher. Only the report is conditional: if
        // something else has been clicked in the two and a half seconds this
        // takes, that is what the pane is for now.
        if (!active()) return;
        var missing = applied.filter(function (name) { return !found[name]; });
        ui.setTitle('Schema names', applied.length + ' fields, ' +
          (applied.length - missing.length) + ' highlighted');
        ui.output.textContent = '';
        ui.output.appendChild(el(ui.doc, 'div', { color: T.ink },
          'Schema names shown on ' + applied.length + ' fields, ' +
          (applied.length - missing.length) + ' highlighted.'));
        if (missing.length) {
          ui.output.appendChild(el(ui.doc, 'div', { marginTop: '8px', color: T.ink },
            'Not highlighted yet (' + missing.length + ') - usually fields on an unopened tab, ' +
            'in the header, or with the label switched off. Open the tab and they will be ' +
            'highlighted automatically: ' + missing.join(', ')));
        }
      });
    });
  });
  stateToggles.push(function () { setToggle(schemaButton, store.schemaOn); });

  var blurButton = formAction(formPanel.grid, 'Blur field values', ACTION_ICON.blur, function (row, active) {
    withForm(function (xrm, docs) {
      var on = !store.blurOn;
      store.blurOn = on;
      setToggle(row, on);

      if (!on) {
        stopBlurWatch(store);
        var cleared = clearHighlights(docs, 'blur');
        store.blurTally = null;
        say(ui, 'Blur removed. ' + cleared + ' value' + (cleared === 1 ? '' : 's') +
          ' back to normal.');
        return;
      }

      store.blurTally = { fields: 0, cells: 0, title: 0 };
      say(ui, 'Blurring values...');
      scheduleBlur(docs, true, store, function (tally) {
        // The passes and the watcher run whether or not this report is wanted,
        // the same way the schema highlight does. Only the report is dropped
        // if something else has been clicked in the two and a half seconds it
        // takes to finish painting.
        if (!active()) return;
        var total = tally.fields + tally.cells + tally.title;
        ui.setTitle('Blur field values', total + ' blurred on the form');
        ui.output.textContent = '';
        var line = function (text, gap) {
          ui.output.appendChild(el(ui.doc, 'div',
            { color: T.ink, marginTop: gap ? '8px' : '0' }, text));
        };
        line('Blurred ' + tally.fields + ' value node' + (tally.fields === 1 ? '' : 's') +
          ' across ' + tally.located + ' field' + (tally.located === 1 ? '' : 's') +
          (tally.cells ? ' and ' + tally.cells + ' subgrid cell' + (tally.cells === 1 ? '' : 's') : '') +
          (tally.title ? ', plus the record title.' : '.'));
        var missed = tally.missed || [];
        if (missed.length) {
          line('Not found on the page (' + missed.length + ') - usually fields on a tab you ' +
            'have not opened, which are blurred as soon as you do: ' + missed.join(', '), true);
        }
        if (!tally.title) {
          line('The record title was not found, so it is not blurred. This form\'s header ' +
            'does not carry the markup the toolkit looks for.', true);
        }
        line('Display names, tabs, sections and column headers are left readable. The ' +
          'timeline is not covered.', true);
        // Said every time, not once. Somebody who thinks this redacts anything
        // will share a screen recording believing it is safe.
        line('This hides values on screen only. They are still in the page, still readable ' +
          'through the browser developer tools and still returned by the Web API, so treat ' +
          'it as a screen sharing aid rather than redaction.', true);
        line('Fields on tabs you open later are blurred as they appear. Refreshing the page ' +
          'clears it, like every other change here.', true);
      });
    });
  });
  stateToggles.push(function () { setToggle(blurButton, store.blurOn); });

  /* ------------------------------------------------------------- inspect --- */

  // One column now, so the order is the order they are read in: the four that
  // read this record first, then the four that read the form's configuration
  // and how it performs. That grouping used to be carried by which column a
  // row landed in; in a single column it is carried by the sequence.
  var inspectPanel = addPanel(ui, 'Inspect');

  addDisplayAction(inspectPanel.grid, 'All fields', function (active) {
    withApi(function (xrm) {
      say(ui, 'Reading fields and values...');
      allFields(xrm, record).then(function (items) {
        if (!active()) return;
        copyableList(ui, items, record.table, win, xrm, active);
      }, function (e) { if (active()) failed('Could not read the fields')(e); });
    });
  });

  addDisplayAction(inspectPanel.grid, 'Choice field values', function (active) {
    withForm(function (xrm) {
      if (!active()) return;
      var list = choiceFieldValues(xrm, store);
      groups(ui, list, 'Choice field values');
      ui.resultMetaText(list.length + ' choice columns on this form');
    });
  });

  addDisplayAction(inspectPanel.grid, 'Related record count', function (active) {
    withApi(function (xrm) {
      say(ui, 'Reading relationships...');
      Promise.all([
        readRelationships(xrm, store, record.table),
        // The count queries are built from the entity set name, not the
        // logical name, so it has to be resolved before any of them run.
        xrm.Utility.getEntityMetadata(record.table)
      ]).then(function (results) {
        var list = results[0];
        var entitySet = results[1] && results[1].EntitySetName;
        if (!active()) return null;
        if (!entitySet) throw new Error('the entity set name could not be resolved');

        var tables = [];
        var seen = {};
        list.forEach(function (rel) {
          if (!rel.table || seen[rel.table]) return;
          seen[rel.table] = true;
          tables.push(rel.table);
        });

        return tableDisplayNames(xrm, tables).then(function (names) {
          if (!active()) return null;
          labelRelationships(list, names);
          return countAll(ui, xrm, record, entitySet, list, active).then(function (counts) {
            if (!active()) return;
            relationshipList(ui, record, list, counts);
          });
        });
      }).then(null, function (e) {
        if (active()) failed('Could not read relationships')(e);
      });
    });
  });

  addDisplayAction(inspectPanel.grid, 'Record properties', function (active) {
    withApi(function (xrm) {
      say(ui, 'Loading record properties...');
      readProperties(xrm, record).then(function (r) {
        if (!active()) return;
        rows(ui, [
          ['Created by', display(r, '_createdby_value')],
          ['Created on', display(r, 'createdon')],
          ['Modified by', display(r, '_modifiedby_value')],
          ['Modified on', display(r, 'modifiedon')],
          ['Status', display(r, 'statecode')],
          ['Status reason', display(r, 'statuscode')]
        ], 'Record properties', record.table);
      }, function (e) { if (active()) failed('Could not read properties')(e); });
    });
  });

  // Not a listing - two shortcuts out to Microsoft's own tools. Neither reads
  // or writes anything, so it does not go through withApi.
  addDisplayAction(inspectPanel.grid, 'JavaScript libraries', function (active) {
    withApi(function (xrm) {
      say(ui, 'Reading form definition...');
      getFormXml(xrm, store).then(function (formXml) {
        if (!active()) return;
        libraryList(ui, xrm, store, formXml, win, active);
      }, function (e) { if (active()) failed('Could not read the form definition')(e); });
    });
  });

  addDisplayAction(inspectPanel.grid, 'Event handlers', function (active) {
    withApi(function (xrm) {
      say(ui, 'Reading form definition...');
      getFormXml(xrm, store).then(function (formXml) {
        if (!active()) return;
        rows(ui, readHandlers(formXml), 'Event handlers', 'on form "' + formXml.name + '"');
      }, function (e) { if (active()) failed('Could not read the form definition')(e); });
    });
  });

  // Paints every row against the state the window is already carrying. Without
  // this a panel closed and reopened on the same record would come back with
  // its switches off while the form was still changed.
  resyncToggles();

  addDisplayAction(inspectPanel.grid, 'Business rules', function (active) {
    withApi(function (xrm) {
      say(ui, 'Loading business rules...');
      var formId = getFormId(xrm);
      readBusinessRules(xrm, record).then(function (result) {
        if (!active()) return;
        var list = (result && result.entities) || [];
        rows(ui, list.map(function (r) {
          var state = display(r, 'statecode');
          if (formId && r.formid && clean(r.formid) === formId) state += ' - this form';
          else if (r.formid) state += ' - another form';
          return [r.name || '(unnamed)', state];
        }), 'Business rules', 'for ' + record.table);
      }, function (e) { if (active()) failed('Could not read business rules')(e); });
    });
  });

  addDisplayAction(inspectPanel.grid, 'Performance', function (active) {
    if (!active()) return;
    ui.setTitle('Performance', "Microsoft's own tools - both open in a new tab");

    // Both buttons do the same thing to a different parameter, and both report
    // the popup being blocked rather than leaving you looking at nothing.
    function openWith(param, name, next) {
      var url = urlWithParam(win, param);
      if (!url) return 'This page URL could not be read, so the tab was not opened.';
      var tab = null;
      try { tab = win.open(url, '_blank'); } catch (e) { /* blocked */ }
      return tab
        ? 'Opened in a new tab. ' + next
        : 'Popup blocked. Add "&' + param + '=true" to the URL in this tab instead.';
    }
    toolLinks(ui, [
      {
        title: 'Live monitor',
        detail: 'Opens this page again in a new tab with "&monitor=true" added to the URL. ' +
          'In that tab, select Live monitor on the command bar to start the session, then ' +
          'select Join when the app asks. Events appear in the monitor tab as you use the app.',
        label: 'Live monitor',
        icon: ICON.external,
        run: function () { return openWith('monitor', 'Live monitor', 'Select Live monitor on the command bar there.'); }
      },
      {
        title: 'Performance Centre',
        detail: 'Client-side timings for the page load and the requests behind it. Opens this ' +
          'page again in a new tab with "&perf=true" added to the URL, so the figures describe ' +
          'that fresh load rather than the page you are on now. To measure this page as it ' +
          'stands, press ' + PERF_CENTRE_SHORTCUT + ' here instead. Not a documented Microsoft ' +
          'feature - treat it as unsupported.',
        label: 'Performance Centre',
        icon: ICON.external,
        run: function () {
          return openWith('perf', 'Performance Centre',
            'It opens over the app once the page has loaded.');
        }
      }
    ]);
  });

  /* --------------------------------------------------------------- web api --- */

  var webApiButton = actionButton(doc, 'Web API', ICON.external, false,
    'Open this record in the Web API in a new tab', function () {
      refreshRecord();
      releaseDisplay();
      var ticket = claimResults();
      withApi(function (xrm) {
        // Opened before the metadata call so the click still counts as a user
        // gesture and the popup blocker stays out of the way.
        var tab = null;
        try { tab = win.open('', '_blank'); } catch (e) { /* blocked */ }
        say(ui, 'Resolving entity set name...');
        webApiUrl(xrm, record).then(function (url) {
          if (!holdsResults(ticket)) { if (tab) tab.location.href = url; return; }
          if (tab) { tab.location.href = url; say(ui, 'Opened in a new tab.'); }
          else { rows(ui, [['Popup blocked', url]], 'Web API'); }
        }, function (e) {
          if (tab) tab.close();
          if (!holdsResults(ticket)) return;
          fail(ui, 'Could not resolve the Web API URL: ' + (e && e.message ? e.message : 'unknown error'));
        });
      });
    });
  ui.recordActions.appendChild(webApiButton);
  ui.buttons.push(webApiButton);

  /* ------------------------------------------------------------- the gate --- */

  // Nothing is usable until the role check has passed. This is a guard against
  // accidental use, not a security control - it runs in the browser and the
  // platform still enforces the user's real privileges on every call.
  setEnabled(ui, false);
  refreshRecord();
  say(ui, 'Checking your security roles...');

  (function gateAccess() {
    var fw = findFormWindow();
    if (!fw || !fw.Xrm || !fw.Xrm.WebApi) {
      ui.environment('', false);
      deny(ui, 'The Dynamics client could not be reached on this page. Open a ' +
        'model-driven app record and run the toolkit again.');
      return;
    }
    // Set before the role check rather than after it. The pill answers "is
    // there a live client on this page, and which environment", and a user
    // who is about to be denied is still connected to one.
    try { ui.environment(hostOf(fw.Xrm.Utility.getGlobalContext().getClientUrl()), true); }
    catch (e) { ui.environment('', false); }
    readSecurityRoles(fw.Xrm).then(function (result) {
      if (!result.isAdmin) {
        deny(ui, 'This toolkit is restricted to users with the System Administrator ' +
          'security role. Your account does not have that role in this environment, ' +
          'so the actions have been disabled.');
        return;
      }
      authorised = true;
      ui.identify(currentUserName(fw.Xrm), result.roles);
      setEnabled(ui, true);
      refreshRecord();
      say(ui, 'Pick an action.');
    }, function (e) {
      deny(ui, 'Your security roles could not be confirmed (' +
        (e && e.message ? e.message : 'unknown error') +
        '). Access is blocked as a precaution.');
    });
  })();
})();
