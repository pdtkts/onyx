"use client";

/**
 * Theme Preview Component
 *
 * Renders a two-panel visual preview of theme settings: a home view (sidebar + greeting)
 * and an active conversation view. Built independently using a grid-based layout approach
 * with composable render helpers from theme-preview-primitives.
 */

import { useCallback } from "react";
import Text from "@/refresh-components/texts/Text";
import Truncated from "@/refresh-components/texts/Truncated";
import { cn } from "@/lib/utils";
import { AppBadge, MockInput, HighlightRegion, FooterStrip } from "./theme-preview-primitives";
import { DEFAULT_APP_NAME } from "./theme-types";

export type PreviewHighlightTarget =
  | "sidebar"
  | "greeting"
  | "chat_header"
  | "chat_footer";

export interface PreviewProps {
  logoDisplayStyle: "logo_and_name" | "logo_only" | "name_only";
  applicationDisplayName: string;
  chat_footer_content: string;
  chat_header_content: string;
  greeting_message: string;
  className?: string;
  logoSrc?: string;
  highlightTarget?: PreviewHighlightTarget | null;
}

/**
 * Home view panel: shows sidebar with logo/name, greeting, and input placeholder.
 */
function HomePanel({
  logoDisplayStyle,
  applicationDisplayName,
  greeting_message,
  chat_footer_content,
  logoSrc,
  highlightTarget,
}: Omit<PreviewProps, "className" | "chat_header_content">) {
  const isHighlighted = useCallback(
    (t: PreviewHighlightTarget) => highlightTarget === t,
    [highlightTarget]
  );

  const showIcon = logoDisplayStyle !== "name_only";
  const showName =
    logoDisplayStyle === "logo_and_name" || logoDisplayStyle === "name_only";

  return (
    <article className="grid h-60 grid-cols-[6rem_1fr] overflow-hidden rounded-12 bg-background-tint-01 shadow-00">
      {/* Sidebar column */}
      <aside className="rounded-l-12 bg-background-tint-02 p-1">
        <HighlightRegion
          active={isHighlighted("sidebar")}
          className="items-center justify-start gap-1 overflow-hidden"
        >
          {showIcon && (
            <AppBadge
              src={logoSrc}
              dimension={16}
              fallbackToDefault={
                logoDisplayStyle === "logo_and_name" && !applicationDisplayName
              }
            />
          )}
          {showName && (
            <Truncated mainUiAction text04 nowrap>
              {applicationDisplayName || DEFAULT_APP_NAME}
            </Truncated>
          )}
        </HighlightRegion>
      </aside>

      {/* Main content column */}
      <div className="grid grid-rows-[1fr_auto] px-3">
        {/* Greeting area */}
        <div className="grid place-items-center">
          <div className="w-full max-w-[300px] space-y-2">
            <HighlightRegion
              active={isHighlighted("greeting")}
              className="mb-2 items-center justify-center gap-1 text-center"
            >
              <AppBadge src={logoSrc} dimension={18} />
              <Text
                text04
                headingH3
                className="max-w-[260px] break-words text-center"
              >
                {greeting_message}
              </Text>
            </HighlightRegion>
            <MockInput />
          </div>
        </div>

        {/* Footer */}
        <FooterStrip
          content={chat_footer_content}
          highlighted={isHighlighted("chat_footer")}
        />
      </div>
    </article>
  );
}

/**
 * Conversation view panel: shows header text, mock chat bubbles, and footer.
 */
function ConversationPanel({
  chat_header_content,
  chat_footer_content,
  highlightTarget,
}: Pick<PreviewProps, "chat_header_content" | "chat_footer_content" | "highlightTarget">) {
  const headerActive = highlightTarget === "chat_header";
  const footerActive = highlightTarget === "chat_footer";

  return (
    <article className="grid h-60 grid-rows-[auto_1fr_auto] rounded-12 bg-background-tint-01 shadow-00">
      {/* Header banner */}
      <div className="grid place-items-center">
        <div className="w-full max-w-[300px] text-center">
          <HighlightRegion
            active={headerActive}
            className="items-center justify-center text-center"
          >
            <Text
              figureSmallLabel
              text03
              className="max-w-full break-words text-center"
            >
              {chat_header_content}
            </Text>
          </HighlightRegion>
        </div>
      </div>

      {/* Mock conversation bubbles */}
      <div className="mx-auto flex w-full max-w-[300px] flex-col items-center justify-end gap-2 px-3">
        {/* Outgoing message skeleton */}
        <div className="self-end rounded-bl-[10px] rounded-tl-[10px] rounded-tr-[10px] bg-background-tint-02 px-2.5 py-2">
          <div className="h-1.5 w-20 rounded-04 bg-background-neutral-03" />
        </div>

        {/* Incoming message skeleton */}
        <div className="flex w-full flex-col gap-1.5 py-2 pl-2 pr-16">
          <div className="h-1.5 w-full rounded-04 bg-background-neutral-03" />
          <div className="h-1.5 w-full rounded-04 bg-background-neutral-03" />
          <div className="h-1.5 w-12 rounded-04 bg-background-neutral-03" />
        </div>

        <MockInput />
      </div>

      {/* Footer */}
      <FooterStrip content={chat_footer_content} highlighted={footerActive} />
    </article>
  );
}

/**
 * Two-panel theme preview: home view (left) + conversation view (right).
 * Accepts the same data shape as the theme form values for live previewing.
 */
export function ThemePreview({
  logoDisplayStyle,
  applicationDisplayName,
  chat_footer_content,
  chat_header_content,
  greeting_message,
  logoSrc,
  className,
  highlightTarget,
}: PreviewProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <HomePanel
        logoDisplayStyle={logoDisplayStyle}
        applicationDisplayName={applicationDisplayName}
        chat_footer_content={chat_footer_content}
        greeting_message={greeting_message}
        logoSrc={logoSrc}
        highlightTarget={highlightTarget}
      />
      <ConversationPanel
        chat_header_content={chat_header_content}
        chat_footer_content={chat_footer_content}
        highlightTarget={highlightTarget}
      />
    </div>
  );
}
