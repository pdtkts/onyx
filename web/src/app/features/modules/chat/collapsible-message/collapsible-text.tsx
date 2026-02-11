"use client";

import React, { useState, useMemo } from "react";

/** Default max visible lines before collapsing */
const DEFAULT_MAX_LINES = 5;

interface CollapsibleTextProps {
  children: React.ReactNode;
  /** Raw text content for line counting */
  text: string;
  maxLines?: number;
}

/**
 * Wraps message content with collapse/expand behavior.
 * Shows first N lines with a "Show more" button when content exceeds limit.
 */
export function CollapsibleText({
  children,
  text,
  maxLines = DEFAULT_MAX_LINES,
}: CollapsibleTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const lineCount = useMemo(() => text.split("\n").length, [text]);
  const shouldCollapse = lineCount > maxLines;

  if (!shouldCollapse) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div
        className={
          isExpanded
            ? undefined
            : `overflow-hidden`
        }
        style={
          isExpanded
            ? undefined
            : { display: "-webkit-box", WebkitLineClamp: maxLines, WebkitBoxOrient: "vertical" }
        }
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="text-xs text-text-subtle hover:text-text-default mt-1 cursor-pointer transition-colors"
      >
        {isExpanded ? "Show less" : `Show more (${lineCount} lines)`}
      </button>
    </div>
  );
}
