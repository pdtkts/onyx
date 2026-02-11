import React from "react";
import { ImageGenFormBaseProps } from "./types";
import { OpenAIImageGenForm } from "./OpenAIImageGenForm";
import { AzureImageGenForm } from "./AzureImageGenForm";
import { VertexImageGenForm } from "./VertexImageGenForm";
import { getFeatureImageGenForm } from "@/app/features/image-gen-registry";

/**
 * Factory function that routes to the correct provider-specific form
 * based on the imageProvider.provider_name.
 */
export function getImageGenForm(props: ImageGenFormBaseProps): React.ReactNode {
  const providerName = props.imageProvider.provider_name;

  switch (providerName) {
    case "openai":
      return <OpenAIImageGenForm {...props} />;
    case "azure":
      return <AzureImageGenForm {...props} />;
    case "vertex_ai":
      return <VertexImageGenForm {...props} />;
    default: {
      // Check feature module registry before falling back
      const FeatureForm = getFeatureImageGenForm(providerName);
      if (FeatureForm) {
        return <FeatureForm {...props} />;
      }
      console.warn(
        `Unknown image provider: ${providerName}, falling back to OpenAI form`
      );
      return <OpenAIImageGenForm {...props} />;
    }
  }
}
