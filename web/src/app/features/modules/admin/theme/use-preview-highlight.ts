"use client";

/**
 * usePreviewHighlight Hook
 *
 * Tracks which preview region the user is interacting with (focus or hover).
 * Returns the active target and a factory that produces DOM event bindings
 * for any given region key.
 *
 * Design: uses a single reducer instead of dual useState to keep transitions
 * atomic and avoid stale-closure issues.
 */

import { useCallback, useReducer } from "react";
import type { PreviewHighlightTarget } from "./theme-preview";

interface HighlightState {
  focused: PreviewHighlightTarget | null;
  hovered: PreviewHighlightTarget | null;
}

type HighlightAction =
  | { type: "focus"; target: PreviewHighlightTarget }
  | { type: "blur"; target: PreviewHighlightTarget }
  | { type: "enter"; target: PreviewHighlightTarget }
  | { type: "leave"; target: PreviewHighlightTarget };

function highlightReducer(state: HighlightState, action: HighlightAction): HighlightState {
  switch (action.type) {
    case "focus":
      return { ...state, focused: action.target };
    case "blur":
      return state.focused === action.target ? { ...state, focused: null } : state;
    case "enter":
      return { ...state, hovered: action.target };
    case "leave":
      return state.hovered === action.target ? { ...state, hovered: null } : state;
  }
}

const INITIAL_STATE: HighlightState = { focused: null, hovered: null };

/**
 * Manages preview highlight state with a reducer pattern.
 * Focus takes priority over hover. Returns the resolved active target
 * and a handler factory for binding to form fields.
 */
export function usePreviewHighlight() {
  const [state, dispatch] = useReducer(highlightReducer, INITIAL_STATE);

  // Focus takes priority; fall back to hover
  const activeTarget = state.focused ?? state.hovered;

  const bindPreviewRegion = useCallback(
    (target: PreviewHighlightTarget) => ({
      onFocus: () => dispatch({ type: "focus", target }),
      onBlur: () => dispatch({ type: "blur", target }),
      onMouseEnter: () => dispatch({ type: "enter", target }),
      onMouseLeave: () => dispatch({ type: "leave", target }),
    }),
    []
  );

  return { activeTarget, bindPreviewRegion } as const;
}
