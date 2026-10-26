/**
 * KALART icon set — single consistent stroke library (1.6px stroke,
 * 24px grid, round caps). No emoji anywhere in the product.
 */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>
      {children}
    </svg>
  );
}

export const IconSearch = (p: P) => (<Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>);
export const IconBag = (p: P) => (<Svg {...p}><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></Svg>);
export const IconHeart = (p: P) => (<Svg {...p}><path d="M12 20s-7-4.6-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5c0 4.9-7 9.5-7 9.5Z" /></Svg>);
export const IconUser = (p: P) => (<Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" /></Svg>);
export const IconMenu = (p: P) => (<Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>);
export const IconClose = (p: P) => (<Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>);
export const IconChevronDown = (p: P) => (<Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>);
export const IconChevronRight = (p: P) => (<Svg {...p}><path d="m9 6 6 6-6 6" /></Svg>);
export const IconChevronLeft = (p: P) => (<Svg {...p}><path d="m15 6-6 6 6 6" /></Svg>);
export const IconStar = (p: P & { filled?: boolean }) => (
  <Svg {...p} fill={p.filled ? "currentColor" : "none"}>
    <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8L12 3Z" />
  </Svg>);
export const IconCheck = (p: P) => (<Svg {...p}><path d="m4.5 12.5 5 5 10-11" /></Svg>);
export const IconPlus = (p: P) => (<Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>);
export const IconMinus = (p: P) => (<Svg {...p}><path d="M5 12h14" /></Svg>);
export const IconTrash = (p: P) => (<Svg {...p}><path d="M4 7h16M9 7V5h6v2m-9 0 1 13h8l1-13" /></Svg>);
export const IconUpload = (p: P) => (<Svg {...p}><path d="M12 16V4m-5 5 5-5 5 5" /><path d="M4 20h16" /></Svg>);
export const IconSparkle = (p: P) => (<Svg {...p}><path d="M12 4l1.8 4.6L18 10l-4.2 1.4L12 16l-1.8-4.6L6 10l4.2-1.4L12 4Z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></Svg>);
export const IconShield = (p: P) => (<Svg {...p}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /><path d="m9 12 2 2 4-4" /></Svg>);
export const IconTruck = (p: P) => (<Svg {...p}><path d="M2 7h11v9H2zM13 10h4l4 3v3h-8" /><circle cx="6" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></Svg>);
export const IconRefresh = (p: P) => (<Svg {...p}><path d="M20 11a8 8 0 1 0-2 6" /><path d="M20 5v6h-6" /></Svg>);
export const IconFilter = (p: P) => (<Svg {...p}><path d="M4 6h16M7 12h10M10 18h4" /></Svg>);
export const IconArrowRight = (p: P) => (<Svg {...p}><path d="M4 12h16m-6-6 6 6-6 6" /></Svg>);
export const IconGrid = (p: P) => (<Svg {...p}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></Svg>);
export const IconBox = (p: P) => (<Svg {...p}><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" /><path d="M4 7l8 4 8-4M12 11v10" /></Svg>);
export const IconChart = (p: P) => (<Svg {...p}><path d="M4 20V6m5 14v-8m5 8V9m5 11v-5" /></Svg>);
export const IconRupee = (p: P) => (<Svg {...p}><path d="M7 5h10M7 10h10M16 5c0 4-3 5-6 5l6 8" /></Svg>);
export const IconImage = (p: P) => (<Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m5 18 5-4 3 2 3-3 3 3" /></Svg>);
export const IconAlert = (p: P) => (<Svg {...p}><path d="M12 4 2.5 20h19L12 4Z" /><path d="M12 11v4m0 3v.5" /></Svg>);
export const IconInfo = (p: P) => (<Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8v.5" /></Svg>);
export const IconPin = (p: P) => (<Svg {...p}><path d="M12 21s-6-5.5-6-11a6 6 0 1 1 12 0c0 5.5-6 11-6 11Z" /><circle cx="12" cy="10" r="2.2" /></Svg>);
export const IconMail = (p: P) => (<Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></Svg>);
export const IconLogout = (p: P) => (<Svg {...p}><path d="M9 4H5v16h4m6-8H9m8 0-3-3m3 3-3 3" /></Svg>);
export const IconChat = (p: P) => (<Svg {...p}><path d="M4 5h16v11H9l-5 4V5Z" /></Svg>);
export const IconEye = (p: P) => (<Svg {...p}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.6" /></Svg>);
export const IconLoom = (p: P) => (<Svg {...p}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 4v16M12 4v16M16 4v16M4 9h16M4 15h16" /></Svg>);
