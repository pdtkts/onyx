"use client";

/**
 * Theme Notices Section
 *
 * Configures the first-visit popup notice and optional consent screen.
 * Uses a card-style container with toggle switches to reveal nested fields.
 * Auto-focuses the first visible input when a toggle is enabled.
 */

import { FormField } from "@/refresh-components/form/FormField";
import InputTypeIn from "@/refresh-components/inputs/InputTypeIn";
import InputTextArea from "@/refresh-components/inputs/InputTextArea";
import Switch from "@/refresh-components/inputs/Switch";
import CharacterCount from "@/refresh-components/CharacterCount";
import { useFormikContext } from "formik";
import { useEffect, useRef } from "react";
import type { THEME_CHAR_LIMITS } from "./theme-types";

interface ThemeNoticesSectionProps {
  charLimits: typeof THEME_CHAR_LIMITS;
  noticeHeaderInputRef: React.RefObject<HTMLInputElement | null>;
  noticeContentInputRef: React.RefObject<HTMLTextAreaElement | null>;
  consentPromptRef: React.RefObject<HTMLTextAreaElement | null>;
}

/** Derive FormField state string from a formik error */
function deriveState(error: unknown): "error" | "idle" {
  return error ? "error" : "idle";
}

export function ThemeNoticesSection({
  charLimits,
  noticeHeaderInputRef,
  noticeContentInputRef,
  consentPromptRef,
}: ThemeNoticesSectionProps) {
  const { values, errors, setFieldValue } = useFormikContext<any>();

  // Track previous toggle states for auto-focus on activation
  const wasNoticeEnabled = useRef(Boolean(values.show_first_visit_notice));
  const wasConsentEnabled = useRef(Boolean(values.enable_consent_screen));

  // Auto-focus notice header when the notice toggle transitions off -> on
  useEffect(() => {
    const previous = wasNoticeEnabled.current;
    const current = Boolean(values.show_first_visit_notice);
    if (!previous && current) {
      requestAnimationFrame(() => noticeHeaderInputRef.current?.focus());
    }
    wasNoticeEnabled.current = current;
  }, [values.show_first_visit_notice, noticeHeaderInputRef]);

  // Auto-focus consent prompt when the consent toggle transitions off -> on
  useEffect(() => {
    const previous = wasConsentEnabled.current;
    const current = Boolean(values.enable_consent_screen);
    if (!previous && current) {
      requestAnimationFrame(() => consentPromptRef.current?.focus());
    }
    wasConsentEnabled.current = current;
  }, [values.enable_consent_screen, consentPromptRef]);

  return (
    <section className="rounded-16 bg-background-tint-00 p-4 space-y-4">
      {/* Master toggle for the first-visit notice */}
      <FormField state="idle" className="gap-0">
        <div className="flex items-center justify-between">
          <FormField.Label>Show First Visit Notice</FormField.Label>
          <FormField.Control>
            <Switch
              aria-label="Show First Visit Notice"
              data-label="theme-notice-toggle"
              checked={values.show_first_visit_notice}
              onCheckedChange={(checked) => setFieldValue("show_first_visit_notice", checked)}
            />
          </FormField.Control>
        </div>
        <FormField.Description>
          When enabled, new users see a one-time popup on their first visit.
        </FormField.Description>
      </FormField>

      {values.show_first_visit_notice && (
        <>
          {/* Notice title */}
          <FormField state={deriveState(errors.custom_popup_header)}>
            <FormField.Label
              required
              rightAction={
                <CharacterCount value={values.custom_popup_header} limit={charLimits.custom_popup_header} />
              }
            >
              Notice Header
            </FormField.Label>
            <FormField.Control asChild>
              <InputTypeIn
                ref={noticeHeaderInputRef}
                data-label="theme-notice-header"
                showClearButton
                variant={errors.custom_popup_header ? "error" : undefined}
                value={values.custom_popup_header}
                onChange={(e) => setFieldValue("custom_popup_header", e.target.value)}
              />
            </FormField.Control>
            <FormField.Description>
              Title displayed at the top of the popup notice.
            </FormField.Description>
            <FormField.Message messages={{ error: errors.custom_popup_header as string }} />
          </FormField>

          {/* Notice body content */}
          <FormField state={deriveState(errors.custom_popup_content)}>
            <FormField.Label
              required
              rightAction={
                <CharacterCount value={values.custom_popup_content} limit={charLimits.custom_popup_content} />
              }
            >
              Notice Content
            </FormField.Label>
            <FormField.Control asChild>
              <InputTextArea
                ref={noticeContentInputRef}
                data-label="theme-notice-body"
                rows={3}
                placeholder="Add markdown content"
                variant={errors.custom_popup_content ? "error" : undefined}
                value={values.custom_popup_content}
                onChange={(e) => setFieldValue("custom_popup_content", e.target.value)}
              />
            </FormField.Control>
            <FormField.Description>
              The main body of the notice popup. Markdown formatting is supported.
            </FormField.Description>
            <FormField.Message messages={{ error: errors.custom_popup_content as string }} />
          </FormField>

          {/* Consent requirement sub-toggle */}
          <FormField state="idle" className="gap-0">
            <div className="flex items-center justify-between">
              <FormField.Label>Require Consent to Notice</FormField.Label>
              <FormField.Control>
                <Switch
                  aria-label="Require Consent to Notice"
                  data-label="theme-consent-toggle"
                  checked={values.enable_consent_screen}
                  onCheckedChange={(checked) => setFieldValue("enable_consent_screen", checked)}
                />
              </FormField.Control>
            </div>
            <FormField.Description>
              Users must acknowledge and accept the notice before they can proceed.
            </FormField.Description>
          </FormField>

          {/* Consent prompt text (only when consent is required) */}
          {values.enable_consent_screen && (
            <FormField state={deriveState(errors.consent_screen_prompt)}>
              <FormField.Label
                required
                rightAction={
                  <CharacterCount value={values.consent_screen_prompt} limit={charLimits.consent_screen_prompt} />
                }
              >
                Notice Consent Prompt
              </FormField.Label>
              <FormField.Control asChild>
                <InputTextArea
                  ref={consentPromptRef}
                  data-label="theme-consent-prompt"
                  rows={3}
                  placeholder="Add markdown content"
                  variant={errors.consent_screen_prompt ? "error" : undefined}
                  value={values.consent_screen_prompt}
                  onChange={(e) => setFieldValue("consent_screen_prompt", e.target.value)}
                />
              </FormField.Control>
              <FormField.Description>
                The acceptance prompt shown alongside a confirmation button.
              </FormField.Description>
              <FormField.Message messages={{ error: errors.consent_screen_prompt as string }} />
            </FormField>
          )}
        </>
      )}
    </section>
  );
}
