import { ThemeSettings } from "./theme-types";

const THEME_BASE = "/api/features/theme-settings";
const THEME_ADMIN_BASE = "/api/features/admin/theme-settings";

export const THEME_LOGO_URL = `${THEME_BASE}/logo`;

export async function fetchThemeSettings(): Promise<ThemeSettings> {
  const res = await fetch(THEME_BASE);
  if (!res.ok) {
    throw new Error(`Failed to fetch theme settings: ${res.status}`);
  }
  return res.json();
}

export async function updateThemeSettings(
  settings: ThemeSettings
): Promise<void> {
  const res = await fetch(THEME_ADMIN_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    throw new Error(`Failed to update theme settings: ${res.status}`);
  }
}

export async function uploadThemeLogo(file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${THEME_ADMIN_BASE}/logo`, {
    method: "PUT",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Failed to upload theme logo: ${res.status}`);
  }
}
