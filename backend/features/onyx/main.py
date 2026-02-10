from fastapi import FastAPI

from features.onyx.configs.app_configs import FEATURES_API_PREFIX
from features.onyx.server.health.api import router as features_health_router
from onyx.main import get_application as get_application_base
from onyx.main import include_router_with_global_prefix_prepended
from onyx.main import use_route_function_names_as_operation_ids
from onyx.server.auth_check import check_router_auth
from onyx.utils.logger import setup_logger

logger = setup_logger()


def get_application() -> FastAPI:
    """Wraps the base Onyx application and adds custom feature routers."""
    application = get_application_base()

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
