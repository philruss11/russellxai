/* =========================================================
   RussellxAI — site interactions (vanilla, no dependencies)
   ========================================================= */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year stamp ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- nav: scrolled state + progress bar ---------- */
  var nav = document.getElementById("nav");
  var progress = document.getElementById("progress");
  var heroInner = document.querySelector(".hero__inner");
  var phGlow = document.querySelector(".page-header__glow");
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("scrolled", y > 24);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
    if (!reduceMotion) {
      var vh = window.innerHeight;
      if (heroInner && y < vh) {
        heroInner.style.transform = "translateY(" + (y * 0.16).toFixed(1) + "px)";
        heroInner.style.opacity = Math.max(0, 1 - y / (vh * 0.82)).toFixed(3);
      }
      if (phGlow && y < vh) {
        phGlow.style.transform = "translateY(" + (y * 0.28).toFixed(1) + "px)";
      }
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- character-by-character heading ---------- */
  document.querySelectorAll(".char-head").forEach(function (head) {
    var chars = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          var cw = null;
          child.nodeValue.split("").forEach(function (c) {
            if (/\s/.test(c)) { cw = null; frag.appendChild(document.createTextNode(" ")); return; }
            if (!cw) { cw = document.createElement("span"); cw.className = "word"; frag.appendChild(cw); }
            var s = document.createElement("span");
            s.className = "ch";
            s.textContent = c === " " ? " " : c;
            chars.push(s);
            cw.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(head);
    if (reduceMotion) { chars.forEach(function (s) { s.classList.add("in"); }); return; }
    var start = function () {
      chars.forEach(function (s, i) { setTimeout(function () { s.classList.add("in"); }, 140 + i * 26); });
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { start(); io.disconnect(); }
      }, { threshold: 0.15 });
      io.observe(head);
    } else { start(); }
  });

  /* ---------- magnetic buttons ---------- */
  if (!reduceMotion) {
    document.querySelectorAll(".magnetic").forEach(function (m) {
      var strength = 0.35;
      m.addEventListener("pointermove", function (e) {
        var r = m.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        m.style.transition = "";
        m.style.transform = "translate3d(" + (dx * strength).toFixed(1) + "px," + (dy * strength).toFixed(1) + "px,0)";
      });
      m.addEventListener("pointerleave", function () {
        m.style.transition = "transform .5s ease-out";
        m.style.transform = "translate3d(0,0,0)";
      });
    });
  }

  /* ---------- chrome human follows the cursor ---------- */
  (function () {
    var chrome = document.getElementById("heroChrome");
    if (!chrome || reduceMotion) return;
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function onMove(e) {
      var w = window.innerWidth, h = window.innerHeight;
      cx = ((e.clientX - w / 2) / (w / 2)) * 30;
      cy = ((e.clientY - h / 2) / (h / 2)) * 22;
      if (!raf) raf = requestAnimationFrame(apply);
    }
    function apply() {
      raf = null;
      tx += (cx - tx) * 0.16; ty += (cy - ty) * 0.16;
      chrome.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) rotateY(" + (tx * 0.4).toFixed(2) + "deg) rotateX(" + (-ty * 0.4).toFixed(2) + "deg)";
      if (Math.abs(cx - tx) > 0.2 || Math.abs(cy - ty) > 0.2) raf = requestAnimationFrame(apply);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
  })();

  /* ---------- scroll-driven marquee ---------- */
  (function () {
    var sec = document.getElementById("marquee");
    var r1 = document.getElementById("mrow1");
    var r2 = document.getElementById("mrow2");
    if (!sec || !r1 || !r2) return;
    [r1, r2].forEach(function (row) { row.innerHTML = row.innerHTML + row.innerHTML + row.innerHTML; });
    function onM() {
      var top = sec.getBoundingClientRect().top + window.pageYOffset;
      var offset = (window.pageYOffset - top + window.innerHeight) * 0.3;
      r1.style.transform = "translateX(" + (offset - 520).toFixed(1) + "px)";
      r2.style.transform = "translateX(" + (-offset - 520).toFixed(1) + "px)";
    }
    window.addEventListener("scroll", onM, { passive: true });
    window.addEventListener("resize", onM);
    onM();
  })();

  /* ---------- sticky-stacking cards (scale on scroll) ---------- */
  (function () {
    var stack = document.getElementById("stack");
    if (!stack || reduceMotion) return;
    var items = Array.prototype.slice.call(stack.querySelectorAll(".stack__item"));
    var panels = items.map(function (it) { return it.querySelector(".panel"); });
    var topPin = 104;
    function onS() {
      var vh = window.innerHeight;
      for (var i = 0; i < items.length; i++) {
        var next = items[i + 1], panel = panels[i];
        if (!panel) continue;
        if (!next) { panel.style.transform = ""; panel.style.opacity = ""; continue; }
        var nt = next.getBoundingClientRect().top;
        var p = Math.max(0, Math.min(1, (vh - nt) / (vh - topPin)));
        panel.style.transform = "scale(" + (1 - p * 0.09).toFixed(3) + ")";
        panel.style.opacity = (1 - p * 0.4).toFixed(3);
      }
    }
    window.addEventListener("scroll", onS, { passive: true });
    window.addEventListener("resize", onS);
    onS();
  })();

  /* ---------- scroll-driven animated text (dim -> bright per char) ---------- */
  document.querySelectorAll(".animated-text").forEach(function (el) {
    var text = el.textContent;
    el.textContent = "";
    var spans = [];
    text.split("").forEach(function (c) {
      var s = document.createElement("span");
      s.textContent = c;
      s.style.opacity = "0.2";
      spans.push(s);
      el.appendChild(s);
    });
    if (reduceMotion) { spans.forEach(function (s) { s.style.opacity = "1"; }); return; }
    function upd() {
      var r = el.getBoundingClientRect(), vh = window.innerHeight;
      var startY = vh * 0.85, endY = vh * 0.25;
      var p = (startY - r.top) / (startY - endY + r.height);
      p = Math.max(0, Math.min(1, p));
      var reveal = p * spans.length;
      for (var i = 0; i < spans.length; i++) {
        var d = reveal - i;
        spans[i].style.opacity = (d >= 1 ? 1 : (d <= 0 ? 0.2 : 0.2 + 0.8 * d)).toFixed(2);
      }
    }
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  });

  /* ---------- 3D brain (services) ---------- */
  (function () {
    var canvas = document.getElementById("brain3d");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var data = {
      numbers:   { lobe: "Prefrontal cortex · judgment", name: "Your numbers, made plain", desc: "The prefrontal cortex weighs decisions. I set up a live dashboard of your revenue, margins, and what is slipping, plus invoice chasing and a fifteen-minute month-end." },
      advisory:  { lobe: "Frontal lobe · planning", name: "Advisory & special projects", desc: "The frontal lobe plans and decides. You bring me a niche need or a one-off, I research it properly, and I build it for you." },
      documents: { lobe: "Parietal lobe · processing", name: "Documents & contracts", desc: "The parietal lobe organizes and integrates. Reports, proposals, and contracts described in a sentence and delivered as the real file, read first and flagged before you sign." },
      marketing: { lobe: "Occipital lobe · vision", name: "Get found online", desc: "The occipital lobe is sight. The SEO work a five thousand dollar a month agency does, run inside your own account, so people actually see you." },
      inbox:     { lobe: "Temporal lobe · language", name: "Your inbox", desc: "The temporal lobe handles language. Your email read, sorted, and drafted in your own voice. You review and send." },
      brain:     { lobe: "Hippocampus · memory", name: "A second brain", desc: "The hippocampus is memory. Everything your business knows, organized into one searchable brain your AI keeps current and that gets sharper every week." },
      setup:     { lobe: "Cerebellum · learning", name: "Set up & taught", desc: "The cerebellum learns through practice. Your own account configured with the approval model on, the right tools installed, and your team taught until it sticks." }
    };
    var nodes = [
      { svc: "numbers",   p: [-0.05, 0.34, 0.66] },
      { svc: "advisory",  p: [-0.30, 0.04, 0.62] },
      { svc: "documents", p: [ 0.18, 0.54, 0.06] },
      { svc: "marketing", p: [ 0.06, 0.16, -0.72] },
      { svc: "inbox",     p: [-0.66, -0.18, 0.20] },
      { svc: "brain",     p: [ 0.10, 0.50, -0.36] },
      { svc: "setup",     p: [ 0.16, -0.46, -0.50] }
    ];
    var pts = [], RX = 0.46, RY = 0.66, RZ = 0.82, off = 0.30, h, i;
    for (h = 0; h < 2; h++) {
      var side = h === 0 ? -1 : 1;
      for (i = 0; i < 175; i++) {
        var u = Math.random(), v = Math.random();
        var th = u * Math.PI * 2, ph = Math.acos(2 * v - 1);
        var sx0 = Math.sin(ph) * Math.cos(th), sy0 = Math.cos(ph), sz0 = Math.sin(ph) * Math.sin(th);
        var noise = 1 + 0.07 * Math.sin(th * 6) * Math.sin(ph * 5);
        var x = side * off + sx0 * RX * noise;
        if (Math.abs(x) < 0.05) continue;
        pts.push([x, sy0 * RY * noise, sz0 * RZ * noise]);
      }
    }
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, Hh = 0;
    function resize() { var r = canvas.getBoundingClientRect(); W = r.width; Hh = r.height; canvas.width = W * dpr; canvas.height = Hh * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    var rotY = 0.5, rotX = -0.22, autoY = 0.0044, velY = autoY, dragging = false, lastX = 0, lastY = 0, active = null, nodeScreen = [], raf = null;
    function project(p, ca, sa, cx, sx) {
      var x = p[0], y = p[1], z = p[2];
      var x1 = x * ca + z * sa, z1 = -x * sa + z * ca;
      var y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      var focal = 2.4, sc = focal / (focal + z2), radius = Math.min(W, Hh) * 0.36;
      return { x: W / 2 + x1 * sc * radius, y: Hh / 2 + y2 * sc * radius, z: z2, sc: sc };
    }
    function frame() {
      if (!dragging) { velY += (autoY - velY) * 0.03; rotY += velY; }
      ctx.clearRect(0, 0, W, Hh);
      var ca = Math.cos(rotY), sa = Math.sin(rotY), cx = Math.cos(rotX), sx = Math.sin(rotX), s, depth, n;
      for (i = 0; i < pts.length; i++) {
        s = project(pts[i], ca, sa, cx, sx);
        depth = (s.z + 1) / 2;
        ctx.beginPath(); ctx.arc(s.x, s.y, 0.6 + depth * 1.7, 0, 6.2832);
        ctx.fillStyle = "rgba(" + (170 + (depth * 60 | 0)) + "," + (44 + (depth * 26 | 0)) + "," + (54 + (depth * 24 | 0)) + "," + (0.14 + depth * 0.6).toFixed(3) + ")";
        ctx.fill();
      }
      nodeScreen = [];
      for (n = 0; n < nodes.length; n++) {
        var sN = project(nodes[n].p, ca, sa, cx, sx), df = (sN.z + 1) / 2, isA = active === nodes[n].svc;
        nodeScreen.push({ svc: nodes[n].svc, x: sN.x, y: sN.y, z: sN.z });
        ctx.shadowColor = "rgba(255,34,51,0.9)"; ctx.shadowBlur = isA ? 18 : (df > 0.5 ? 10 : 3);
        ctx.beginPath(); ctx.arc(sN.x, sN.y, (isA ? 9.5 : 6.5) * sN.sc, 0, 6.2832);
        ctx.fillStyle = (df > 0.32 || isA) ? "rgba(255,42,56," + (0.5 + df * 0.5).toFixed(2) + ")" : "rgba(255,42,56,0.28)";
        ctx.fill(); ctx.shadowBlur = 0;
        if (df > 0.42 || isA) {
          ctx.fillStyle = "#fff"; ctx.font = "700 " + (10.5 * sN.sc).toFixed(1) + "px ui-monospace,Consolas,monospace";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(String(n + 1), sN.x, sN.y + 0.5);
        }
      }
      raf = requestAnimationFrame(frame);
    }
    var listItems = Array.prototype.slice.call(document.querySelectorAll(".brain-list__item"));
    function select(svc) {
      var d = data[svc]; if (!d) return; active = svc;
      document.getElementById("brainLobe").textContent = d.lobe;
      document.getElementById("brainName").textContent = d.name;
      var desc = document.getElementById("brainDesc"); desc.textContent = d.desc; desc.classList.remove("brain-detail__hint");
      var link = document.getElementById("brainLink"); if (link) link.hidden = false;
      listItems.forEach(function (li) { li.classList.toggle("active", li.getAttribute("data-svc") === svc); });
    }
    listItems.forEach(function (li) { li.addEventListener("click", function () { select(li.getAttribute("data-svc")); }); });
    canvas.addEventListener("pointerdown", function (e) { dragging = true; lastX = e.clientX; lastY = e.clientY; if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (x) {} } });
    canvas.addEventListener("pointermove", function (e) { if (!dragging) return; var dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; rotY += dx * 0.008; velY = dx * 0.008; rotX = Math.max(-1.1, Math.min(1.1, rotX + dy * 0.006)); });
    window.addEventListener("pointerup", function () { dragging = false; });
    canvas.addEventListener("click", function (e) {
      var r = canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, best = null, bd = 20, dist, j;
      for (j = 0; j < nodeScreen.length; j++) { if (nodeScreen[j].z < -0.15) continue; dist = Math.hypot(nodeScreen[j].x - mx, nodeScreen[j].y - my); if (dist < bd) { bd = dist; best = nodeScreen[j].svc; } }
      if (best) select(best);
    });
    if (reduceMotion) { autoY = 0; velY = 0; }
    resize();
    window.addEventListener("resize", resize);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
        else if (raf) { cancelAnimationFrame(raf); raf = null; }
      }, { threshold: 0 }).observe(canvas);
    } else { raf = requestAnimationFrame(frame); }
  })();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- smooth anchor scroll (with reduced-motion respect) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal:not(.in)");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- count-up stats ---------- */
  function formatNum(n, opts) {
    var v = Math.round(n);
    if (opts.format === "comma") v = v.toLocaleString("en-US");
    return (opts.prefix || "") + v + (opts.suffix || "");
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var opts = {
      prefix: el.getAttribute("data-prefix") || "",
      suffix: el.getAttribute("data-suffix") || "",
      format: el.getAttribute("data-format") || ""
    };
    if (reduceMotion) { el.textContent = formatNum(target, opts); return; }
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(target * eased, opts);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(target, opts);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- contact form -> compose email to RussellxAI ---------- */
  var form = document.getElementById("contactForm");
  var ok = document.getElementById("formOk");
  if (form) {
    // If a real Formspree endpoint is configured, let it submit normally.
    var action = form.getAttribute("action") || "";
    var formspreeReady = action.indexOf("formspree.io") !== -1 && action.indexOf("your-form-id") === -1;
    form.addEventListener("submit", function (e) {
      if (formspreeReady) return; // real backend handles it
      e.preventDefault();
      var el = form.elements;
      var name = ((el["name"] && el["name"].value) || "").trim();
      var emailEl = el["email"];
      var email = ((emailEl && emailEl.value) || "").trim();
      if (!email) { if (emailEl) emailEl.focus(); return; }
      var business = ((el["business"] && el["business"].value) || "").trim();
      var area = ((el["area"] && el["area"].value) || "").trim();
      var message = ((el["message"] && el["message"].value) || "").trim();
      var subject = "RussellxAI — " + (name || "New inquiry") + (business ? " (" + business + ")" : "");
      var bodyLines = [
        "Name: " + name,
        "Email: " + email,
        business ? "Business: " + business : "",
        area ? "Most time going to: " + area : "",
        "",
        message
      ].filter(Boolean);
      var href = "mailto:RussellxAI@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));
      if (ok) ok.classList.add("show");
      window.location.href = href;
    });
  }

  /* ---------- hero: animated neural-network canvas ---------- */
  var canvas = document.getElementById("heroCanvas");
  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, nodes = [], raf = null, mouse = { x: -999, y: -999 };

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function build() {
      var count = Math.max(26, Math.min(64, Math.floor((W * H) / 22000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.6 + 1
        });
      }
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      var linkDist = Math.min(170, W / 6);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        // gentle pull toward mouse
        var dxm = mouse.x - n.x, dym = mouse.y - n.y;
        var dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 140) { n.x += dxm * 0.0015 * (1 - dm / 140); n.y += dym * 0.0015 * (1 - dm / 140); }
      }
      for (i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            var alpha = (1 - d / linkDist) * 0.45;
            ctx.strokeStyle = "rgba(255,34,51," + alpha.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.shadowColor = "rgba(255,34,51,0.85)";
      for (i = 0; i < nodes.length; i++) {
        var p = nodes[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.shadowBlur = 9;
        ctx.fillStyle = "rgba(255,77,91,0.95)";
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(frame);
    }
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150);
    });
    canvas.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener("pointerleave", function () { mouse.x = -999; mouse.y = -999; });

    // Pause when hero off-screen (saves battery)
    if ("IntersectionObserver" in window) {
      var hero = canvas.closest(".hero");
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
          else { if (raf) { cancelAnimationFrame(raf); raf = null; } }
        });
      }, { threshold: 0 }).observe(hero);
    }
    resize();
  }
})();
