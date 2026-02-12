"use client";

/**
 * Theme Chat Section
 *
 * Form fields for configuring the chat experience text:
 * greeting message (home page), header banner, and footer disclaimer.
 * Each field links to the live preview via highlight handlers.
 */

import { FormField } from "@/refresh-components/form/FormField";
import InputTypeIn from "@/refresh-components/inputs/InputTypeIn";
import InputTextArea from "@/refresh-components/inputs/InputTextArea";
import CharacterCount from "@/refresh-components/CharacterCount";
import { useFormikContext } from "formik";
import type { THEME_CHAR_LIMITS } from "./theme-types";
import type { PreviewHighlightTarget } from "./theme-preview";

interface ThemeChatSectionProps {
  charLimits: typeof THEME_CHAR_LIMITS;
  greetingMessageInputRef: React.RefObject<HTMLInputElement | null>;
  headerContentInputRef: React.RefObject<HTMLInputElement | null>;
  lowerDisclaimerInputRef: React.RefObject<HTMLTextAreaElement | null>;
  bindPreviewRegion: (target: PreviewHighlightTarget) => Record<string, () => void>;
}

/** Helper to derive FormField state from a formik error value */
function fieldState(error: unknown): "error" | "idle" {
  return error ? "error" : "idle";
}

export function ThemeChatSection({
  charLimits,
  greetingMessageInputRef,
  headerContentInputRef,
  lowerDisclaimerInputRef,
  bindPreviewRegion,
}: ThemeChatSectionProps) {
  const { values, errors, setFieldValue } = useFormikContext<any>();

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome greeting shown on the landing page */}
      <FormField state={fieldState(errors.custom_greeting_message)}>
        <FormField.Label
          rightAction={
            <CharacterCount value={values.custom_greeting_message} limit={charLimits.custom_greeting_message} />
          }
        >
          Greeting Message
        </FormField.Label>
        <FormField.Control asChild>
          <InputTypeIn
            ref={greetingMessageInputRef}
            data-label="theme-greeting"
            showClearButton
            variant={errors.custom_greeting_message ? "error" : undefined}
            value={values.custom_greeting_message}
            {...bindPreviewRegion("greeting")}
            onChange={(e) => setFieldValue("custom_greeting_message", e.target.value)}
          />
        </FormField.Control>
        <FormField.Description>
          Welcome text displayed on the home screen before any conversation starts.
        </FormField.Description>
        <FormField.Message messages={{ error: errors.custom_greeting_message as string }} />
      </FormField>

      {/* Persistent header banner inside active conversations */}
      <FormField state={fieldState(errors.custom_header_content)}>
        <FormField.Label
          rightAction={
            <CharacterCount value={values.custom_header_content} limit={charLimits.custom_header_content} />
          }
        >
          Chat Header Text
        </FormField.Label>
        <FormField.Control asChild>
          <InputTypeIn
            ref={headerContentInputRef}
            data-label="theme-chat-header"
            showClearButton
            variant={errors.custom_header_content ? "error" : undefined}
            value={values.custom_header_content}
            {...bindPreviewRegion("chat_header")}
            onChange={(e) => setFieldValue("custom_header_content", e.target.value)}
          />
        </FormField.Control>
        <FormField.Description>
          A short line shown at the top of every chat conversation.
        </FormField.Description>
        <FormField.Message messages={{ error: errors.custom_header_content as string }} />
      </FormField>

      {/* Disclaimer / legal footer with markdown support */}
      <FormField state={fieldState(errors.custom_lower_disclaimer_content)}>
        <FormField.Label
          rightAction={
            <CharacterCount
              value={values.custom_lower_disclaimer_content}
              limit={charLimits.custom_lower_disclaimer_content}
            />
          }
        >
          Chat Footer Text
        </FormField.Label>
        <FormField.Control asChild>
          <InputTextArea
            ref={lowerDisclaimerInputRef}
            data-label="theme-chat-footer"
            rows={3}
            placeholder="Add markdown content"
            variant={errors.custom_lower_disclaimer_content ? "error" : undefined}
            value={values.custom_lower_disclaimer_content}
            {...bindPreviewRegion("chat_footer")}
            onChange={(e) => setFieldValue("custom_lower_disclaimer_content", e.target.value)}
          />
        </FormField.Control>
        <FormField.Description>
          Supports markdown. Ideal for disclaimers, terms of use, or organizational notices.
        </FormField.Description>
        <FormField.Message messages={{ error: errors.custom_lower_disclaimer_content as string }} />
      </FormField>
    </div>
  );
}
