const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const hero = document.querySelector(".hero");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const compactMotion = window.matchMedia("(max-width: 900px), (pointer: coarse)");
const motionPanels = document.querySelectorAll(".section, .terminal, .feature, .metric, .contact-panel");
const scrollSections = document.querySelectorAll(".section");
const dataRainSections = document.querySelectorAll("[data-rain-section]");
const dataRainMessages = document.querySelectorAll("[data-final-text]");

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

let requestedHeroFrame = false;

const syncHeroScrollEffect = () => {
  requestedHeroFrame = false;

  if (!hero || reduceMotion.matches) {
    hero?.style.setProperty("--tv-close", "0");
    hero?.style.setProperty("--tv-line", "0");
    return;
  }

  const start = hero.offsetTop;
  const scrubDistance = Math.max(window.innerHeight * 0.28, 1);
  const end = start + scrubDistance;
  const progress = Math.min(Math.max((window.scrollY - start) / (end - start), 0), 1);
  const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  const line = Math.sin(progress * Math.PI);

  hero.style.setProperty("--tv-close", eased.toFixed(3));
  hero.style.setProperty("--tv-line", line.toFixed(3));
};

const requestHeroScrollEffect = () => {
  if (!requestedHeroFrame) {
    requestedHeroFrame = true;
    requestAnimationFrame(syncHeroScrollEffect);
  }
};

if (hero) {
  syncHeroScrollEffect();
  window.addEventListener("load", requestHeroScrollEffect);
  window.addEventListener("pageshow", requestHeroScrollEffect);
  window.addEventListener("scroll", requestHeroScrollEffect, { passive: true });
  window.addEventListener("resize", requestHeroScrollEffect);
}

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navLinks.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("nav-open", !isOpen);
});

