"use client";

/**
 * useAppName Hook
 *
 * Returns the configured application display name from theme/enterprise settings.
 * Falls back to DEFAULT_APP_NAME when no custom name is configured.
 *
 * Usage:
 *   const appName = useAppName();
 *   // → "MyCustomApp" or DEFAULT_APP_NAME (default)
 */

import { useContext } from "react";
import { SettingsContext } from "@/providers/SettingsProvider";
import { DEFAULT_APP_NAME } from "./theme-types";

export { DEFAULT_APP_NAME };

export function useAppName(): string {
  const settings = useContext(SettingsContext);
  return settings?.enterpriseSettings?.application_name || DEFAULT_APP_NAME;
}
