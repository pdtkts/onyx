/**
 * Gemini Web Image Generation — Feature Module Registration
 *
 * Registers the Gemini Web (cookie-based) provider group and form
 * into the feature image-gen registry at import time.
 */

import { registerFeatureImageGen } from "@/app/features/image-gen-registry";
import { GeminiWebImageGenForm } from "./GeminiWebImageGenForm";

// Provider group data — type inferred inline to avoid circular import
// (constants.ts → image-gen-registry.ts → this file → constants.ts)
const GEMINI_WEB_PROVIDERS = [
  {
    name: "Gemini Web (Cookie-based)",
    providers: [
      {
        image_provider_id: "gemini_web_pro",
        model_name: "gemini-3.0-pro",
        provider_name: "gemini_web",
        title: "Gemini 3 Pro Image",
        description:
          "Generate images via Gemini Web using browser cookies. No API key needed.",
      },
    ],
  },
];

registerFeatureImageGen(GEMINI_WEB_PROVIDERS, {
  gemini_web: GeminiWebImageGenForm,
});
