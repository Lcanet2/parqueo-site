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

  /* --- L'interrupteur géant du workflow --------------------------------
     Il part en pause et bascule tout seul quand la section arrive à l'écran :
     on voit le geste sans avoir à le faire. Il reste cliquable. */
  var champ = document.querySelector('.switch-field');
  if (champ) {
    var gs = champ.querySelector('.gs-toggle');
    var mot = champ.querySelector('[data-switch-word]');
    var lbl = champ.querySelector('[data-switch-label]');
    var basculer = function (on) {
      gs.setAttribute('aria-checked', String(on));
      champ.dataset.on = String(on);
      mot.textContent = on ? 'actif' : 'en pause';
      lbl.textContent = on ? 'Actif' : 'En pause';
    };
    gs.addEventListener('click', function () { basculer(gs.getAttribute('aria-checked') !== 'true'); });
    if ('IntersectionObserver' in window && !reduit.matches) {
      basculer(false);
      var obsChamp = new IntersectionObserver(function (entrees) {
        if (!entrees[0].isIntersecting) return;
        obsChamp.disconnect();
        setTimeout(function () { basculer(true); }, 450);
      }, { threshold: 0.6 });
      obsChamp.observe(champ);
    }
  }

  /* --- Ce que Parqueo fait : la tâche en cours suit le défilement -------
     Section épinglée (grand écran, voir styles.css) : chaque course de
     défilement passe à la tâche suivante et affiche son écran, la page ne
     bouge pas. Le calcul part de la position, pas du sens : remonter revient
     en arrière. Un clic sur un titre défile jusqu'à sa tâche. Hors
     épinglage, les cinq tâches sont à la suite et rien n'est à suivre. */
  var taches = document.querySelector('.feats');
  var tachesPin = taches && taches.querySelector('.feats-pin');
  var listeTaches = taches ? Array.prototype.slice.call(taches.querySelectorAll('.feat')) : [];
  var tachesEpinglees = function () { return tachesPin && getComputedStyle(tachesPin).position === 'sticky'; };
  var courseTache = function () { return (taches.offsetHeight - tachesPin.offsetHeight) / (listeTaches.length - 1); };
  var hautTaches = function () { return taches.getBoundingClientRect().top + window.scrollY; };
  if (listeTaches.length) {
    var majTaches = function () {
      var n = -1;
      if (tachesEpinglees()) {
        var dy = window.scrollY - hautTaches();
        n = Math.min(listeTaches.length - 1, Math.max(0, Math.round(dy / courseTache())));
      }
      listeTaches.forEach(function (li, i) { li.classList.toggle('is-current', i === n); });
    };
    var majPrevue = false;
    var planifier = function () {
      if (majPrevue) return;
      majPrevue = true;
      requestAnimationFrame(function () { majPrevue = false; majTaches(); });
    };
    window.addEventListener('scroll', planifier, { passive: true });
    window.addEventListener('resize', planifier);
    taches.querySelectorAll('[data-feat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!tachesEpinglees()) return;
        window.scrollTo({ top: hautTaches() + Number(btn.dataset.feat) * courseTache() });
      });
    });
    majTaches();
  }

  /* --- Une page par cran de molette (accueil, grand écran, souris) -----
     Les arrêts sont recalculés à chaque cran : le haut de chaque section,
     un arrêt par tâche dans la section épinglée, les éléments marqués
     `data-stop` (valeur : l'air laissé au-dessus, en px), et sinon des
     paliers dans les sections bien plus hautes que la fenêtre. Le clavier, la barre de
     défilement et le tactile gardent le défilement normal. */
  var molette = window.matchMedia('(min-width: 900px) and (min-height: 640px) and (hover: hover) and (pointer: fine)');
  var pages = Array.prototype.slice.call(document.querySelectorAll('.page-home main > section, .page-home .foot'));
  if (pages.length) {
    var anim = null, finAnim = 0, dernierCran = 0;

    var arrets = function () {
      var vh = window.innerHeight;
      var max = document.documentElement.scrollHeight - vh;
      var liste = [max];
      pages.forEach(function (s) {
        var haut = s.getBoundingClientRect().top + window.scrollY;
        if (s === taches && tachesEpinglees()) {
          for (var k = 0; k < listeTaches.length; k++) liste.push(haut + k * courseTache());
          return;
        }
        var marques = s.querySelectorAll('[data-stop]');
        // Une marge intérieure plus grande que 72 px est un écart entre
        // sections, pas du contenu : on s'arrête sur le contenu. `data-air`
        // laisse de l'air au-dessus d'un titre posé sur le fond blanc.
        var y = haut + Math.max(0, (parseFloat(getComputedStyle(s).paddingTop) || 0) - 72) - (parseFloat(s.dataset.air) || 0);
        var h = s.offsetHeight - (y - haut);
        liste.push(y);
        Array.prototype.forEach.call(marques, function (el) {
          liste.push(el.getBoundingClientRect().top + window.scrollY - (parseFloat(el.dataset.stop) || 0));
        });
        if (!marques.length && h > vh * 1.35) {
          for (var z = y + vh * 0.8; z < y + h - vh; z += vh * 0.8) liste.push(z);
          liste.push(y + h - vh);
        }
      });
      liste = liste.map(function (v) { return Math.round(Math.min(max, Math.max(0, v))); }).sort(function (a, b) { return a - b; });
      return liste.filter(function (v, i) { return i === 0 || v - liste[i - 1] > 32; });
    };

    var adoucir = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
    var arreter = function () { if (anim) { cancelAnimationFrame(anim); anim = null; } };
    var defiler = function (cible) {
      var depart = window.scrollY, d = cible - depart, t0 = performance.now();
      var duree = Math.min(750, 260 + Math.abs(d) * 0.45);
      var image = function (t) {
        var p = Math.min(1, (t - t0) / duree);
        // `instant` : le scroll-behavior: smooth du CSS lisserait chaque image.
        window.scrollTo({ top: depart + d * adoucir(p), behavior: 'instant' });
        if (p < 1) anim = requestAnimationFrame(image);
        else { anim = null; finAnim = performance.now(); }
      };
      anim = requestAnimationFrame(image);
    };

    window.addEventListener('wheel', function (e) {
      if (!molette.matches || reduit.matches || e.ctrlKey || e.defaultPrevented) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.target.closest && e.target.closest('textarea, select')) return;
      e.preventDefault();
      // Un geste = une page. Les crans qui suivent de près (molette qu'on
      // fait tourner, inertie du pavé tactile) sont avalés tant que
      // l'animation tourne, puis tant qu'ils restent faibles et rapprochés.
      var t = performance.now(), calme = t - dernierCran > 160;
      dernierCran = t;
      if (anim) return;
      var dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      if (!calme && (t - finAnim < 400 || Math.abs(dy) < 40)) return;
      if (!dy) return;
      var y = window.scrollY, liste = arrets(), cible = null;
      if (dy > 0) cible = liste.filter(function (v) { return v > y + 32; })[0];
      else cible = liste.filter(function (v) { return v < y - 32; }).pop();
      if (cible != null) defiler(cible);
    }, { passive: false });
    ['keydown', 'mousedown', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, arreter, { passive: true });
    });
  }

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
