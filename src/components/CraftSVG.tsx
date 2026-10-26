import React from "react";

let UID = 0;

export function shade(hex: string, amt: number): string {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  if (isNaN(num)) return hex;
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const VASE_BODY =
  "M200,54 C232,54 247,67 249,86 C252,118 240,142 252,180 C268,228 277,264 268,302 C258,339 232,354 200,354 C168,354 142,339 132,302 C123,264 132,228 148,180 C160,142 148,118 151,86 C153,67 168,54 200,54 Z";

export interface CraftConfig {
  color: string;
  pattern: "none" | "dots" | "stripes" | "waves" | string;
  text?: string;
  textY?: number;
  textSize?: number;
  clip?: string;
}

export function renderProductSVGString(
  type: string,
  cfg: CraftConfig
): string {
  const id = ++UID;
  const c = cfg.color || "#C05F3C";
  const dark = shade(c, -42);
  const ink = shade(c, -80);
  const light = shade(c, 26);
  const pid = "pt" + id;
  const cl = "cl" + id;
  const gr = "gr" + id;

  let pat = "";
  if (cfg.pattern === "dots") {
    pat = `<pattern id="${pid}" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="3.2" fill="${ink}" opacity=".5"/><circle cx="20" cy="20" r="3.2" fill="${ink}" opacity=".5"/></pattern>`;
  } else if (cfg.pattern === "stripes") {
    pat = `<pattern id="${pid}" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect x="0" y="0" width="10" height="24" fill="${ink}" opacity=".45"/></pattern>`;
  } else if (cfg.pattern === "waves") {
    pat = `<pattern id="${pid}" width="44" height="20" patternUnits="userSpaceOnUse"><path d="M0 12 Q11 0 22 12 T44 12" fill="none" stroke="${ink}" stroke-width="4.5" opacity=".45" stroke-linecap="round"/></pattern>`;
  } else if (cfg.pattern === "bandhani") {
    pat = `<pattern id="${pid}" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="4.5" fill="${light}" opacity=".7"/><circle cx="15" cy="15" r="2.2" fill="${dark}"/><circle cx="15" cy="15" r="8" fill="none" stroke="${ink}" stroke-width="1.2" stroke-dasharray="2,2" opacity=".5"/></pattern>`;
  }

  const txt = cfg.text
    ? `<text x="200" y="${cfg.textY || 268}" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="${cfg.textSize || 19}" fill="${ink}" opacity=".85" letter-spacing="1">${esc(cfg.text.slice(0, 18))}</text>`
    : "";

  const defs = `<defs>${pat}<clipPath id="${cl}"><path d="${cfg.clip || VASE_BODY}"/></clipPath><linearGradient id="${gr}" x1="0" y1="0" x2="1" y2="0.2"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>`;

  let body = "";
  if (type === "vase") {
    body = `<ellipse cx="200" cy="357" rx="98" ry="13" fill="#00000012"/>
      <path d="${VASE_BODY}" fill="url(#${gr})"/>
      <g clip-path="url(#${cl})">${cfg.pattern !== "none" ? `<rect x="0" y="0" width="400" height="400" fill="url(#${pid})"/>` : ""}
      <path d="M160,80 C150,140 148,240 158,330 C150,320 140,290 138,240 C134,170 142,110 160,80 Z" fill="#fff" opacity=".16"/></g>
      <ellipse cx="200" cy="58" rx="50" ry="12" fill="${dark}"/><ellipse cx="200" cy="58" rx="38" ry="8" fill="${ink}" opacity=".7"/>
      <g clip-path="url(#${cl})">${txt}</g>`;
  } else if (type === "blanket") {
    body = `<ellipse cx="200" cy="340" rx="130" ry="12" fill="#00000012"/>
      <rect x="72" y="230" width="256" height="98" rx="20" fill="${dark}"/>
      <rect x="86" y="130" width="228" height="118" rx="20" fill="url(#${gr})"/>
      <clipPath id="${cl}b"><rect x="86" y="130" width="228" height="118" rx="20"/></clipPath>
      <g clip-path="url(#${cl}b)">${cfg.pattern !== "none" ? `<rect x="86" y="130" width="228" height="118" fill="url(#${pid})"/>` : `<rect x="86" y="160" width="228" height="16" fill="${ink}" opacity=".35"/><rect x="86" y="196" width="228" height="10" fill="${ink}" opacity=".25"/>`}
      <rect x="86" y="130" width="228" height="26" fill="#fff" opacity=".14"/></g>
      <path d="M92 248 q108 26 216 0" fill="none" stroke="${ink}" stroke-width="3" opacity=".4"/>
      <g stroke="${light}" stroke-width="4" stroke-linecap="round" opacity=".8">${Array.from({ length: 9 }, (_, i) => `<line x1="${92 + i * 27}" y1="328" x2="${92 + i * 27}" y2="344"/>`).join("")}</g>
      ${cfg.text ? `<rect x="164" y="176" width="72" height="44" rx="8" fill="#F6EEDF" opacity=".92"/><text x="200" y="205" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="20" fill="${ink}">${esc(cfg.text.slice(0, 4))}</text>` : ""}`;
  } else if (type === "earrings") {
    const hook = (x: number) =>
      `<path d="M${x},84 c16,2 22,14 18,28 c-3,11 -12,17 -18,22" fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round"/><circle cx="${x}" cy="82" r="7" fill="none" stroke="${dark}" stroke-width="5"/>`;
    const disc = (x: number) => `<circle cx="${x}" cy="212" r="62" fill="url(#${gr})"/>
      <circle cx="${x}" cy="212" r="62" fill="none" stroke="${dark}" stroke-width="3"/>
      <circle cx="${x - 18}" cy="192" r="7" fill="#fff" opacity=".3"/><circle cx="${x + 16}" cy="228" r="5" fill="${dark}" opacity=".25"/><circle cx="${x + 8}" cy="184" r="4" fill="${dark}" opacity=".2"/><circle cx="${x - 20}" cy="234" r="6" fill="${dark}" opacity=".2"/>
      ${cfg.pattern === "dots" ? `<circle cx="${x}" cy="212" r="40" fill="url(#${pid})"/>` : ""}${cfg.pattern === "waves" ? `<path d="M${x - 44},212 q11,-14 22,0 t22,0 t22,0" fill="none" stroke="${ink}" stroke-width="6" opacity=".5" stroke-linecap="round"/>` : ""}
      <line x1="${x}" y1="134" x2="${x}" y2="150" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>`;
    body = `<ellipse cx="200" cy="330" rx="120" ry="12" fill="#00000010"/>
      ${hook(132)}${hook(268)}${disc(132)}${disc(268)}
      <defs>${pat}<linearGradient id="${gr}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>`;
  } else if (type === "bowl") {
    const BOWL = "M82,186 C88,268 138,316 200,316 C262,316 312,268 318,186 Z";
    body = `<ellipse cx="200" cy="330" rx="110" ry="12" fill="#00000012"/>
      <clipPath id="${cl}b"><path d="${BOWL}"/></clipPath>
      <path d="${BOWL}" fill="url(#${gr})"/>
      <g clip-path="url(#${cl}b)">
        ${cfg.pattern !== "none" ? `<rect x="60" y="170" width="280" height="160" fill="url(#${pid})"/>` : ""}
        <path d="M96,214 Q200,258 304,214" fill="none" stroke="${ink}" stroke-width="3" opacity=".35"/>
        <path d="M104,246 Q200,286 296,246" fill="none" stroke="${ink}" stroke-width="3" opacity=".28"/>
        <path d="M120,278 Q200,308 280,278" fill="none" stroke="${ink}" stroke-width="3" opacity=".2"/>
        <path d="M110,190 C114,250 150,300 190,310 C150,304 116,262 110,190 Z" fill="#fff" opacity=".12"/>
        ${txt.replace(/y="\d+"/, 'y="252"')}
      </g>
      <ellipse cx="200" cy="186" rx="118" ry="30" fill="${light}"/>
      <ellipse cx="200" cy="188" rx="100" ry="22" fill="${dark}"/>
      <ellipse cx="200" cy="192" rx="86" ry="16" fill="${ink}" opacity=".55"/>`;
  } else if (type === "bag") {
    body = `<ellipse cx="200" cy="336" rx="115" ry="12" fill="#00000012"/>
      <path d="M148,152 C148,74 252,74 252,152" fill="none" stroke="${dark}" stroke-width="13" stroke-linecap="round"/>
      <rect x="92" y="148" width="216" height="172" rx="22" fill="url(#${gr})"/>
      <clipPath id="${cl}b"><rect x="92" y="148" width="216" height="172" rx="22"/></clipPath>
      <g clip-path="url(#${cl}b)">${cfg.pattern !== "none" ? `<rect x="92" y="148" width="216" height="172" fill="url(#${pid})"/>` : ""}<rect x="92" y="148" width="34" height="172" fill="#fff" opacity=".12"/></g>
      <rect x="98" y="154" width="204" height="160" rx="18" fill="none" stroke="${ink}" stroke-width="2" stroke-dasharray="7 6" opacity=".5"/>
      <path d="M92,170 q0,-22 22,-22 h172 q22,0 22,22 v44 q-108,42 -216,0 z" fill="${dark}"/>
      <rect x="186" y="212" width="28" height="22" rx="5" fill="none" stroke="#C9A227" stroke-width="4"/><line x1="200" y1="214" x2="200" y2="228" stroke="#C9A227" stroke-width="3"/>
      ${cfg.text ? `<text x="200" y="284" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="20" fill="${ink}" opacity=".8" letter-spacing="2">${esc(cfg.text.slice(0, 10))}</text>` : ""}`;
  } else if (type === "candle") {
    const flame = (x: number, y: number, s: number) =>
      `<ellipse cx="${x}" cy="${y - 6 * s}" rx="${10 * s}" ry="${10 * s}" fill="#D9A441" opacity=".22"/><path d="M${x},${y - 26 * s} q${9 * s},${12 * s} 0,${22 * s} q${-9 * s},${-10 * s} 0,${-22 * s}z" fill="#E8A33D"/><path d="M${x},${y - 18 * s} q${4.5 * s},${8 * s} 0,${14 * s} q${-4.5 * s},${-6 * s} 0,${-14 * s}z" fill="#F5D26B"/>`;
    body = `<ellipse cx="200" cy="342" rx="120" ry="12" fill="#00000012"/>
      <rect x="112" y="150" width="62" height="180" rx="10" fill="#F1E4C8"/><rect x="112" y="150" width="16" height="180" rx="8" fill="#fff" opacity=".4"/>
      <line x1="143" y1="150" x2="143" y2="138" stroke="#4A3B2A" stroke-width="3.5" stroke-linecap="round"/>${flame(143, 136, 1)}
      <rect x="188" y="188" width="54" height="142" rx="9" fill="#EAD9B4"/><rect x="188" y="188" width="14" height="142" rx="7" fill="#fff" opacity=".35"/>
      <line x1="215" y1="188" x2="215" y2="177" stroke="#4A3B2A" stroke-width="3.5" stroke-linecap="round"/>${flame(215, 175, 0.9)}
      <path d="M256,244 h84 l-9,86 q-1,10 -11,10 h-44 q-10,0 -11,-10 z" fill="url(#${gr})"/>
      <clipPath id="${cl}b"><path d="M256,244 h84 l-9,86 q-1,10 -11,10 h-44 q-10,0 -11,-10 z"/></clipPath>
      <g clip-path="url(#${cl}b)">${cfg.pattern !== "none" ? `<rect x="250" y="240" width="96" height="106" fill="url(#${pid})"/>` : ""}<rect x="256" y="244" width="14" height="100" fill="#fff" opacity=".16"/></g>
      <ellipse cx="298" cy="244" rx="42" ry="10" fill="${dark}"/>
      <rect x="288" y="200" width="20" height="46" rx="6" fill="${shade(c, 40)}"/><line x1="298" y1="200" x2="298" y2="190" stroke="#4A3B2A" stroke-width="3" stroke-linecap="round"/>${flame(298, 188, 0.7)}
      <g transform="translate(86,268) rotate(-16)"><path d="M0,60 C6,40 8,20 6,0" stroke="#7C8A6E" stroke-width="3" fill="none"/>${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="${6 + (i % 2 ? 8 : -8)}" cy="${8 + i * 11}" rx="7" ry="4" fill="#8E9C7E" transform="rotate(${i % 2 ? 28 : -28} ${6 + (i % 2 ? 8 : -8)} ${8 + i * 11})"/>`).join("")}</g>
      ${cfg.text ? `<text x="298" y="300" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="14" fill="${ink}" opacity=".85">${esc(cfg.text.slice(0, 10))}</text>` : ""}`;
  } else {
    // fallback generic vase
    body = `<ellipse cx="200" cy="357" rx="98" ry="13" fill="#00000012"/><path d="${VASE_BODY}" fill="url(#${gr})"/>`;
  }

  return `<svg class="psvg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-height:100%;display:block">${defs}${body}</svg>`;
}

export function ProductSVG({
  type,
  cfg,
  className = "",
  style,
}: {
  type: string;
  cfg: CraftConfig;
  className?: string;
  style?: React.CSSProperties;
}) {
  const svgHtml = renderProductSVGString(type, cfg);
  return (
    <div
      className={`craft-svg-wrap ${className}`}
      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", ...style }}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}

export interface ArtisanAvatar {
  bg: string;
  skin: string;
  hair: string;
  shirt: string;
  style: "bun" | "long" | "short";
}

export function renderAvatarSVGString(av: ArtisanAvatar): string {
  const hair =
    av.style === "bun"
      ? `<circle cx="70" cy="30" r="14" fill="${av.hair}"/><path d="M42,62 q0,-34 28,-34 q28,0 28,34 q-8,-14 -28,-14 q-20,0 -28,14z" fill="${av.hair}"/>`
      : av.style === "long"
      ? `<path d="M38,88 q-6,-58 32,-58 q38,0 32,58 q-2,-26 -10,-30 q-6,10 -22,10 q-16,0 -22,-10 q-8,4 -10,30z" fill="${av.hair}"/>`
      : `<path d="M42,66 q-2,-38 28,-38 q30,0 28,38 q-6,-16 -28,-16 q-22,0 -28,16z" fill="${av.hair}"/>`;

  return `<svg viewBox="0 0 140 140" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="display:block;border-radius:inherit">
    <rect width="140" height="140" fill="${av.bg}"/><circle cx="70" cy="52" r="46" fill="#00000008"/>
    <path d="M22,140 q4,-38 48,-38 q44,0 48,38z" fill="${av.shirt}"/>
    <path d="M52,104 q18,10 36,0 l-2,14 q-16,8 -32,0z" fill="#00000022"/>
    <circle cx="70" cy="62" r="26" fill="${av.skin}"/>${hair}
    <circle cx="61" cy="63" r="2.4" fill="#2B2118"/><circle cx="79" cy="63" r="2.4" fill="#2B2118"/>
    <path d="M63,74 q7,6 14,0" stroke="#2B2118" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <circle cx="54" cy="70" r="3.4" fill="#C05F3C" opacity=".25"/><circle cx="86" cy="70" r="3.4" fill="#C05F3C" opacity=".25"/>
  </svg>`;
}

export function AvatarSVG({
  avatar,
  className = "",
  style,
}: {
  avatar: ArtisanAvatar;
  className?: string;
  style?: React.CSSProperties;
}) {
  const svgHtml = renderAvatarSVGString(avatar);
  return (
    <div
      className={`avatar-svg-wrap ${className}`}
      style={{ width: "100%", height: "100%", overflow: "hidden", ...style }}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}

export function SealSVG({ className = "" }: { className?: string }) {
  return (
    <svg className={`seal-svg ${className}`} viewBox="0 0 60 60" width="60" height="60">
      <circle cx="30" cy="24" r="17" fill="#C9A227" />
      <circle cx="30" cy="24" r="12.5" fill="#FDF6E7" />
      <text
        x="30"
        y="30"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="15"
        fill="#8A6B1D"
        fontWeight="bold"
      >
        K
      </text>
      <path d="M20,36 L16,56 L30,48 L44,56 L40,36 Z" fill="#C05F3C" />
    </svg>
  );
}

export function KalartLogoSVG({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} style={{ display: "block" }}>
      <circle cx="20" cy="20" r="19" fill="#C05F3C" />
      <path
        d="M20 7c-5 4-8 8.5-8 13.5a8 8 0 0016 0C28 15.5 25 11 20 7z"
        fill="#FAF5EE"
      />
      <circle cx="20" cy="21" r="3.2" fill="#D9A441" />
    </svg>
  );
}
