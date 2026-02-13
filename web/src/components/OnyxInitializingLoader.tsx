"use client";

import Logo from "@/refresh-components/Logo";
import { DEFAULT_APP_NAME } from "@/app/features/modules/admin/theme/theme-types";
import { useContext } from "react";
import { SettingsContext } from "@/providers/SettingsProvider";

export default function OnyxInitializingLoader() {
  const settings = useContext(SettingsContext);

  return (
    <div className="mx-auto my-auto animate-pulse">
      <Logo folded size={96} className="mx-auto mb-3" />
      <p className="text-lg text-text font-semibold">
        Initializing {settings?.enterpriseSettings?.application_name ?? DEFAULT_APP_NAME}
      </p>
    </div>
  );
}
