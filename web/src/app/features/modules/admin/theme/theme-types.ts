import { EnterpriseSettings } from "@/app/admin/settings/interfaces";

/**
 * ThemeSettings mirrors EnterpriseSettings for the inject pattern.
 * We re-use the existing EnterpriseSettings type directly since
 * the backend returns the same shape and the inject replaces
 * enterpriseSettings wholesale.
 */
export type ThemeSettings = EnterpriseSettings;

/**
 * Default application name used as fallback when no custom name is configured.
 * Centralized here so all theme-related code references one constant.
 */
export const DEFAULT_APP_NAME = "Onyx";

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  application_name: null,
  use_custom_logo: false,
  use_custom_logotype: false,
  logo_display_style: null,
  custom_nav_items: [],
  two_lines_for_chat_header: null,
  custom_lower_disclaimer_content: null,
  custom_header_content: null,
  custom_popup_header: null,
  custom_popup_content: null,
  enable_consent_screen: null,
  consent_screen_prompt: null,
  show_first_visit_notice: null,
  custom_greeting_message: null,
};

export const THEME_CHAR_LIMITS = {
  application_name: 50,
  custom_greeting_message: 50,
  custom_header_content: 100,
  custom_lower_disclaimer_content: 200,
  custom_popup_header: 100,
  custom_popup_content: 500,
  consent_screen_prompt: 200,
} as const;
