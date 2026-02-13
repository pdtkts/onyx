"use client";

/**
 * Theme Preview Primitives
 *
 * Shared building blocks for the theme preview panels: logo badge, mock input,
 * highlight region, compact markdown renderer, and footer strip.
 */

import React from "react";
import type { Components } from "react-markdown";
import Text from "@/refresh-components/texts/Text";
import { cn, ensureHrefProtocol } from "@/lib/utils";
import { OnyxIcon } from "@/components/icons/icons";
import MinimalMarkdown from "@/components/chat/MinimalMarkdown";

/**
 * Builds react-markdown component overrides that render text in a
 * compact, centered style suitable for the preview panels.
 * Wrapped in a factory so the overrides object is created once on module load.
 */
function buildPreviewMarkdownOverrides(): Partial<Components> {
  const CenteredParagraph: Components["p"] = ({ children }) => (
    <Text as="p" text03 figureSmallValue className="my-0 text-center">
      {children}
    </Text>
  );

  const ExternalLink: Components["a"] = ({ href, className: cls, children, ...rest }) => (
    <a
      href={ensureHrefProtocol(href)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("underline underline-offset-2", cls)}
      {...rest}
    >
      <Text text03 figureSmallValue>{children}</Text>
    </a>
  );

  return { p: CenteredParagraph, a: ExternalLink };
}

const PREVIEW_MD_COMPONENTS = buildPreviewMarkdownOverrides();

/** Memoized markdown renderer for footer/header preview content */
export const CompactMarkdown = React.memo(function CompactMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <MinimalMarkdown
      content={content}
      className={className}
      components={PREVIEW_MD_COMPONENTS}
    />
  );
});

/** Renders the app icon: custom image or default Onyx icon */
export function AppBadge({
  src,
  dimension,
  fallbackToDefault,
  className,
}: {
  src?: string;
  dimension: number;
  fallbackToDefault?: boolean;
  className?: string;
}) {
  if (src && !fallbackToDefault) {
    return (
      <img
        src={src}
        alt="App logo"
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ height: dimension, width: dimension }}
      />
    );
  }
  return <OnyxIcon size={dimension} className={cn("shrink-0", className)} />;
}

/** Placeholder text input shown at the bottom of preview panels */
export function MockInput() {
  return (
    <section className="w-full rounded-08 border border-border-01 bg-background-neutral-00 px-2.5 pb-1 pt-2.5 h-14">
      <div className="grid h-full place-items-end justify-end">
        <div className="h-5 w-5 rounded-[0.25rem] bg-theme-primary-05" />
      </div>
    </section>
  );
}

/** Renders a highlight wrapper that lights up when the matching target is active */
export function HighlightRegion({
  active,
  children,
  className,
}: {
  active: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full rounded-08 border border-transparent p-0.5",
        active && "bg-highlight-match",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Footer strip shared by both panels - renders markdown disclaimer content */
export function FooterStrip({
  content,
  highlighted,
}: {
  content: string;
  highlighted: boolean;
}) {
  return (
    <div className="grid w-full place-items-center">
      <div className="w-full max-w-[300px] text-center">
        <HighlightRegion
          active={highlighted}
          className="items-start justify-center rounded-04 text-center"
        >
          <CompactMarkdown
            content={content}
            className="max-w-full origin-center text-center"
          />
        </HighlightRegion>
      </div>
    </div>
  );
}
