"use client";

import Separator from "@/refresh-components/Separator";
import { useFormikContext } from "formik";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { THEME_CHAR_LIMITS } from "./theme-types";
import { THEME_LOGO_URL } from "./theme-api";
import { ThemeBrandingSection } from "./theme-branding-section";
import { ThemeChatSection } from "./theme-chat-section";
import { ThemeNoticesSection } from "./theme-notices-section";
import { ThemePreview } from "./theme-preview";
import { usePreviewHighlight } from "./use-preview-highlight";

export interface ThemeSettingsFormRef {
  focusFirstError: (errors: Record<string, any>) => void;
}

interface ThemeSettingsFormProps {
  selectedLogo: File | null;
  setSelectedLogo: (file: File | null) => void;
}

export const ThemeSettingsForm = forwardRef<ThemeSettingsFormRef, ThemeSettingsFormProps>(
  function ThemeSettingsForm({ selectedLogo, setSelectedLogo }, ref) {
    const { values } = useFormikContext<any>();

    // Field refs for focusFirstError
    const applicationNameInputRef = useRef<HTMLInputElement>(null);
    const greetingMessageInputRef = useRef<HTMLInputElement>(null);
    const headerContentInputRef = useRef<HTMLInputElement>(null);
    const lowerDisclaimerInputRef = useRef<HTMLTextAreaElement>(null);
    const noticeHeaderInputRef = useRef<HTMLInputElement>(null);
    const noticeContentInputRef = useRef<HTMLTextAreaElement>(null);
    const consentPromptRef = useRef<HTMLTextAreaElement>(null);

    // Preview highlight — reducer-based hook (see use-preview-highlight.ts)
    const { activeTarget, bindPreviewRegion } = usePreviewHighlight();

    // Map field names to their DOM refs for error-focus navigation.
    // Priority order is determined by the Map insertion order.
    const fieldRefMap = useMemo(() => new Map<string, React.RefObject<HTMLElement | null>>([
      ["application_name", applicationNameInputRef],
      ["custom_greeting_message", greetingMessageInputRef],
      ["custom_header_content", headerContentInputRef],
      ["custom_lower_disclaimer_content", lowerDisclaimerInputRef],
      ["custom_popup_header", noticeHeaderInputRef],
      ["custom_popup_content", noticeContentInputRef],
      ["consent_screen_prompt", consentPromptRef],
    ]), []);

    useImperativeHandle(ref, () => ({
      focusFirstError(errors: Record<string, unknown>) {
        const entries = Array.from(fieldRefMap.entries());
        const match = entries.find(([key]) => Boolean(errors[key]));
        if (match?.[1].current) {
          match[1].current.focus();
          match[1].current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      },
    }));

    // Logo src for preview (with cleanup to prevent memory leak)
    const logoObjectUrl = useMemo(() => {
      if (selectedLogo) return URL.createObjectURL(selectedLogo);
      return null;
    }, [selectedLogo]);

    useEffect(() => {
      return () => {
        if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl);
      };
    }, [logoObjectUrl]);

    const logoSrc = logoObjectUrl
      ?? (values.use_custom_logo ? `${THEME_LOGO_URL}?u=${Date.now()}` : undefined);

    return (
      <div className="flex flex-col gap-4 w-full">
        <ThemeBrandingSection
          selectedLogo={selectedLogo}
          setSelectedLogo={setSelectedLogo}
          charLimits={THEME_CHAR_LIMITS}
          applicationNameInputRef={applicationNameInputRef}
          bindPreviewRegion={bindPreviewRegion}
        />

        <Separator className="my-4" />

        <ThemePreview
          className="mb-8"
          logoDisplayStyle={values.logo_display_style}
          applicationDisplayName={values.application_name ?? ""}
          chat_footer_content={values.custom_lower_disclaimer_content || "Chat Footer Content"}
          chat_header_content={values.custom_header_content || "Chat Header Content"}
          greeting_message={values.custom_greeting_message || "Welcome to Acme Chat"}
          logoSrc={logoSrc}
          highlightTarget={activeTarget}
        />

        <ThemeChatSection
          charLimits={THEME_CHAR_LIMITS}
          greetingMessageInputRef={greetingMessageInputRef}
          headerContentInputRef={headerContentInputRef}
          lowerDisclaimerInputRef={lowerDisclaimerInputRef}
          bindPreviewRegion={bindPreviewRegion}
        />

        <Separator className="my-4" />

        <ThemeNoticesSection
          charLimits={THEME_CHAR_LIMITS}
          noticeHeaderInputRef={noticeHeaderInputRef}
          noticeContentInputRef={noticeContentInputRef}
          consentPromptRef={consentPromptRef}
        />
      </div>
    );
  }
);
