/**
 * Feature Image Generation Registry
 *
 * Allows feature modules to register custom image generation providers
 * and forms that integrate into the admin image-gen config page.
 *
 * IMPORTANT: This file must NOT import from constants.ts to avoid
 * circular dependency (constants.ts imports from here).
 * Types are defined inline to break the cycle.
 *
 * IMPORTANT: No side-effect imports of feature modules here!
 * ES module `import` is always hoisted — even at end of file it
 * runs BEFORE const declarations, causing TDZ errors.
 * Instead we use lazy loading in ensureModulesLoaded().
 */

import React from "react";
import { ImageGenFormBaseProps } from "@/app/admin/configuration/image-generation/forms/types";

/** Inline type — mirrors ImageProvider from constants.ts to avoid circular import */
interface FeatureImageProvider {
  image_provider_id: string;
  model_name: string;
  provider_name: string;
  title: string;
  description: string;
}

/** Inline type — mirrors ProviderGroup from constants.ts to avoid circular import */
interface FeatureProviderGroup {
  name: string;
  providers: FeatureImageProvider[];
}

// Internal registry state
const _providerGroups: FeatureProviderGroup[] = [];
const _forms: Record<string, React.ComponentType<ImageGenFormBaseProps>> = {};
let _modulesLoaded = false;

/**
 * Lazy-load all feature modules. Called once on first access.
 * Uses require() instead of import to avoid hoisting / TDZ issues.
 */
function ensureModulesLoaded(): void {
  if (_modulesLoaded) return;
  _modulesLoaded = true;

  // Each module calls registerFeatureImageGen() synchronously on require
  require("../modules/admin/gemini-web-image-gen");
}

/**
 * Register feature image gen providers and their form components.
 * Called by each feature module when loaded via ensureModulesLoaded().
 */
export function registerFeatureImageGen(
  groups: FeatureProviderGroup[],
  forms: Record<string, React.ComponentType<ImageGenFormBaseProps>>
): void {
  _providerGroups.push(...groups);
  Object.assign(_forms, forms);
}

/**
 * Get all registered feature provider groups.
 * Called by constants.ts to merge into IMAGE_PROVIDER_GROUPS.
 */
export function getFeatureProviderGroups(): FeatureProviderGroup[] {
  ensureModulesLoaded();
  return [..._providerGroups];
}

/**
 * Get a registered feature form component by provider name.
 * Called by getImageGenForm.tsx as fallback for unknown providers.
 */
export function getFeatureImageGenForm(
  providerName: string
): React.ComponentType<ImageGenFormBaseProps> | null {
  ensureModulesLoaded();
  return _forms[providerName] || null;
}
