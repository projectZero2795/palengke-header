import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type PalengkeHeaderToolLink = {
  label: string;
  href: string;
  appKey?: string;
  external?: boolean;
  hide?: boolean;
};

export type PalengkeAdminTab = {
  label: string;
  href: string;
  appKey?: string;
};

export type PalengkeHeaderProps = {
  actions?: ReactNode;
  appLinks?: PalengkeHeaderToolLink[];
  brandProps?: (AnchorHTMLAttributes<HTMLAnchorElement> | ButtonHTMLAttributes<HTMLButtonElement>) & { onClick?: () => void };
  className?: string;
  currentApp?: string;
  homeHref?: string;
  nav?: ReactNode;
  productHref?: string;
  productLabel?: string;
  sticky?: boolean;
};

export type PalengkeWordmarkProps = {
  className?: string;
  label?: string;
};

export declare function PalengkeWordmark(props?: PalengkeWordmarkProps): ReactNode;
export declare function PalengkeHeader(props: PalengkeHeaderProps): ReactNode;
export declare const palengkeHeaderTools: PalengkeHeaderToolLink[];
export declare function PalengkeAdminTabs(props?: { currentApp?: string; tabs?: PalengkeAdminTab[] }): ReactNode;
export declare const palengkeAdminTabs: PalengkeAdminTab[];
