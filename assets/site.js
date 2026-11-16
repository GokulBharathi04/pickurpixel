/* Pick your Pixel: the interface and the scroll scenes.
 *
 * The structure follows what REA showed in relevovinco.com's scene script
 * (static evidence ev_996fe013…): small "relief" helpers that flatten or mirror
 * a shadow, four effects (emboss, crease, press, rake) wired to elements by a
 * data-motion attribute, and one scene per section (the hero sinks, a statement
 * is pressed line by line, cards are dealt, a track slides, a lid rises, a light
 * rakes the closing title). Written fresh for this page.
 *
 * Everything is visible and usable without this file; the scenes only run when
 * motion is allowed.
 */
(function () {
  'use strict';
  var doc = document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Navigation: steps aside while you read down, returns on the way up ---------- */
  var nav = $('#navigation');
  var bar = $('.nav__bar', nav);
  var menu = $('#menu');
  var toggle = $('.nav__toggle', nav);
  var closeBtn = $('.nav__close', nav);
  var last = window.scrollY;
  addEventListener('scroll', function () {
    var y = window.scrollY, delta = y - last;
    last = y;
    if (!menu.hidden) return;
    if (delta > 0 && y > bar.offsetHeight * 2) nav.setAttribute('data-hidden', '');
    else if (delta < 0) nav.removeAttribute('data-hidden');
  }, { passive: true });
  nav.addEventListener('focusin', function () { nav.removeAttribute('data-hidden'); });

  function setMenu(open) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (window.lenis) { if (open) window.lenis.stop(); else window.lenis.start(); }
    (open ? closeBtn : toggle).focus();
  }
  toggle.addEventListener('click', function () { setMenu(true); });
  closeBtn.addEventListener('click', function () { setMenu(false); });
  menu.addEventListener('click', function (e) {
    if (!e.target.closest('a')) return;
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (window.lenis) window.lenis.start();
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  /* ---------- The brief: writes a WhatsApp message; nothing is sent without the visitor ---------- */
  var form = $('#brief');
  if (form) {
    var nameField = form.elements.name;
    nameField.addEventListener('input', function () { nameField.removeAttribute('aria-invalid'); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!nameField.value.trim()) {
        nameField.setAttribute('aria-invalid', 'true');
        nameField.focus();
        return;
      }
      var lines = ['Hi Pick your Pixel! I would like a free consultation and an itemised quote.'];
      $$('.field', form).forEach(function (field) {
        var input = $('input, textarea', field), label = $('label', field);
        if (input && input.value.trim()) lines.push(label.textContent.trim() + ': ' + input.value.trim());
      });
      window.open('https://wa.me/918870297917?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }

  /* ---------- Hero: its slow light and sway rest while it is off screen ---------- */
  var hero = $('#hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      hero.toggleAttribute('data-paused', !entries[0].isIntersecting);
    }).observe(hero);
  }

  /* ---------- Scenes ---------- */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  // Smooth scrolling, driven by GSAP's clock so the scenes and the page move together.
  if (window.Lenis) {
    var lenis = window.lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.9, anchors: { offset: -bar.offsetHeight } });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* Relief helpers. A shadow list is split at top-level commas (colours have
     commas inside brackets); "flat" sets every offset to zero, "mirror" moves the
     light to the other side by negating each shadow's first offset. */
  function split(list) {
    var out = [], depth = 0, cur = '';
    for (var i = 0; i < list.length; i++) {
      var c = list.charAt(i);
      if (c === '(') depth++;
      if (c === ')') depth--;
      if (c === ',' && !depth) { out.push(cur.trim()); cur = ''; } else cur += c;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  var relief = {
    flat: function (v) { return v.replace(/-?\d*\.?\d+px/g, '0px'); },
    mirror: function (v) {
      return split(v).map(function (shadow) {
        var n = 0;
        return shadow.replace(/-?\d*\.?\d+px/g, function (m) { return n++ === 0 ? (-parseFloat(m)) + 'px' : m; });
      }).join(', ');
    },
    token: function (el, name, prop) {
      var before = el.style[prop];
      el.style[prop] = 'var(' + name + ')';
      var value = getComputedStyle(el)[prop];
      el.style[prop] = before;
      return value;
    }
  };

  var effects = {
    // Rises out of the sheet: from flat to its resting relief
    emboss: function (el) {
      var style = getComputedStyle(el);
      var prop = style.textShadow !== 'none' ? 'textShadow' : (style.boxShadow !== 'none' ? 'boxShadow' : null);
      var from = { y: 10 }, to = { y: 0, duration: 1.1, ease: 'power3.out' };
      if (prop) { from[prop] = relief.flat(style[prop]); to[prop] = style[prop]; }
      return gsap.fromTo(el, from, to);
    },
    // A fold line runs across
    crease: function (el) {
      return gsap.fromTo(el, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 1.3, ease: 'power2.inOut' });
    },
    // Starts standing proud of the sheet and is pressed in as it scrolls up
    press: function (el) {
      var rest = getComputedStyle(el).textShadow;
      return gsap.fromTo(el,
        { textShadow: relief.token(el, '--press-start', 'textShadow'), scale: 1.035, y: -3, transformOrigin: '0% 60%' },
        { textShadow: rest, scale: 1, y: 0, ease: 'none', duration: 1 });
    },
    // The light swings round to the other side
    rake: function (el) {
      var rest = getComputedStyle(el).textShadow;
      return gsap.fromTo(el, { textShadow: relief.mirror(rest) }, { textShadow: rest, ease: 'none', duration: 1 });
    }
  };
  var when = {
    emboss: { start: 'top 88%', once: true },
    crease: { start: 'top 92%', once: true },
    press: { start: 'top 92%', end: 'top 48%', scrub: true }
  };
  Object.keys(when).forEach(function (name) {
    $$('[data-motion~="' + name + '"]').forEach(function (el) {
      var vars = { trigger: el, animation: effects[name](el) };
      Object.keys(when[name]).forEach(function (k) { vars[k] = when[name][k]; });
      ST.create(vars);
    });
  });

  var mm = gsap.matchMedia();
  var sizes = { wide: '(min-width: 768px)', narrow: '(max-width: 767.98px)' };

  /* Hero sinks into the indigo while the press rises over it */
  mm.add(sizes, function (ctx) {
    var flap = $('.hero__flap'), wash = $('.hero__wash');
    gsap.timeline({ scrollTrigger: {
      trigger: hero, start: 'bottom bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true,
      onUpdate: function (self) { hero.toggleAttribute('data-sinking', self.progress > 0); }
    } })
      .fromTo(flap, { y: 0, scale: 1, transformOrigin: '50% 40%' }, { y: function () { return hero.offsetHeight; }, scale: ctx.conditions.narrow ? 0.9 : 0.86, ease: 'none' }, 0)
      .fromTo(wash, { opacity: 0 }, { opacity: 0.42, ease: 'none' }, 0);
    return function () { hero.removeAttribute('data-sinking'); };
  });

  /* The press: the sheet rises, then a roller presses the statement in, line by line */
  mm.add(sizes, function (ctx) {
    var section = $('#purpose'), flap = $('.purpose__flap', section), statement = $('.purpose__statement', section), roller = $('.purpose__roller', section);
    var lines = $$('.purpose__line', statement);
    var rest = lines.map(function (line) { return getComputedStyle(line).textShadow; });
    section.setAttribute('data-press', '');
    lines.forEach(function (line) { line.setAttribute('data-pressed', '0'); });

    gsap.timeline({ scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true } })
      .fromTo(flap, { scale: ctx.conditions.narrow ? 0.92 : 0.94, transformOrigin: '50% 0%' }, { scale: 1, ease: 'none' });

    var pad = 0.7, span = lines.length + pad * 2;
    var lineHeight = function () { return statement.offsetHeight / lines.length; };
    var press = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } });
    press
      .fromTo(roller, { y: function () { return -roller.offsetHeight / 2 - lineHeight() * pad; } }, { y: function () { return statement.offsetHeight + lineHeight() * pad - roller.offsetHeight / 2; }, duration: 1 }, 0)
      .fromTo(roller, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0)
      .to(roller, { autoAlpha: 0, duration: 0.06 }, 0.94);
    lines.forEach(function (line, i) {
      var at = (pad + i + 0.5) / span;
      press.fromTo(line, { textShadow: relief.flat(rest[i]), opacity: 0.3 }, { textShadow: rest[i], opacity: 1, duration: 0.09 }, at - 0.045)
        .set(line, { attr: { 'data-pressed': 1 } }, at);
    });
    return function () {
      section.removeAttribute('data-press');
      lines.forEach(function (line) { line.removeAttribute('data-pressed'); });
    };
  });

  /* Services: dealt out of one pile into the grid */
  mm.add('(min-width: 641px)', function () {
    var grid = $('.svc-grid'), cards = $$('.svc', grid);
    var turns = [-9, 6, -3, 8, -6, 4, -2, 7, -5, 3];
    var pile = function () {
      var box = grid.getBoundingClientRect(), first = cards[0].getBoundingClientRect();
      return { x: box.left + box.width / 2, y: first.top + first.height / 2 };
    };
    var offset = function (card, axis) {
      return function () {
        var p = pile(), box = card.getBoundingClientRect(), current = gsap.getProperty(card, axis);
        return axis === 'x' ? p.x - (box.left + box.width / 2 - current) : p.y - (box.top + box.height / 2 - current);
      };
    };
    var deal = gsap.timeline({ scrollTrigger: { trigger: grid, start: 'top 85%', end: 'top 12%', scrub: true, invalidateOnRefresh: true } });
    cards.forEach(function (card, i) {
      deal.fromTo(card,
        { x: offset(card, 'x'), y: offset(card, 'y'), rotation: turns[i % turns.length], scale: 0.82, zIndex: cards.length - i },
        { x: 0, y: 0, rotation: 0, scale: 1, ease: 'power2.inOut', duration: 0.6 }, i * 0.07);
    });
  });

  /* How we work: the track slides sideways while the section holds still, and
     each step's drawing works as it passes the middle */
  mm.add(sizes, function (ctx) {
    var section = $('#process'), channel = $('.process__channel', section), track = $('.process__track', section);
    section.setAttribute('data-track', '');
    var distance = function () { return Math.max(0, track.scrollWidth - channel.clientWidth); };
    var measure = function () { section.style.setProperty('--process-distance', distance() + 'px'); };
    measure();
    ST.addEventListener('refreshInit', measure);
    var travel = gsap.to(track, { x: function () { return -distance(); }, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } });
    var narrow = ctx.conditions.narrow;
    var station = function (step) {
      return { trigger: step, containerAnimation: travel, start: narrow ? 'center 92%' : 'center 84%', end: narrow ? 'center 40%' : 'center 46%', scrub: true };
    };
    var step = function (name) { return $('[data-step="' + name + '"]', section); };
    var drawIn = function (els) { return { from: { strokeDasharray: 1, strokeDashoffset: 1 }, to: { strokeDashoffset: 0, ease: 'none' } }; };

    var s = step('discover');
    gsap.timeline({ scrollTrigger: station(s) }).fromTo($$('.draw', s), drawIn().from, { strokeDashoffset: 0, ease: 'none', stagger: 0.3, duration: 0.7 });
    s = step('plan');
    gsap.timeline({ scrollTrigger: station(s) }).fromTo($$('.draw', s), drawIn().from, { strokeDashoffset: 0, ease: 'none', stagger: 0.14, duration: 0.4 });
    s = step('design');
    gsap.timeline({ scrollTrigger: station(s) })
      .fromTo($('.cutline', s), drawIn().from, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0)
      .fromTo($('.score', s), { opacity: 0 }, { opacity: 0.7, ease: 'none', duration: 0.3 }, 0.7);
    s = step('build');
    gsap.timeline({ scrollTrigger: station(s) }).fromTo($$('.tile', s), { scale: 1.12, fill: '#e8e7df', transformOrigin: '50% 50%' }, { scale: 1, fill: '#3b3a6e', ease: 'power2.out', stagger: 0.07, duration: 0.3 });
    s = step('launch');
    var rows = $$('.res rect', s);
    gsap.timeline({ scrollTrigger: station(s) })
      .fromTo(rows.slice(0, 3), { y: 0 }, { y: 30, ease: 'power1.inOut', duration: 1 }, 0)
      .fromTo(rows[3], { y: 0 }, { y: -90, ease: 'power1.inOut', duration: 1 }, 0);
    s = step('grow');
    gsap.timeline({ scrollTrigger: station(s) }).fromTo($$('.bar-g rect', s), { scaleY: 0.15, transformOrigin: '50% 100%' }, { scaleY: 1, ease: 'power2.out', stagger: 0.12, duration: 0.6 });

    return function () {
      ST.removeEventListener('refreshInit', measure);
      section.removeAttribute('data-track');
      section.style.removeProperty('--process-distance');
    };
  });

  /* Packages: the lid rises out of its socket and settles */
  mm.add('all', function () {
    var lid = $('.kit__lid');
    if (!lid) return;
    var rest = getComputedStyle(lid).boxShadow;
    gsap.timeline({ scrollTrigger: { trigger: lid, start: 'top bottom', end: 'top 30%', scrub: true, invalidateOnRefresh: true } })
      .fromTo(lid, { y: function () { return innerHeight * 0.14; }, boxShadow: relief.token(lid, '--raise-low', 'boxShadow') }, { y: 0, boxShadow: rest, ease: 'power1.out', duration: 1 });
  });

  /* Contact: the light comes round from the right; the title and the fields rake with it */
  mm.add('all', function () {
    var section = $('#contact');
    if (!section) return;
    var light = $('.contact__light', section);
    var sun = gsap.timeline({ defaults: { ease: 'none', duration: 1 }, scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 10%', scrub: true, invalidateOnRefresh: true } });
    sun.fromTo(light, { x: function () { return innerWidth * 0.55; } }, { x: 0 }, 0);
    $$('.contact__word', section).forEach(function (word) { sun.add(effects.rake(word), 0); });
    $$('.field input, .field textarea', section).forEach(function (well) {
      var rest = getComputedStyle(well).boxShadow;
      sun.fromTo(well, { boxShadow: relief.mirror(rest) }, { boxShadow: rest }, 0);
    });
  });

  // Fonts and pictures change heights; measure again once they have arrived.
  var refresh = function () { ST.sort(); ST.refresh(); };
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(refresh);
  addEventListener('load', refresh);
  // Opening a card or a question changes the page height.
  $$('details').forEach(function (d) { d.addEventListener('toggle', function () { ST.refresh(); }); });
})();
