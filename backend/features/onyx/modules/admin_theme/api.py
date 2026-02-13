from fastapi import APIRouter
from fastapi import Depends
from fastapi import Response
from fastapi import UploadFile

from features.onyx.configs.app_configs import FEATURES_API_PREFIX
from features.onyx.modules.admin_theme.models import ThemeSettings
from features.onyx.modules.admin_theme.store import fetch_theme_logo
from features.onyx.modules.admin_theme.store import load_theme_settings
from features.onyx.modules.admin_theme.store import store_theme_settings
from features.onyx.modules.admin_theme.store import upload_theme_logo
from onyx.auth.users import current_admin_user
from onyx.auth.users import current_user
from onyx.db.models import User

# Admin endpoints (write)
admin_router = APIRouter(
    prefix=f"/{FEATURES_API_PREFIX}/admin/theme-settings",
    tags=["theme-admin"],
)

# Basic endpoints (read)
basic_router = APIRouter(
    prefix=f"/{FEATURES_API_PREFIX}/theme-settings",
    tags=["theme"],
)

# Compat routes at EE paths for consumer compatibility
compat_router = APIRouter(
    prefix="/enterprise-settings",
    tags=["theme-compat"],
)


# --- Admin (write) endpoints ---


@admin_router.put("")
def put_theme_settings(
    settings: ThemeSettings,
    _: User = Depends(current_admin_user),
) -> None:
    store_theme_settings(settings)


@admin_router.put("/logo")
def put_theme_logo(
    file: UploadFile,
    _: User = Depends(current_admin_user),
) -> None:
    upload_theme_logo(file)


# --- Basic (read) endpoints ---


@basic_router.get("")
def get_theme_settings(
    _: User = Depends(current_user),
) -> ThemeSettings:
    return load_theme_settings()


@basic_router.get("/logo")
def get_theme_logo(
    _: User = Depends(current_user),
) -> Response:
    return fetch_theme_logo()


# --- Compat routes (serve at EE paths) ---


@compat_router.get("")
def compat_get_settings(
    _: User = Depends(current_user),
) -> ThemeSettings:
    return load_theme_settings()


@compat_router.get("/logo")
def compat_get_logo(
    _: User = Depends(current_user),
) -> Response:
    return fetch_theme_logo()
