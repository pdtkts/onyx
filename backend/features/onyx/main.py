from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import FastAPI

from features.onyx.configs.app_configs import FEATURES_API_PREFIX
from features.onyx.server.health.api import router as features_health_router
from onyx.main import get_application as get_application_base
from onyx.main import include_router_with_global_prefix_prepended
from onyx.main import use_route_function_names_as_operation_ids
from onyx.server.auth_check import check_router_auth
from onyx.utils.logger import setup_logger

if TYPE_CHECKING:
    from onyx.image_gen.interfaces import ImageGenerationProvider

logger = setup_logger()


def _patch_image_gen_factory() -> None:
    """Monkey-patch image gen factory to support custom providers.

    Injects a _CUSTOM_PROVIDERS dict and wraps _get_provider_cls()
    so custom providers are resolved before the upstream enum-based lookup.
    Zero upstream file changes required.
    """
    from onyx.image_gen import factory

    # Skip if already patched
    if hasattr(factory, "_CUSTOM_PROVIDERS"):
        return

    factory._CUSTOM_PROVIDERS = {}  # type: ignore[attr-defined]

    original_get = factory._get_provider_cls

    def _patched_get_provider_cls(
        provider: str,
    ) -> type[ImageGenerationProvider]:
        if provider in factory._CUSTOM_PROVIDERS:  # type: ignore[attr-defined]
            return factory._CUSTOM_PROVIDERS[provider]  # type: ignore[attr-defined]
        return original_get(provider)

    factory._get_provider_cls = _patched_get_provider_cls  # type: ignore[attr-defined]


def register_custom_provider(
    name: str,
    provider_cls: type[ImageGenerationProvider],
) -> None:
    """Register a custom image generation provider by name.

    Must be called after _patch_image_gen_factory().
    """
    from onyx.image_gen import factory

    if not hasattr(factory, "_CUSTOM_PROVIDERS"):
        raise RuntimeError(
            "Image gen factory not patched. "
            "Call _patch_image_gen_factory() first."
        )
    factory._CUSTOM_PROVIDERS[name] = provider_cls  # type: ignore[attr-defined]
    logger.info(f"Registered custom image provider: {name}")


def get_application() -> FastAPI:
    """Wraps the base Onyx application and adds custom feature routers."""
    # Patch factory BEFORE base app loads providers
    _patch_image_gen_factory()

    application = get_application_base()

    # Register feature modules (injects providers into patched factory)
    from features.onyx.modules import register_all

    register_all()

    # --- Custom feature routers ---
    include_router_with_global_prefix_prepended(
        application, features_health_router
    )

    # Verify all features routes have auth (safety net)
    check_router_auth(application)

    # Refresh OpenAPI operation IDs after adding custom routers
    use_route_function_names_as_operation_ids(application)

    logger.notice("Features layer loaded successfully")

    return application


app = get_application()
