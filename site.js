// Comportements de parqueo.fr — partagés par index.html et services/.
// Aucune dépendance. Chaque bloc vérifie que ses éléments existent : la page
// services n'a ni parcours ni offres, et le script ne doit pas y échouer.
(function () {
  'use strict';
  var root = document.documentElement;
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --- Thème ----------------------------------------------------------- */
  var themeBtn = document.getElementById('theme-btn');
  function themeActuel() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function majLibelleTheme() {
    if (!themeBtn) return;
    themeBtn.setAttribute('aria-label', themeActuel() === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre');
  }
  if (themeBtn) {
    majLibelleTheme();
    themeBtn.addEventListener('click', function () {
      var t = themeActuel() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', t);
      try { localStorage.setItem('parqueo-theme', t); } catch (e) { /* stockage refusé */ }
      majLibelleTheme();
    });
  }

  /* --- Menu sur téléphone ---------------------------------------------- */
  var nav = document.querySelector('.nav');
  var menuBtn = document.getElementById('menu-btn');
  if (nav && menuBtn) {
    var fermer = function () {
      nav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.textContent = 'Menu';
    };
    menuBtn.addEventListener('click', function () {
      var ouvert = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(ouvert));
      menuBtn.textContent = ouvert ? 'Fermer' : 'Menu';
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) { a.addEventListener('click', fermer); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fermer(); });
  }

  /* --- Parcours d'un ticket : le curseur fait avancer le ticket --------
     Quatre étapes. Chaque étape montre sa phrase, sa note, et le ticket dans
     l'état où il est vraiment à ce moment-là dans Parqueo. */
  var range = document.getElementById('stage-range');
  if (range) {
    var ETAPES = [
      { label: 'Nouveau', status: 'new', assignee: null, team: null, valeur: 'La demande arrive' },
      { label: 'Nouveau', status: 'new', assignee: null, team: 'Support N1', valeur: 'Le ticket est parqué' },
      { label: 'En cours', status: 'progress', assignee: 'Sarah Lemoine', team: 'Support N1', valeur: 'Un technicien le prend' },
      { label: 'Résolu', status: 'resolved', assignee: 'Sarah Lemoine', team: 'Support N1', valeur: 'Le ticket se ferme seul' },
    ];
    var tk = document.querySelector('.tk');
    var statut = tk.querySelector('.tk-status');
    var statutLbl = tk.querySelector('[data-status-label]');
    var assignee = tk.querySelector('[data-assignee]');
    var team = tk.querySelector('[data-team]');
    var lignes = Array.prototype.slice.call(tk.querySelectorAll('.tk-log li'));
    var pas = Array.prototype.slice.call(document.querySelectorAll('.journey-steps li'));
    var precedent = 0;

    var valeurDash = function (el, texte, h) {
      el.textContent = '';
      if (!texte) {
        var d = document.createElement('span'); d.className = 'dash'; d.textContent = '—'; el.appendChild(d);
        return;
      }
      if (h != null) {
        var av = document.createElement('span');
        av.className = 'av'; av.style.setProperty('--h', h);
        av.textContent = texte.split(' ').map(function (w) { return w[0]; }).join('');
        el.appendChild(av);
      }
      el.appendChild(document.createTextNode(texte));
    };

    var montrer = function (n) {
      var e = ETAPES[n];
      document.querySelectorAll('[data-stage-text]').forEach(function (el) { el.hidden = Number(el.dataset.stageText) !== n; });
      document.querySelectorAll('[data-stage-note]').forEach(function (el) { el.hidden = Number(el.dataset.stageNote) !== n; });
      statut.dataset.status = e.status;
      statutLbl.textContent = e.label;
      valeurDash(assignee, e.assignee, 212);
      valeurDash(team, e.team, null);
      lignes.forEach(function (li) {
        var visible = Number(li.dataset.from) <= n && (li.dataset.until == null || n < Number(li.dataset.until));
        var etaitCache = li.hidden;
        li.hidden = !visible;
        li.classList.toggle('is-new', visible && etaitCache && n > precedent);
      });
      pas.forEach(function (li, i) { li.classList.toggle('is-current', i === n); });
      range.style.setProperty('--p', (n / 3) * 100 + '%');
      range.setAttribute('aria-valuetext', e.valeur);
      precedent = n;
    };
    range.addEventListener('input', function () { montrer(Number(range.value)); });
    pas.forEach(function (li, i) {
      li.addEventListener('click', function () { range.value = i; montrer(i); });
    });
    montrer(Number(range.value));
  }

  /* --- L'interrupteur géant du workflow -------------------------------- */
  var champ = document.querySelector('.switch-field');
  if (champ) {
    var gs = champ.querySelector('.gs-toggle');
    var mot = champ.querySelector('[data-switch-word]');
    var lbl = champ.querySelector('[data-switch-label]');
    gs.addEventListener('click', function () {
      var on = gs.getAttribute('aria-checked') !== 'true';
      gs.setAttribute('aria-checked', String(on));
      champ.dataset.on = String(on);
      mot.textContent = on ? 'actif' : 'en pause';
      lbl.textContent = on ? 'Actif' : 'En pause';
    });
  }

  /* --- Bandes : une phrase, un interrupteur ---------------------------- */
  document.querySelectorAll('.band .mini-switch').forEach(function (sw) {
    var band = sw.closest('.band');
    sw.addEventListener('click', function () {
      var on = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(on));
      band.dataset.on = String(on);
    });
  });

  /* --- Offres : onglets au clavier et à la souris ---------------------- */
  var onglets = Array.prototype.slice.call(document.querySelectorAll('.plan-names [role="tab"]'));
  if (onglets.length) {
    var choisir = function (tab, focus) {
      onglets.forEach(function (t) {
        var sel = t === tab;
        t.setAttribute('aria-selected', String(sel));
        t.tabIndex = sel ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !sel;
      });
      if (focus) tab.focus();
    };
    onglets.forEach(function (t, i) {
      t.addEventListener('click', function () { choisir(t); });
      t.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? i - 1 : null;
        if (j == null) return;
        e.preventDefault();
        choisir(onglets[(j + onglets.length) % onglets.length], true);
      });
    });
  }

  /* --- Le ticket de démonstration -------------------------------------
     Pas de serveur derrière le site : le formulaire ouvre la messagerie avec
     un email déjà rédigé. Le talon imprime l'heure, comme un ticket. */
  var stamp = document.getElementById('coupon-stamp');
  if (stamp) {
    var d = new Date();
    stamp.textContent = 'Émis le ' + d.toLocaleDateString('fr-FR') + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  var form = document.getElementById('demo-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { return (form.elements[n].value || '').trim(); };
      var corps = [
        'Bonjour,',
        '',
        'Je souhaite une démonstration de Parqueo.',
        '',
        'Nom : ' + v('nom'),
        'Email : ' + v('email'),
        'Parc : ' + (v('parc') || 'à préciser'),
        '',
        'Ce qui nous fait perdre du temps :',
        v('message') || 'à préciser',
      ].join('\n');
      window.location.href = 'mailto:contact@parqueo.fr?subject=' + encodeURIComponent('Démonstration Parqueo') + '&body=' + encodeURIComponent(corps);
    });
  }

  /* --- Copie de l'adresse : recours pour les postes sans client mail ---- */
  document.querySelectorAll('.copy-btn[data-copy]').forEach(function (btn) {
    var txt = btn.querySelector('.copy-txt');
    btn.addEventListener('click', function () {
      var fini = function () {
        txt.textContent = 'Adresse copiée';
        btn.dataset.done = '';
        clearTimeout(btn._t);
        btn._t = setTimeout(function () { txt.textContent = "Copier l'adresse"; delete btn.dataset.done; }, 2000);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(btn.dataset.copy).then(fini, fini);
      else fini();
    });
  });

  /* --- Entrées au défilement ------------------------------------------
     Les enfants de chaque bloc `data-reveal` montent l'un après l'autre. */
  var blocs = document.querySelectorAll('[data-reveal]');
  blocs.forEach(function (b) {
    Array.prototype.forEach.call(b.children, function (c, i) { c.style.setProperty('--i', i); });
  });
  var volets = document.querySelectorAll('.shutter');
  if (!('IntersectionObserver' in window) || reduit.matches) {
    blocs.forEach(function (b) { b.classList.add('is-in'); });
    volets.forEach(function (v) { v.classList.add('is-in'); });
    return;
  }
  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      obs.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  blocs.forEach(function (b) { obs.observe(b); });
  // Le volet du premier écran s'ouvre au chargement, sans attendre le défilement.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { volets.forEach(function (v) { v.classList.add('is-in'); }); });
  });
})();
