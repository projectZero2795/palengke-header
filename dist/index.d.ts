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

export type PalengkeHeaderAccountUser = {
  id?: string | null;
  display_name?: string | null;
  email?: string | null;
  contact_email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  photo_url?: string | null;
  picture?: string | null;
  account_type?: string | null;
  admin_role?: string | null;
  [key: string]: unknown;
};

export type PalengkeHeaderAccountProfile = {
  shop_name?: string | null;
  slug?: string | null;
  avatar_url?: string | null;
  contact_email?: string | null;
  [key: string]: unknown;
};

export type PalengkeHeaderAccount = {
  user?: PalengkeHeaderAccountUser | null;
  profile?: PalengkeHeaderAccountProfile | null;
};

export type PalengkeHeaderAccountConfig = {
  account?: PalengkeHeaderAccount | PalengkeHeaderAccountUser | null;
  user?: PalengkeHeaderAccountUser | null;
  profile?: PalengkeHeaderAccountProfile | null;
  onLogin?: (mode: "login" | "register") => void;
  onLogout?: () => void;
  loginHref?: string;
  signupHref?: string;
};

export type PalengkeHeaderProps = {
  account?: PalengkeHeaderAccountConfig;
  actions?: ReactNode;
  appLinks?: PalengkeHeaderToolLink[];
  brandProps?: (AnchorHTMLAttributes<HTMLAnchorElement> | ButtonHTMLAttributes<HTMLButtonElement>) & { onClick?: () => void };
  className?: string;
  currentApp?: string;
  homeHref?: string;
  nav?: ReactNode;
  productHref?: string;
  productLabel?: string;
  showCurrentAppLink?: boolean;
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
