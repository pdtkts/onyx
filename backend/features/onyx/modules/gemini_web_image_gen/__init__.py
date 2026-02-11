"""Gemini Web Image Generation feature module.

Registers the GeminiWebImageGenProvider into the monkey-patched
image gen factory at application startup.
"""


def register() -> None:
    """Register the Gemini Web image generation provider."""
    from features.onyx.main import register_custom_provider
    from features.onyx.modules.gemini_web_image_gen.provider import (
        GeminiWebImageGenProvider,
    )

    register_custom_provider("gemini_web", GeminiWebImageGenProvider)
