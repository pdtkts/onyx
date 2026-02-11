/**
 * Chat feature registry - provides optional wrappers for chat message content.
 * Core components call into this registry to apply feature enhancements
 * without coupling to specific feature implementations.
 */

import React from "react";

type MessageContentWrapper = React.ComponentType<{
  children: React.ReactNode;
  text: string;
}>;

let _humanMessageWrapper: MessageContentWrapper | null = null;

/** Register a wrapper component for human message content */
export function registerHumanMessageWrapper(wrapper: MessageContentWrapper) {
  _humanMessageWrapper = wrapper;
}

/** Get the registered wrapper (or null if none) */
export function getHumanMessageWrapper(): MessageContentWrapper | null {
  return _humanMessageWrapper;
}