navLinks.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    navToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 4, 3) * 60}ms`;
  revealObserver.observe(item);
});

const animateCounter = (element) => {
  const target = Number(element.dataset.count);
  const start = performance.now();
  const duration = 900;

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(target * eased));

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const syncPanelPointer = (event) => {
  if (reduceMotion.matches) {
    return;
  }

  motionPanels.forEach((panel) => {
    const rect = panel.getBoundingClientRect();
    const isNear =
      event.clientX >= rect.left - 120 &&
      event.clientX <= rect.right + 120 &&
      event.clientY >= rect.top - 120 &&
      event.clientY <= rect.bottom + 120;

    if (!isNear) {
      return;
    }

    const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    const y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100;

    panel.style.setProperty("--mx", x.toFixed(2));
    panel.style.setProperty("--my", y.toFixed(2));
  });
};

let requestedPanelFrame = false;

const syncSectionScroll = () => {
  requestedPanelFrame = false;

  if (reduceMotion.matches || compactMotion.matches) {
    scrollSections.forEach((section) => {
      section.style.setProperty("--scroll-progress", "1");
      section.style.setProperty("--section-focus", "1");
    });
    return;
  }

  const viewportHeight = Math.max(window.innerHeight, 1);

  scrollSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const progress = Math.min(Math.max((viewportHeight - rect.top) / (viewportHeight + rect.height), 0), 1);
    const focus = Math.min(Math.max((viewportHeight * 0.82 - rect.top) / (viewportHeight * 0.46), 0), 1);
    section.style.setProperty("--scroll-progress", progress.toFixed(3));
    section.style.setProperty("--section-focus", focus.toFixed(3));
  });
};

const requestPanelScroll = () => {
  if (!requestedPanelFrame) {
    requestedPanelFrame = true;
    requestAnimationFrame(syncSectionScroll);
  }
};

if (motionPanels.length > 0 && !compactMotion.matches) {
  window.addEventListener("pointermove", syncPanelPointer, { passive: true });
}

if (scrollSections.length > 0) {
  syncSectionScroll();
  window.addEventListener("load", requestPanelScroll);
  window.addEventListener("pageshow", requestPanelScroll);
  window.addEventListener("scroll", requestPanelScroll, { passive: true });
  window.addEventListener("resize", requestPanelScroll);
}

const createDataRain = (section) => {
  const canvas = section.querySelector("[data-rain-canvas]");
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: true });
  const glyphs = "01#$%<>/{}[]BTCETHSOLUSDVANDERARBITRAGE<>SCANROUTEΔΞ₿";
  const pointer = { x: -9999, y: -9999, active: false };
  const state = {
    columns: [],
    width: 0,
    height: 0,
    dpr: 1,
    fontSize: 18,
    lastTime: 0,
    animationId: 0
  };

  const resetColumns = () => {
    state.columns = [];
    const count = Math.ceil((state.width / state.fontSize) * 1.72);

    for (let index = 0; index < count; index += 1) {
      state.columns.push({
        x: (index / 1.72) * state.fontSize + (Math.random() - 0.5) * state.fontSize * 0.9,
        y: Math.random() * state.height - state.height * 1.15,
        speed: 42 + Math.random() * 136,
        length: 12 + Math.floor(Math.random() * 30),
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.9
      });
    }
  };

  const resize = () => {
    const rect = section.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(Math.floor(rect.width), 1);
    state.height = Math.max(Math.floor(rect.height), 1);
    state.fontSize = Math.max(13, Math.min(19, state.width / 86));

    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    resetColumns();
  };

  const drawStatic = () => {
    context.clearRect(0, 0, state.width, state.height);
    context.fillStyle = "rgba(2, 2, 10, 0.96)";
    context.fillRect(0, 0, state.width, state.height);
    context.font = `${state.fontSize}px Consolas, monospace`;
    context.textAlign = "center";

    state.columns.forEach((column, columnIndex) => {
      for (let row = 0; row < column.length; row += 1) {
        const glyphIndex = (columnIndex * 7 + row * 11) % glyphs.length;
        const y = row * state.fontSize * 1.45;
        const alpha = Math.max(0.08, 0.62 - row * 0.035);
        context.fillStyle = `rgba(${row < 2 ? "190,168,255" : "56,200,255"}, ${alpha})`;
        context.fillText(glyphs[glyphIndex], column.x, y);
      }
    });
  };

  const getScrollInfluence = () => {
    const rect = section.getBoundingClientRect();
    const viewportHeight = Math.max(window.innerHeight, 1);
    const progress = Math.min(Math.max((viewportHeight - rect.top) / (viewportHeight + rect.height), 0), 1);
    return {
      progress,
      speed: 0.72 + progress * 1.65,
      density: 0.76 + progress * 0.62
    };
  };

  const draw = (time) => {
    const delta = Math.min((time - (state.lastTime || time)) / 1000, 0.05);
    state.lastTime = time;
    const scroll = getScrollInfluence();

    context.fillStyle = "rgba(2, 2, 10, 0.16)";
    context.fillRect(0, 0, state.width, state.height);
    context.font = `${state.fontSize}px Consolas, 'Courier New', monospace`;
    context.textAlign = "center";
    context.textBaseline = "top";

    state.columns.forEach((column, columnIndex) => {
      column.y += column.speed * scroll.speed * delta;
      column.phase += delta * (0.8 + column.drift);

      if (column.y - column.length * state.fontSize > state.height + 60) {
        column.y = -Math.random() * state.height * 0.7 - 80;
        column.speed = 34 + Math.random() * 118;
        column.length = 8 + Math.floor(Math.random() * 22);
      }

      const distanceToPointer = pointer.active ? Math.abs(pointer.x - column.x) : 9999;
      const pointerPull = pointer.active ? Math.max(0, 1 - distanceToPointer / 210) : 0;
      const bend = pointerPull * (pointer.x - column.x) * 0.08;
      const naturalDrift = Math.sin(column.phase + columnIndex * 0.35) * 3.8;

      for (let row = 0; row < column.length * scroll.density; row += 1) {
        const y = column.y - row * state.fontSize * 1.12;
        if (y < -state.fontSize || y > state.height + state.fontSize) {
          continue;
        }

        const glyphIndex = Math.floor((time * 0.018 + columnIndex * 13 + row * 5) % glyphs.length);
        const glyph = glyphs[glyphIndex];
        const head = row < 2;
        const alpha = Math.max(0.05, (head ? 0.92 : 0.62 - row / column.length) + pointerPull * 0.34);
        const x = column.x + naturalDrift + bend * (1 - row / Math.max(column.length, 1));

        context.fillStyle = head
          ? `rgba(234, 225, 255, ${Math.min(alpha, 1)})`
          : row % 3 === 0
            ? `rgba(177, 77, 255, ${Math.min(alpha, 0.86)})`
            : `rgba(56, 200, 255, ${Math.min(alpha, 0.72)})`;
        context.shadowColor = pointerPull > 0.12 || head ? "rgba(177, 77, 255, 0.72)" : "transparent";
        context.shadowBlur = pointerPull > 0.12 || head ? 12 : 0;
        context.fillText(glyph, x, y);
      }
    });

    state.animationId = requestAnimationFrame(draw);
  };

  const handlePointer = (event) => {
    const rect = section.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
  };

  const clearPointer = () => {
    pointer.active = false;
  };

  resize();

  if (reduceMotion.matches) {
    drawStatic();
    return;
  }

  section.addEventListener("pointermove", handlePointer, { passive: true });
  section.addEventListener("pointerleave", clearPointer, { passive: true });
  window.addEventListener("resize", resize);
  state.animationId = requestAnimationFrame(draw);
};

// The previous animated rain canvas was visually rich but expensive on scroll.
// Keep the blackout panel static so the page stays responsive.

const spellDataRainMessage = (element) => {
  if (element.dataset.spelled === "true") {
    return;
  }

  const finalText = element.dataset.finalText || element.textContent.trim();

  if (reduceMotion.matches) {
    element.textContent = finalText;
    element.dataset.spelled = "true";
    return;
  }

  element.dataset.spelled = "true";
  const scrambleGlyphs = "01#$%<>/{}[]BTCETHSOLUSDVANDERΔΞ₿";
  const words = finalText.split(" ");
  const spans = words.map((word, index) => {
    const span = document.createElement("span");
    span.className = "rain-word";
    span.dataset.finalWord = word;
    span.dataset.seed = String(index * 19 + word.length * 7);
    span.style.setProperty("--word-y", `${-(140 + (index % 5) * 42)}px`);
    span.style.setProperty("--word-opacity", "0");
    span.style.setProperty("--word-blur", "8px");
    span.style.setProperty("--word-scale", "1.08");
    span.textContent = word.replace(/\S/g, (_, charIndex) => scrambleGlyphs[(charIndex + index * 5) % scrambleGlyphs.length]);
    return span;
  });

  element.textContent = "";
  spans.forEach((span, index) => {
    element.appendChild(span);

    if (index < spans.length - 1) {
      const space = document.createElement("span");
      space.className = "rain-space";
      space.textContent = " ";
      element.appendChild(space);
    }
  });

  const duration = 980;
  const stagger = 105;
  const hold = 180;
  const start = performance.now() + hold;
  const easeOut = (value) => 1 - Math.pow(1 - value, 3);

  const tick = (now) => {
    let allComplete = true;

    spans.forEach((span, index) => {
      const localStart = start + index * stagger;
      const progress = Math.min(Math.max((now - localStart) / duration, 0), 1);
      const eased = easeOut(progress);
      const startY = -(140 + (index % 5) * 42);
      const settlePulse = progress > 0.72 && progress < 0.9 ? Math.sin((progress - 0.72) / 0.18 * Math.PI) * 8 : 0;

      if (progress < 1) {
        allComplete = false;
      }

      span.style.setProperty("--word-y", `${startY * (1 - eased) - settlePulse}px`);
      span.style.setProperty("--word-opacity", String(Math.min(1, progress * 1.8)));
      span.style.setProperty("--word-blur", `${Math.max(0, 8 * (1 - eased))}px`);
      span.style.setProperty("--word-scale", String(1.08 - eased * 0.08));

      if (progress < 0.82) {
        const seed = Number(span.dataset.seed);
        const finalWord = span.dataset.finalWord || "";
        span.textContent = finalWord.replace(/\S/g, (_, charIndex) => {
          const glyphIndex = Math.floor((now * 0.045 + seed + charIndex * 13) % scrambleGlyphs.length);
          return scrambleGlyphs[glyphIndex];
        });
      } else {
        span.textContent = span.dataset.finalWord || "";
      }
    });

    if (!allComplete) {
      requestAnimationFrame(tick);
    } else {
      spans.forEach((span) => {
        span.textContent = span.dataset.finalWord || "";
        span.style.setProperty("--word-y", "0px");
        span.style.setProperty("--word-opacity", "1");
        span.style.setProperty("--word-blur", "0");
        span.style.setProperty("--word-scale", "1");
      });
    }
  };

  requestAnimationFrame(tick);
};

const spellMatrixRainMessage = (element) => {
  if (element.dataset.matrixSpelled === "true") {
    return;
  }

  const finalText = element.dataset.finalText || element.textContent.trim();

  if (reduceMotion.matches) {
    element.textContent = finalText;
    element.dataset.matrixSpelled = "true";
    return;
  }

  element.dataset.matrixSpelled = "true";
  const scrambleGlyphs = "01#$%<>/{}[]BTCETHSOLUSDVANDERARBITRAGE";
  const tokens = finalText.split(/(\s+)/);
  const letters = [];

  element.textContent = "";

  tokens.forEach((token, tokenIndex) => {
    if (/^\s+$/.test(token)) {
      const space = document.createElement("span");
      space.className = "rain-space";
      space.textContent = token;
      element.appendChild(space);
      return;
    }

    const word = document.createElement("span");
    word.className = "rain-word";

    Array.from(token).forEach((char, charIndex) => {
      const letterIndex = letters.length;
      const letter = document.createElement("span");
      letter.className = "rain-letter";
      letter.dataset.finalChar = char;
      letter.dataset.seed = String(tokenIndex * 31 + charIndex * 17 + letterIndex * 5);
      letter.textContent = scrambleGlyphs[(letterIndex * 7 + charIndex) % scrambleGlyphs.length];
      letter.style.setProperty("--letter-y", `${-(190 + (letterIndex % 11) * 24)}px`);
      letter.style.setProperty("--letter-x", `${((letterIndex % 5) - 2) * 5}px`);
      letter.style.setProperty("--letter-opacity", "0");
      letter.style.setProperty("--letter-blur", "10px");
      letter.style.setProperty("--letter-scale", "1.24");
      word.appendChild(letter);
      letters.push(letter);
    });

    element.appendChild(word);
  });

  const duration = 1180;
  const stagger = 24;
  const hold = 180;
  const start = performance.now() + hold;
  const colors = ["#38c8ff", "#b14dff", "#7c5cff", "#e8e2ff"];
  const easeOut = (value) => 1 - Math.pow(1 - value, 3);

  const tick = (now) => {
    let allComplete = true;

    letters.forEach((letter, index) => {
      const localStart = start + index * stagger;
      const progress = Math.min(Math.max((now - localStart) / duration, 0), 1);
      const eased = easeOut(progress);
      const startY = -(190 + (index % 11) * 24);
      const drift = Math.sin(now * 0.012 + index * 0.9) * (1 - eased) * 8;
      const settlePulse = progress > 0.72 && progress < 0.9 ? Math.sin((progress - 0.72) / 0.18 * Math.PI) * 10 : 0;
      const resolveProgress = Math.max((progress - 0.78) / 0.22, 0);

      if (progress < 1) {
        allComplete = false;
      }

      letter.style.setProperty("--letter-y", `${startY * (1 - eased) - settlePulse}px`);
      letter.style.setProperty("--letter-x", `${drift}px`);
      letter.style.setProperty("--letter-opacity", String(Math.min(1, progress * 2.2)));
      letter.style.setProperty("--letter-blur", `${Math.max(0, 10 * (1 - eased))}px`);
      letter.style.setProperty("--letter-scale", String(1.24 - eased * 0.24));
      letter.style.setProperty("--letter-color", colors[(Math.floor(now * 0.026) + index) % colors.length]);

      if (resolveProgress < 1) {
        const seed = Number(letter.dataset.seed);
        const glyphIndex = Math.floor((now * 0.055 + seed + index * 3) % scrambleGlyphs.length);
        letter.textContent = scrambleGlyphs[glyphIndex];
        letter.classList.remove("is-final");
      } else {
        letter.textContent = letter.dataset.finalChar || "";
        letter.classList.add("is-final");
      }
    });

    if (!allComplete) {
      requestAnimationFrame(tick);
    } else {
      letters.forEach((letter) => {
        letter.textContent = letter.dataset.finalChar || "";
        letter.classList.add("is-final");
        letter.style.setProperty("--letter-y", "0px");
        letter.style.setProperty("--letter-x", "0px");
        letter.style.setProperty("--letter-opacity", "1");
        letter.style.setProperty("--letter-blur", "0");
        letter.style.setProperty("--letter-scale", "1");
      });
    }
  };

  requestAnimationFrame(tick);
};

const matrixRevealSections = [];

const initializeMatrixRevealText = (section) => {
  const textTargets = section.querySelectorAll(".eyebrow, .data-rain-message, .section-copy");
  const scrambleGlyphs = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%<>[]{}()/\\|+=*&^~!?;:BTCETHSOLUSDVANDER";
  const colors = ["#38c8ff", "#b14dff", "#7c5cff", "#e8e2ff"];
  const rainLayer = section.querySelector(".data-rain-tunnel");

  if (rainLayer && !rainLayer.hasChildNodes()) {
    if (compactMotion.matches) {
      section.classList.add("matrix-lite");
    }

    const layers = compactMotion.matches
      ? []
      : [
        { className: "depth-far", count: 8, alpha: 0.14, speed: 27, depth: -120, blur: 0, fontSize: 0.66, scale: 0.86 },
        { className: "depth-mid", count: 8, alpha: 0.23, speed: 20, depth: -20, blur: 0, fontSize: 0.82, scale: 1 },
        { className: "depth-near", count: 4, alpha: 0.28, speed: 15, depth: 50, blur: 0, fontSize: 0.94, scale: 1.04 },
      ];
    const fragment = document.createDocumentFragment();

    layers.forEach((layer, layerIndex) => {
      for (let columnIndex = 0; columnIndex < layer.count; columnIndex += 1) {
        const column = document.createElement("span");
        const glyphCount = 22 + ((columnIndex + layerIndex) % 5) * 4;
        let stream = "";

        for (let glyphIndex = 0; glyphIndex < glyphCount; glyphIndex += 1) {
          const glyph = scrambleGlyphs[(layerIndex * 31 + columnIndex * 11 + glyphIndex * 5) % scrambleGlyphs.length];
          stream += `${glyph}\n`;
        }

        stream = `${stream}${stream}`;

        const left = ((columnIndex + 0.5) / layer.count) * 100 + (layerIndex - 1) * 0.8;
        column.className = `matrix-bg-column ${layer.className}`;
        column.textContent = stream;
        column.style.setProperty("--column-left", `${Math.min(99, Math.max(1, left))}%`);
        column.style.setProperty("--column-speed", `${layer.speed + (columnIndex % 7) * 1.45}s`);
        column.style.setProperty("--column-delay", `${-(columnIndex % 13) * 1.18}s`);
        column.style.setProperty("--column-alpha", String(layer.alpha + (columnIndex % 5) * 0.018));
        column.style.setProperty("--column-scale", String(layer.scale + (columnIndex % 4) * 0.045));
        column.style.setProperty("--column-depth", `${layer.depth + (columnIndex % 5) * 28}px`);
        column.style.setProperty("--column-blur", `${layer.blur}px`);
        column.style.setProperty("--column-font-size", `${layer.fontSize + (columnIndex % 4) * 0.035}rem`);
        column.style.setProperty("--column-z", String(layerIndex + 1));
        fragment.appendChild(column);
      }
    });

    rainLayer.appendChild(fragment);
  }

  const targets = Array.from(textTargets).map((element, elementIndex) => {
    const finalText = element.dataset.finalText || element.textContent.trim();

    if (reduceMotion.matches) {
      element.textContent = finalText;
      return { element, letters: [], elementIndex };
    }

    element.classList.add("matrix-rain-text");
    element.textContent = finalText;

    return { element, elementIndex, finalText };
  });

  matrixRevealSections.push({ section, targets, scrambleGlyphs, colors, started: false });
};

const easeOut = (value) => 1 - Math.pow(1 - value, 3);

const playMatrixReveal = (state) => {
  if (state.started || reduceMotion.matches) {
    return;
  }

  state.started = true;
  state.section.classList.add("is-decrypting");

  state.targets.forEach(({ element, finalText, elementIndex }) => {
    element.textContent = finalText;
    window.setTimeout(() => {
      element.classList.add("is-final-text");
    }, elementIndex * 120);
  });

  const lastTargetDelay = Math.max(0, (state.targets.length - 1) * 120);
  window.setTimeout(() => {
    state.section.classList.remove("is-decrypting");
    state.section.classList.add("is-decrypted");
  }, lastTargetDelay + 720);
};

dataRainSections.forEach(initializeMatrixRevealText);

if (matrixRevealSections.length > 0 && !reduceMotion.matches) {
  const matrixRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const state = matrixRevealSections.find((item) => item.section === entry.target);
          if (state) {
            playMatrixReveal(state);
          }
          matrixRevealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "-18% 0px -18% 0px", threshold: 0.2 }
  );

  matrixRevealSections.forEach(({ section }) => matrixRevealObserver.observe(section));
}
