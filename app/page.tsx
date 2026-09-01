"use client";

import { CSSProperties, PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import projectData from "./data/projects.json";
import categoryData from "./data/categories.json";

const WORLD_WIDTH = 3600;
const HORIZON = 1060;
const SKY_BAND = 1400;
const OCEAN_BAND = 1900;
const START = { x: 1800, y: 760 };
const horizontalTiles = [-1, 0, 1];

type Language = "en" | "ru";
type Point = { x: number; y: number };
type Localized = { en: string; ru: string };
type ProjectImage = { src: string; width: number; height: number; animated: boolean };
type Project = {
  id: string;
  title: Localized;
  description: Localized;
  categories: string[];
  sourceUrl: string | null;
  liveUrl?: string | null;
  cover: string;
  images: ProjectImage[];
  selected: boolean;
  number: number;
  x: number;
  y: number;
  color: string;
  selectedFrames?: number[];
};
type ArtItem = {
  src: string;
  x: number;
  y: number;
  width: number;
  motion: "cloud" | "wave" | "island" | "crab" | "dolphin" | "fish" | "still";
  plate?: string;
};

const projects = projectData as Project[];
const categories = categoryData as Array<{ id: string; en: string; ru: string }>;
const selectedOrder = ["dvizhenie-ulits", "rassol", "onda-ice-cream-packaging", "guide-find-a-groom"];

const skyArt: ArtItem[] = [
  { src: "/art/cloud-large-a.svg", x: 80, y: 360, width: 330, motion: "cloud", plate: "#6c5bc7" },
  { src: "/art/cloud-micro-a.svg", x: 330, y: 210, width: 86, motion: "cloud" },
  { src: "/art/cloud-mini.svg", x: 500, y: 570, width: 125, motion: "cloud" },
  { src: "/art/cloud-lamp.svg", x: 790, y: 300, width: 155, motion: "cloud", plate: "#fe572a" },
  { src: "/art/cloud-micro-b.svg", x: 1010, y: 565, width: 82, motion: "cloud" },
  // The two home-screen clouds follow the supplied composition.
  { src: "/art/cloud-micro-a.svg", x: 1390, y: 490, width: 108, motion: "cloud" },
  { src: "/art/cloud-mini.svg", x: 1640, y: 260, width: 76, motion: "cloud" },
  { src: "/art/cloud-large-b.svg", x: 2160, y: 420, width: 345, motion: "cloud" },
  { src: "/art/cloud-micro-a.svg", x: 2520, y: 260, width: 74, motion: "cloud" },
  { src: "/art/cloud-micro-b.svg", x: 2670, y: 620, width: 116, motion: "cloud" },
  { src: "/art/cloud-flags.svg", x: 2890, y: 340, width: 215, motion: "cloud", plate: "#daff02" },
  { src: "/art/cloud-small.svg", x: 3200, y: 590, width: 190, motion: "cloud" },
  { src: "/art/cloud-mini.svg", x: 3330, y: 175, width: 88, motion: "cloud" },
  { src: "/art/cloud-ladder.svg", x: 3450, y: 290, width: 120, motion: "cloud", plate: "#6c5bc7" },
  { src: "/art/cloud-micro-a.svg", x: 180, y: 690, width: 68, motion: "cloud" },
  { src: "/art/cloud-micro-b.svg", x: 630, y: 135, width: 58, motion: "cloud" },
  { src: "/art/cloud-mini.svg", x: 1190, y: 255, width: 92, motion: "cloud" },
  { src: "/art/cloud-micro-a.svg", x: 1880, y: 165, width: 63, motion: "cloud" },
  { src: "/art/cloud-mini.svg", x: 2340, y: 730, width: 104, motion: "cloud" },
  { src: "/art/cloud-micro-b.svg", x: 3070, y: 180, width: 54, motion: "cloud" },
];

const surfaceArt: ArtItem[] = [
  { src: "/art/island-house.svg", x: 80, y: 900, width: 350, motion: "island", plate: "#fe572a" },
  { src: "/art/water-2.svg", x: 430, y: 1092, width: 92, motion: "wave" },
  { src: "/art/island-easel.svg", x: 560, y: 975, width: 235, motion: "island" },
  { src: "/art/water-3.svg", x: 825, y: 1104, width: 70, motion: "wave" },
  // Home screen: the large left island and small right island interrupt the horizon.
  { src: "/art/island-flag.svg", x: 1010, y: 914, width: 455, motion: "island" },
  { src: "/art/water-2.svg", x: 1510, y: 1098, width: 82, motion: "wave" },
  { src: "/art/water-1.svg", x: 1780, y: 1108, width: 145, motion: "wave" },
  { src: "/art/water-3.svg", x: 2100, y: 1092, width: 76, motion: "wave" },
  { src: "/art/island-small.svg", x: 2400, y: 1060, width: 185, motion: "island" },
  { src: "/art/water-1.svg", x: 2600, y: 1102, width: 96, motion: "wave" },
  { src: "/art/island-rock.svg", x: 2750, y: 920, width: 340, motion: "island", plate: "#6c5bc7" },
  { src: "/art/dolphin.svg", x: 3160, y: 970, width: 175, motion: "dolphin" },
  { src: "/art/island-medium.svg", x: 3400, y: 1010, width: 245, motion: "island", plate: "#daff02" },
  { src: "/art/water-3.svg", x: 330, y: 1112, width: 56, motion: "wave" },
  { src: "/art/water-2.svg", x: 2240, y: 1110, width: 64, motion: "wave" },
  { src: "/art/water-1.svg", x: 3260, y: 1096, width: 74, motion: "wave" },
];

const oceanArt: ArtItem[] = [
  { src: "/art/water-3.svg", x: 120, y: 160, width: 190, motion: "wave" },
  { src: "/art/water-1.svg", x: 320, y: 820, width: 82, motion: "wave" },
  { src: "/art/island-with-me.svg", x: 390, y: 380, width: 290, motion: "island", plate: "#6c5bc7" },
  { src: "/art/water-2.svg", x: 650, y: 1260, width: 105, motion: "wave" },
  { src: "/art/fish.svg", x: 790, y: 690, width: 145, motion: "fish" },
  { src: "/art/island-small.svg", x: 900, y: 180, width: 145, motion: "island" },
  { src: "/art/crab-hi.svg", x: 1110, y: 980, width: 115, motion: "crab", plate: "#fe572a" },
  { src: "/art/water-3.svg", x: 1220, y: 520, width: 88, motion: "wave" },
  { src: "/art/island-small.svg", x: 1370, y: 1220, width: 265, motion: "island", plate: "#daff02" },
  { src: "/art/fish-school.svg", x: 1600, y: 890, width: 92, motion: "fish" },
  { src: "/art/wave-4.svg", x: 1750, y: 260, width: 260, motion: "wave" },
  { src: "/art/water-2.svg", x: 1930, y: 1400, width: 120, motion: "wave" },
  { src: "/art/island-swings.svg", x: 2000, y: 520, width: 610, motion: "island", plate: "#fe572a" },
  { src: "/art/water-3.svg", x: 2370, y: 230, width: 76, motion: "wave" },
  { src: "/art/fish-school.svg", x: 2540, y: 1060, width: 165, motion: "fish" },
  { src: "/art/island-small.svg", x: 2630, y: 480, width: 135, motion: "island" },
  { src: "/art/island-house.svg", x: 2780, y: 1320, width: 355, motion: "island", plate: "#6c5bc7" },
  { src: "/art/water-2.svg", x: 3060, y: 980, width: 95, motion: "wave" },
  { src: "/art/water-1.svg", x: 3200, y: 420, width: 180, motion: "wave" },
  { src: "/art/dolphin.svg", x: 3410, y: 850, width: 175, motion: "dolphin" },
  { src: "/art/water-1.svg", x: 80, y: 1110, width: 92, motion: "wave" },
  { src: "/art/water-2.svg", x: 510, y: 1040, width: 62, motion: "wave" },
  { src: "/art/wave-1.svg", x: 1030, y: 300, width: 126, motion: "wave" },
  { src: "/art/stones.svg", x: 1320, y: 760, width: 82, motion: "island" },
  { src: "/art/water-3.svg", x: 1500, y: 1500, width: 68, motion: "wave" },
  { src: "/art/island-small.svg", x: 1810, y: 1160, width: 108, motion: "island" },
  { src: "/art/water-1.svg", x: 2220, y: 1220, width: 74, motion: "wave" },
  { src: "/art/wave-2.svg", x: 2460, y: 1410, width: 116, motion: "wave" },
  { src: "/art/island-medium.svg", x: 2920, y: 720, width: 138, motion: "island" },
  { src: "/art/water-3.svg", x: 3280, y: 1520, width: 58, motion: "wave" },
  { src: "/art/fish.svg", x: 3500, y: 250, width: 84, motion: "fish" },
];

function wrap(value: number) { return ((value % WORLD_WIDTH) + WORLD_WIDTH) % WORLD_WIDTH; }
function xDelta(from: number, to: number) {
  let value = to - wrap(from);
  if (value > WORLD_WIDTH / 2) value -= WORLD_WIDTH;
  if (value < -WORLD_WIDTH / 2) value += WORLD_WIDTH;
  return value;
}
function categoryLabel(id: string, language: Language) {
  return categories.find((category) => category.id === id)?.[language] ?? id;
}

function thumbnailFor(src: string) {
  return src.replace(/^\/portfolio\//, "/portfolio-thumbs/").replace(/\.[^.]+$/, ".webp");
}

type GalleryItem = { image: ProjectImage; index: number };
type GalleryRow = { items: GalleryItem[]; panoramic: boolean };

function buildGalleryRows(images: ProjectImage[]) {
  const rows: GalleryRow[] = [];
  let current: GalleryItem[] = [];
  let ratioTotal = 0;
  const flush = () => {
    if (!current.length) return;
    rows.push({ items: current, panoramic: false });
    current = [];
    ratioTotal = 0;
  };

  images.forEach((image, index) => {
    const ratio = image.width / image.height;
    if (ratio >= 1.78) {
      flush();
      rows.push({ items: [{ image, index }], panoramic: true });
      return;
    }
    current.push({ image, index });
    ratioTotal += ratio;
    if (ratioTotal >= 2.55 || current.length === 4) flush();
  });
  flush();

  const last = rows.at(-1);
  const previous = rows.at(-2);
  if (last && previous && !last.panoramic && !previous.panoramic && last.items.length === 1 && previous.items.length < 4) {
    previous.items.push(last.items[0]);
    rows.pop();
  }
  return rows;
}

function ProjectMedia({ image, alt, eager = false }: { image: ProjectImage; alt: string; eager?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(eager);

  useEffect(() => {
    if (!image.animated || videoReady || !videoRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVideoReady(true);
      observer.disconnect();
    }, { rootMargin: "500px 0px" });
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [image.animated, videoReady]);

  if (image.animated && image.src.endsWith(".mp4")) {
    return <video ref={videoRef} src={videoReady ? image.src : undefined} poster={thumbnailFor(image.src)} aria-label={alt} autoPlay loop muted playsInline preload={videoReady ? "metadata" : "none"} />;
  }
  return <img src={image.src} width={image.width} height={image.height} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" />;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [camera, setCamera] = useState<Point>(START);
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState<Project | null>(null);
  const [active, setActive] = useState<Project | null>(null);
  const [panel, setPanel] = useState<"selected" | "index" | "about" | "contact" | null>(null);
  const cameraRef = useRef<Point>(START);
  const targetRef = useRef<Point>(START);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldTrackRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ x: 0, y: 0, cameraX: 0, cameraY: 0 });
  const cursorTarget = useRef({ x: 0, y: 0, angle: -25, visible: false, action: false });
  const cursorCurrent = useRef({ x: 0, y: 0, angle: -25 });

  useEffect(() => {
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    resize();
    window.addEventListener("resize", resize);
    let frame = 0;
    let lastStateSync = 0;
    const animate = (now: number) => {
      const current = cameraRef.current;
      const target = targetRef.current;
      const next = { x: current.x + (target.x - current.x) * 0.075, y: current.y + (target.y - current.y) * 0.075 };
      cameraRef.current = next;

      if (worldTrackRef.current) {
        worldTrackRef.current.style.transform = `translate3d(${window.innerWidth / 2 - wrap(next.x)}px, ${window.innerHeight / 2 - next.y}px, 0)`;
      }
      const distanceHome = Math.hypot(xDelta(next.x, START.x), START.y - next.y);
      const progress = distanceHome < 55 ? 1 : Math.max(0, Math.min(1, 1 - distanceHome / 510));
      stageRef.current?.style.setProperty("--intro", String(progress));
      if (now - lastStateSync > 100) {
        setCamera(next);
        lastStateSync = now;
      }

      const cursor = cursorCurrent.current;
      const cursorTo = cursorTarget.current;
      cursor.x += (cursorTo.x - cursor.x) * 0.2;
      cursor.y += (cursorTo.y - cursor.y) * 0.2;
      const angleDistance = ((cursorTo.angle - cursor.angle + 540) % 360) - 180;
      cursor.angle += angleDistance * 0.16;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = cursorTo.visible ? "1" : "0";
        cursorRef.current.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0) rotate(${cursor.angle}deg)`;
        cursorRef.current.classList.toggle("is-action", cursorTo.action);
      }
      frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    let previous = { x: 0, y: 0 };
    let interactionFrame = 0;
    let lastInteraction = 0;
    const resetWorldReaction = () => {
      document.querySelectorAll<HTMLElement>(".art-cluster[data-motion], .ocean-current[data-motion]").forEach((element) => {
        element.style.setProperty("--repel-x", "0px");
        element.style.setProperty("--repel-y", "0px");
        element.classList.remove("is-near");
      });
    };
    const reactWorld = (pointerX: number, pointerY: number, now: number) => {
      if (now - lastInteraction < 32) return;
      lastInteraction = now;
      const elements = document.querySelectorAll<HTMLElement>(".art-cluster[data-motion], .ocean-current[data-motion]");
      elements.forEach((element) => {
        const motion = element.dataset.motion;
        if (!motion || motion === "island" || motion === "still") return;
        const rect = element.getBoundingClientRect();
        if (rect.right < -280 || rect.left > window.innerWidth + 280 || rect.bottom < -280 || rect.top > window.innerHeight + 280) return;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = centerX - pointerX;
        const dy = centerY - pointerY;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const animal = motion === "crab" || motion === "dolphin" || motion === "fish";
        const radius = motion === "cloud" ? 250 : motion === "wave" ? 185 : 145;
        const strength = Math.max(0, 1 - distance / radius);
        const push = motion === "cloud" ? 72 : motion === "wave" ? 48 : 24;
        element.style.setProperty("--repel-x", `${dx / distance * strength * push}px`);
        element.style.setProperty("--repel-y", `${dy / distance * strength * push}px`);
        element.classList.toggle("is-near", animal && strength > .08);
      });
    };
    const move = (event: globalThis.PointerEvent) => {
      if (event.pointerType === "touch") return;
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      if (Math.hypot(dx, dy) > 3) cursorTarget.current.angle = Math.atan2(dy, dx) * 180 / Math.PI + 42;
      previous = { x: event.clientX, y: event.clientY };
      cursorTarget.current.x = event.clientX;
      cursorTarget.current.y = event.clientY;
      cursorTarget.current.visible = true;
      cursorTarget.current.action = event.target instanceof Element && Boolean(event.target.closest("button, a"));
      window.cancelAnimationFrame(interactionFrame);
      interactionFrame = window.requestAnimationFrame((now) => reactWorld(event.clientX, event.clientY, now));
      if (previewRef.current) {
        const previewWidth = previewRef.current.offsetWidth || 420;
        const previewHeight = previewRef.current.offsetHeight || 390;
        const x = Math.min(event.clientX + 34, window.innerWidth - previewWidth - 16);
        const y = Math.min(event.clientY + 30, window.innerHeight - previewHeight - 16);
        previewRef.current.style.transform = `translate3d(${Math.max(14, x)}px, ${Math.max(14, y)}px, 0)`;
      }
    };
    const hide = () => { cursorTarget.current.visible = false; resetWorldReaction(); };
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("mouseleave", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", hide);
      window.cancelAnimationFrame(interactionFrame);
      resetWorldReaction();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (document.querySelector(".project-lightbox")) return;
      if (event.key === "Escape") { setActive(null); setPanel(null); return; }
      if (active || panel) return;
      const amount = event.shiftKey ? 250 : 86;
      if (event.key === "ArrowLeft") targetRef.current.x -= amount;
      if (event.key === "ArrowRight") targetRef.current.x += amount;
      if (event.key === "ArrowUp") targetRef.current.y -= amount;
      if (event.key === "ArrowDown") targetRef.current.y += amount;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, panel]);

  const normalizedX = wrap(camera.x);
  const baseOceanRow = Math.max(0, Math.floor((camera.y - HORIZON) / OCEAN_BAND));
  const oceanRows = Array.from({ length: 3 }, (_, index) => Math.max(0, baseOceanRow - 1 + index)).filter((row, index, all) => all.indexOf(row) === index);
  const baseSkyRow = Math.max(0, Math.floor((HORIZON - camera.y) / SKY_BAND));
  const skyRows = Array.from({ length: 3 }, (_, index) => Math.max(0, baseSkyRow - 1 + index)).filter((row, index, all) => all.indexOf(row) === index);

  const nearest = useMemo(() => projects.map((project) => {
    const dx = xDelta(camera.x, project.x);
    const dy = project.y - camera.y;
    return { project, dx, dy, distance: Math.hypot(dx, dy) };
  }).sort((a, b) => a.distance - b.distance)[0] ?? null, [camera]);

  const moveTo = (project: Project) => {
    targetRef.current = { x: cameraRef.current.x + xDelta(cameraRef.current.x, project.x), y: project.y };
    setPanel(null);
  };
  const returnHome = () => {
    targetRef.current = { x: cameraRef.current.x + xDelta(cameraRef.current.x, START.x), y: START.y };
    setPanel(null);
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || active || panel) return;
    if (event.target instanceof Element && event.target.closest("button")) return;
    stageRef.current?.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, cameraX: targetRef.current.x, cameraY: targetRef.current.y };
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    targetRef.current = {
      x: dragRef.current.cameraX - (event.clientX - dragRef.current.x),
      y: dragRef.current.cameraY - (event.clientY - dragRef.current.y),
    };
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    stageRef.current?.releasePointerCapture(event.pointerId);
    setDragging(false);
  };
  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (active || panel) return;
    targetRef.current = {
      x: targetRef.current.x + event.deltaX + (Math.abs(event.deltaX) < 2 ? event.deltaY * 0.54 : 0),
      y: targetRef.current.y + (Math.abs(event.deltaX) < 2 ? event.deltaY * 0.46 : event.deltaY),
    };
  };
  const arrowAngle = nearest ? Math.atan2(nearest.dy, nearest.dx) * 180 / Math.PI + 42 : 0;

  return (
    <main className={`site-shell lang-${language}`}>
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true"><img src="/art/arrow.svg" alt="" /></div>
      <div ref={previewRef} className={`hover-preview ${hovered ? "is-visible" : ""}`} aria-hidden="true">
        {hovered && <Cover project={hovered} language={language} />}
      </div>

      <header className="top-bar">
        <button className="wordmark" onClick={returnHome}><span>{language === "en" ? "Angelina" : "Ангелина"}</span><small>{language === "en" ? "somewhere around here" : "я где-то здесь"}</small></button>
        <nav aria-label="Portfolio navigation">
          <button onClick={() => setPanel("selected")}>{language === "en" ? "selected" : "избранное"} <sup>{projects.filter((project) => project.selected).length}</sup></button>
          <button onClick={() => setPanel("index")}>{language === "en" ? "index" : "индекс"} <sup>{projects.length}</sup></button>
          <button onClick={() => setPanel("about")}>{language === "en" ? "about" : "обо мне"}</button>
          <button className="contact-link" onClick={() => setPanel("contact")}>{language === "en" ? "contact" : "контакт"}</button>
          <span className="language-switch" aria-label="Language">
            <button className={language === "ru" ? "is-active" : ""} onClick={() => setLanguage("ru")} aria-label="Русский">RU</button>
            <button className={language === "en" ? "is-active" : ""} onClick={() => setLanguage("en")} aria-label="English">EN</button>
          </span>
        </nav>
      </header>

      <div ref={stageRef} className={`world-stage ${dragging ? "is-dragging" : ""}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onWheel={onWheel} role="application" aria-label="Endless portfolio ocean. Drag, scroll, or use arrow keys to explore.">
        <div ref={worldTrackRef} className="world-track" style={{ transform: `translate3d(${viewport.width / 2 - normalizedX}px, ${viewport.height / 2 - camera.y}px, 0)` }}>
          {horizontalTiles.map((tile) => (
            <WorldTile
              key={tile}
              left={tile * WORLD_WIDTH}
              skyRows={skyRows}
              oceanRows={oceanRows}
              language={language}
              onHover={setHovered}
              onOpen={setActive}
            />
          ))}
        </div>
      </div>

      {nearest && <button className="compass" onClick={() => moveTo(nearest.project)} aria-label={`Move to ${nearest.project.title[language]}`}>
        <span><small>{language === "en" ? "NEAREST PROJECT" : "БЛИЖАЙШИЙ ПРОЕКТ"}</small><strong>{nearest.project.title[language]}</strong></span>
        <img src="/art/arrow.svg" alt="" style={{ transform: `rotate(${arrowAngle}deg)` }} />
      </button>}
      <div className="coordinates" aria-hidden="true">X {Math.round(normalizedX).toString().padStart(4, "0")} · DEPTH {Math.max(0, Math.round(camera.y - HORIZON)).toString().padStart(4, "0")}</div>
      <div className="movement-hint" aria-hidden="true"><span>DRAG · SCROLL · ARROWS</span><i>KEEP MOVING →</i></div>

      {panel && <Panel type={panel} projects={projects} language={language} onClose={() => { setPanel(null); setHovered(null); }} onMove={moveTo} onOpen={(project) => { setPanel(null); setActive(project); }} onHover={setHovered} />}
      {active && <ProjectView project={active} language={language} onClose={() => setActive(null)} />}
    </main>
  );
}

function WorldTile({ left, skyRows, oceanRows, language, onHover, onOpen }: {
  left: number;
  skyRows: number[];
  oceanRows: number[];
  language: Language;
  onHover: (project: Project | null) => void;
  onOpen: (project: Project) => void;
}) {
  return (
    <section className="world-tile" style={{ width: WORLD_WIDTH, transform: `translate3d(${left}px, 0, 0)` }}>
      {skyRows.map((row) => <SkyBand key={row} row={row} />)}
      {oceanRows.map((row) => <OceanBand key={row} row={row} />)}
      <Horizon />
      {surfaceArt.map((item, index) => <Art key={`surface-${index}`} item={item} index={index} />)}

      <article className="intro">
        <p>{language === "en" ? "Hello, I’m" : "Привет, я"}</p>
        <h1><span>{language === "en" ? "Angelina." : "Ангелина."}</span></h1>
        <p className="intro-line"><span>{language === "en" ? "And I’m somewhere here." : "И я где-то здесь."}</span></p>
        <strong>{language === "en" ? "Designer & art director · keep moving →" : "Дизайнер и арт-директор · Продолжай двигаться →"}</strong>
      </article>

      {projects.map((project) => (
        <button key={project.id} className="project-marker" style={{ left: project.x, top: project.y, "--marker": project.color } as CSSProperties} onPointerEnter={() => onHover(project)} onPointerLeave={() => onHover(null)} onFocus={() => onHover(project)} onBlur={() => onHover(null)} onClick={() => onOpen(project)} aria-label={`Open ${project.title[language]}`}>
          <i /><b /><span>{String(project.number).padStart(2, "0")}</span>
        </button>
      ))}
    </section>
  );
}

function Horizon() {
  const segments = [
    { left: 0, width: 70 }, { left: 430, width: 120 }, { left: 800, width: 200 },
    { left: 1465, width: 930 }, { left: 2585, width: 160 }, { left: 3090, width: 300 },
  ];
  return <div className="horizon" aria-hidden="true">{segments.map((segment, index) => <img key={index} src="/art/horizon.svg" alt="" style={segment} />)}</div>;
}

function SkyBand({ row }: { row: number }) {
  const top = HORIZON - (row + 1) * SKY_BAND;
  const baseTop = HORIZON - SKY_BAND;
  const verticalShift = (row % 3) * 170;
  return (
    <div className="sky-band" style={{ top, height: SKY_BAND + 2 }}>
      {skyArt.map((item, index) => {
        const localY = ((item.y - baseTop + verticalShift) % SKY_BAND + SKY_BAND) % SKY_BAND;
        return <Art key={`${row}-${index}`} item={{ ...item, y: localY }} index={index} />;
      })}
    </div>
  );
}

function OceanBand({ row }: { row: number }) {
  const shift = (row % 3) * 260;
  return (
    <div className="ocean-band" style={{ top: HORIZON + row * OCEAN_BAND, height: OCEAN_BAND + 2 }}>
      {oceanArt.map((item, index) => <Art key={`${row}-${index}`} item={{ ...item, x: wrap(item.x + shift) }} index={index + row * 5} />)}
      {[0, 1, 2].map((current) => <span key={current} className="ocean-current" data-motion="wave" style={{ left: `${12 + ((row * 23 + current * 31) % 72)}%`, top: `${18 + ((row * 17 + current * 29) % 65)}%`, width: `${78 + ((row + current * 2) % 5) * 24}px`, "--current-speed": `${4.2 + ((row + current) % 5) * 1.15}s`, "--current-distance": `${22 + ((row * 3 + current) % 5) * 10}px` } as CSSProperties} aria-hidden="true"><img src={`/art/water-${(row + current) % 3 + 1}.svg`} alt="" /></span>)}
    </div>
  );
}

function Art({ item, index }: { item: ArtItem; index: number }) {
  const speed = item.motion === "cloud" ? `${118 + (index % 6) * 14}s` : `${4.2 + (index % 6) * 1.05}s`;
  const drift = item.motion === "cloud" ? `${WORLD_WIDTH}px` : `${18 + (index % 5) * 9}px`;
  return (
    <span className={`art-cluster motion-${item.motion}`} data-motion={item.motion} style={{ left: item.x, top: item.y, width: item.width, "--delay": `${-(index % 7) * .9}s`, "--speed": speed, "--drift": drift, "--lift": `${3 + (index % 4) * 3}px`, "--plate": item.plate ?? "transparent" } as CSSProperties} aria-hidden="true">
      {item.plate && <span className={`pixel-plate plate-${index % 3}`}><i /><i /></span>}
      <img src={item.src} alt="" draggable={false} />
    </span>
  );
}

function Cover({ project, language }: { project: Project; language: Language }) {
  return (
    <figure className="cover">
      <img src={thumbnailFor(project.cover)} alt="" decoding="async" />
      <figcaption><span>{project.categories.slice(0, 2).map((id) => categoryLabel(id, language)).join(" · ")}</span><strong>{project.title[language]}</strong></figcaption>
    </figure>
  );
}

function Panel({ type, projects, language, onClose, onMove, onOpen, onHover }: {
  type: "selected" | "index" | "about" | "contact";
  projects: Project[];
  language: Language;
  onClose: () => void;
  onMove: (project: Project) => void;
  onOpen: (project: Project) => void;
  onHover: (project: Project | null) => void;
}) {
  const [filter, setFilter] = useState("all");
  const list = type === "selected"
    ? projects.filter((project) => project.selected).sort((a, b) => selectedOrder.indexOf(a.id) - selectedOrder.indexOf(b.id))
    : projects.filter((project) => filter === "all" || project.categories.includes(filter));
  return (
    <aside className="panel" role="dialog" aria-modal="true">
      <button className="panel-close" onClick={onClose}>{language === "en" ? "close ×" : "закрыть ×"}</button>
      {type === "selected" ? (
        <SelectedShowcase projects={list} language={language} onOpen={onOpen} />
      ) : type === "about" ? (
        <div className="text-panel"><p>ABOUT / SOMEWHERE AROUND HERE</p><h2>{language === "en" ? "I build visual worlds while moving through this one." : "Я создаю визуальные миры, двигаясь через этот."}</h2><div className="about-grid"><span>ANGELINA BOLGOVA<br />DESIGNER · ART DIRECTOR</span><p>{language === "en" ? "Independent designer and art director working across identity, digital experiences, books, objects and visual culture." : "Независимый дизайнер и арт-директор. Работаю с айдентикой, цифровыми проектами, книгами, предметами и визуальной культурой."}</p></div></div>
      ) : type === "contact" ? (
        <div className="text-panel contact-panel"><p>CONTACT / THE NEXT PLACE</p><h2>{language === "en" ? <>Where should<br />we go next?</> : <>Куда двинемся<br />дальше?</>}</h2><div className="contact-list"><a href="mailto:bolgova.gelya@mail.ru"><span>EMAIL</span><strong>bolgova.gelya@mail.ru</strong></a><a href="https://t.me/phangelgelya" target="_blank" rel="noreferrer"><span>TELEGRAM</span><strong>@phangelgelya</strong></a><a href="https://t.me/angelinapsd" target="_blank" rel="noreferrer"><span>TELEGRAM CHANNEL</span><strong>@angelinapsd</strong></a></div></div>
      ) : (
        <>
          <div className="panel-heading"><p>{language === "en" ? "ALL KNOWN TERRITORIES" : "ВСЕ ИЗВЕСТНЫЕ ТЕРРИТОРИИ"}</p><h2>{language === "en" ? "Index" : "Индекс"}</h2></div>
          <div className="filters"><button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>{language === "en" ? "All" : "Все"} <sup>{projects.length}</sup></button>{categories.map((category) => { const count = projects.filter((project) => project.categories.includes(category.id)).length; return count ? <button key={category.id} className={filter === category.id ? "is-active" : ""} onClick={() => setFilter(category.id)}>{category[language]} <sup>{count}</sup></button> : null; })}</div>
          <div className="project-list">{list.length ? list.map((project) => <button key={project.id} onClick={() => onMove(project)} onPointerEnter={() => onHover(project)} onPointerLeave={() => onHover(null)} onFocus={() => onHover(project)} onBlur={() => onHover(null)}><span>{String(project.number).padStart(2, "0")}</span><strong>{project.title[language]}</strong><em>{project.categories.slice(0, 2).map((id) => categoryLabel(id, language)).join(" · ")}</em><i>{language === "en" ? "find →" : "найти →"}</i></button>) : <p className="empty-projects">{language === "en" ? "New territories are being prepared." : "Новые территории готовятся к появлению."}</p>}</div>
        </>
      )}
    </aside>
  );
}

function SelectedShowcase({ projects, language, onOpen }: { projects: Project[]; language: Language; onOpen: (project: Project) => void }) {
  const moveLayers = (event: PointerEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - .5;
    const y = (event.clientY - box.top) / box.height - .5;
    event.currentTarget.style.setProperty("--pointer-x", x.toFixed(3));
    event.currentTarget.style.setProperty("--pointer-y", y.toFixed(3));
  };

  return (
    <div className="selected-showcase">
      <header className="selected-heading">
        <p>{language === "en" ? "FOUR CURRENTS / NO RANKING" : "ЧЕТЫРЕ ТЕЧЕНИЯ / БЕЗ РЕЙТИНГА"}</p>
        <h2>{language === "en" ? "Selected" : "Избранное"}</h2>
        <span>{language === "en" ? "Move through four projects. Open one when it catches you." : "Четыре проекта в движении. Открой тот, который зацепит."}</span>
      </header>
      <div className="selected-flow">
        {projects.map((project, index) => {
          const frameIndexes = project.selectedFrames ?? [0, 1, 2];
          const frames = frameIndexes.map((frame) => project.images[frame]).filter(Boolean);
          return (
            <article className="selected-current" key={project.id} style={{ "--accent": project.color } as CSSProperties}>
              <button className="selected-stage" onClick={() => onOpen(project)} onPointerMove={moveLayers} data-cursor-accent>
                <div className="selected-meta">
                  <span>{String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
                  <h3>{project.title[language]}</h3>
                  <p>{project.categories.slice(0, 3).map((id) => categoryLabel(id, language)).join(" · ")}</p>
                  <i>{language === "en" ? "open project ↗" : "открыть проект ↗"}</i>
                </div>
                <div className="selected-images" aria-hidden="true">
                  {frames.map((image, frameIndex) => (
                    <figure className={`selected-frame frame-${frameIndex + 1}`} key={image.src} style={{ aspectRatio: `${image.width} / ${image.height}` }}>
                      <img src={thumbnailFor(image.src)} alt="" loading="lazy" decoding="async" />
                    </figure>
                  ))}
                </div>
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ProjectView({ project, language, onClose }: { project: Project; language: Language; onClose: () => void }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const galleryImages = useMemo(() => project.images.filter((image) => image.src !== project.cover), [project.cover, project.images]);
  const galleryRows = useMemo(() => buildGalleryRows(galleryImages), [galleryImages]);
  const stepLightbox = useCallback((direction: number) => {
    setLightboxIndex((current) => current === null ? null : (current + direction + galleryImages.length) % galleryImages.length);
  }, [galleryImages.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowLeft") stepLightbox(-1);
      if (event.key === "ArrowRight") stepLightbox(1);
      if (["Escape", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [lightboxIndex, stepLightbox]);

  return (
    <section className={`project-view ${lightboxIndex !== null ? "is-lightbox-open" : ""}`} role="dialog" aria-modal="true">
      <button className="project-back" onClick={onClose}>← {language === "en" ? "return to the world" : "вернуться в мир"}</button>
      <header className="project-title"><p>{String(project.number).padStart(2, "0")} / {project.categories.map((id) => categoryLabel(id, language)).join(" · ")}</p><h2>{project.title[language]}</h2><span>{project.description[language]}</span></header>
      <div className="project-gallery">{galleryRows.map((row, rowIndex) => (
        <div className={`gallery-row ${row.panoramic ? "is-panoramic" : ""}`} key={`${rowIndex}-${row.items[0].image.src}`}>
          {row.items.map(({ image, index }) => (
            <figure key={image.src} style={{ aspectRatio: `${image.width} / ${image.height}`, flex: `${image.width / image.height} 1 0` }}>
              <button className="gallery-open" onClick={() => setLightboxIndex(index)} aria-label={`${language === "en" ? "Open image" : "Открыть изображение"} ${index + 1} / ${galleryImages.length}`}>
                <ProjectMedia image={image} alt={`${project.title[language]} — ${index + 1}`} eager={index < 2} />
              </button>
            </figure>
          ))}
        </div>
      ))}</div>
      {(project.liveUrl || project.sourceUrl) && <div className="project-links">
        {project.liveUrl && <a className="source-link" href={project.liveUrl} target="_blank" rel="noreferrer">{language === "en" ? "Open live website ↗" : "Открыть сайт ↗"}</a>}
        {project.sourceUrl && <a className="source-link" href={project.sourceUrl} target="_blank" rel="noreferrer">{language === "en" ? "View original project ↗" : "Посмотреть исходный проект ↗"}</a>}
      </div>}
      {lightboxIndex !== null && <div className="project-lightbox" role="dialog" aria-modal="true" aria-label={language === "en" ? "Project image viewer" : "Просмотр изображений проекта"} onPointerDown={(event) => { if (event.target === event.currentTarget) setLightboxIndex(null); }}>
        <button type="button" className="lightbox-close" onPointerDown={(event) => { event.stopPropagation(); setLightboxIndex(null); }} aria-label={language === "en" ? "Close image viewer" : "Закрыть просмотр"}>{language === "en" ? "close ×" : "закрыть ×"}</button>
        <button className="lightbox-arrow is-previous" onClick={() => stepLightbox(-1)} aria-label={language === "en" ? "Previous image" : "Предыдущее изображение"}>←</button>
        <figure className="lightbox-media">
          <ProjectMedia image={galleryImages[lightboxIndex]} alt={`${project.title[language]} — ${lightboxIndex + 1}`} eager />
        </figure>
        <button className="lightbox-arrow is-next" onClick={() => stepLightbox(1)} aria-label={language === "en" ? "Next image" : "Следующее изображение"}>→</button>
        <span className="lightbox-counter">{String(lightboxIndex + 1).padStart(2, "0")} / {String(galleryImages.length).padStart(2, "0")}</span>
      </div>}
    </section>
  );
}
