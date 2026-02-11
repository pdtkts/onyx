"""Gemini Web image generation provider using cookie-based auth.

Uses gemini_webapi library (reverse-engineered Gemini web app) to
generate images via Model.G_3_0_PRO + ImageMode.PRO.
Images are downloaded with client cookies and returned as base64.
"""

from __future__ import annotations

import base64
from typing import Any
from typing import TYPE_CHECKING

from onyx.image_gen.interfaces import ImageGenerationProvider
from onyx.image_gen.interfaces import ImageGenerationProviderCredentials
from onyx.utils.logger import setup_logger

if TYPE_CHECKING:
    from onyx.image_gen.interfaces import ImageGenerationResponse

logger = setup_logger()


class GeminiWebImageGenProvider(ImageGenerationProvider):
    """Image generation provider using Gemini Web (cookie-based auth)."""

    def __init__(self, secure_1psid: str, secure_1psidts: str) -> None:
        self._secure_1psid = secure_1psid
        self._secure_1psidts = secure_1psidts

    @classmethod
    def validate_credentials(
        cls,
        credentials: ImageGenerationProviderCredentials,
    ) -> bool:
        """Check that both cookies are present in custom_config."""
        cfg = credentials.custom_config or {}
        return bool(cfg.get("secure_1psid") and cfg.get("secure_1psidts"))

    @classmethod
    def _build_from_credentials(
        cls,
        credentials: ImageGenerationProviderCredentials,
    ) -> GeminiWebImageGenProvider:
        cfg = credentials.custom_config or {}
        return cls(
            secure_1psid=cfg["secure_1psid"],
            secure_1psidts=cfg["secure_1psidts"],
        )

    def generate_image(
        self,
        prompt: str,
        model: str,
        size: str,
        n: int,
        quality: str | None = None,
        **kwargs: Any,
    ) -> ImageGenerationResponse:
        """Generate image via Gemini Web, bridge async->sync via thread pool.

        Always returns 1 image (Gemini Web limitation). The `n` param is ignored.
        Image bytes are downloaded with client cookies and returned as base64.
        """
        from features.onyx.modules.gemini_web_image_gen.client_manager import (
            GeminiWebClientManager,
        )

        manager = GeminiWebClientManager.get_instance()

        # Init/reinit client if cookies changed
        manager.init_client(self._secure_1psid, self._secure_1psidts)

        # Run async generation on the managed event loop
        result = manager.run_coroutine(self._async_generate(manager, prompt))
        return result  # type: ignore[return-value]

    async def _async_generate(
        self,
        manager: Any,
        prompt: str,
    ) -> ImageGenerationResponse:
        """Async image generation using gemini_webapi client."""
        from gemini_webapi.constants import ImageMode, Model
        from gemini_webapi.types import GeneratedImage

        client = manager.client
        if client is None:
            raise RuntimeError(
                "GeminiClient not initialized. "
                "Check cookie configuration in admin settings."
            )

        try:
            response = await client.generate_content(
                prompt,
                model=Model.G_3_0_PRO,
                image_mode=ImageMode.PRO,
            )
        except Exception as e:
            error_type = type(e).__name__
            logger.error(f"Gemini Web image generation failed: {error_type}: {e}")
            raise RuntimeError(
                f"Image generation failed: {error_type}. "
                "If AuthError, please update your Gemini cookies in admin settings."
            ) from e

        if not response.images:
            raise RuntimeError(
                "Gemini Web returned no images. "
                "Try rephrasing your prompt to explicitly request image generation."
            )

        # Take first image only (Gemini Web returns 1 per request)
        image = response.images[0]

        # Download image bytes — GeneratedImage needs cookies
        try:
            img_bytes = await self._download_image(image)
        except Exception as e:
            logger.error(f"Failed to download generated image: {e}")
            raise RuntimeError(
                "Failed to download generated image from Gemini."
            ) from e

        b64_data = base64.b64encode(img_bytes).decode("utf-8")

        # Build litellm-compatible ImageResponse
        from litellm.types.utils import ImageObject, ImageResponse

        return ImageResponse(
            data=[ImageObject(b64_json=b64_data, url=None, revised_prompt=None)],
            created=0,
        )

    @staticmethod
    async def _download_image(image: Any) -> bytes:
        """Download image bytes, handling both GeneratedImage and WebImage."""
        from gemini_webapi.types import GeneratedImage

        import httpx

        url = getattr(image, "url", None)
        if not url:
            raise RuntimeError("Image has no URL to download")

        # GeneratedImage: append =s2048 for full-size, use cookies
        if isinstance(image, GeneratedImage):
            if "=s" not in url:
                url = f"{url}=s2048"
            async with httpx.AsyncClient(cookies=image.cookies) as dl:
                resp = await dl.get(url, follow_redirects=True)
                resp.raise_for_status()
                return resp.content

        # WebImage: direct download, no cookies needed
        async with httpx.AsyncClient() as dl:
            resp = await dl.get(url, follow_redirects=True)
            resp.raise_for_status()
            return resp.content
