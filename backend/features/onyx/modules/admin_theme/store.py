from typing import cast

from fastapi import HTTPException
from fastapi import Response
from fastapi import UploadFile

from features.onyx.modules.admin_theme.models import ThemeSettings
from onyx.configs.constants import FileOrigin
from onyx.file_store.file_store import get_default_file_store
from onyx.key_value_store.factory import get_kv_store
from onyx.key_value_store.interface import KvKeyNotFoundError
from onyx.utils.logger import setup_logger

logger = setup_logger()

KV_CUSTOM_THEME_SETTINGS_KEY = "custom_theme_settings"
_LOGO_FILENAME = "__logo__"
_MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024  # 2 MB
_ALLOWED_MIME_TYPES = {"image/png", "image/jpeg", "image/jpg"}


def load_theme_settings() -> ThemeSettings:
    """Load theme settings from KV store, returning defaults if not found."""
    kv = get_kv_store()
    try:
        data = cast(dict, kv.load(KV_CUSTOM_THEME_SETTINGS_KEY))
        return ThemeSettings(**data)
    except KvKeyNotFoundError:
        return ThemeSettings()


def store_theme_settings(settings: ThemeSettings) -> None:
    """Persist theme settings to KV store."""
    get_kv_store().store(KV_CUSTOM_THEME_SETTINGS_KEY, settings.model_dump())


def _is_valid_image(filename: str) -> bool:
    return filename.lower().endswith((".png", ".jpg", ".jpeg"))


def upload_theme_logo(file: UploadFile) -> None:
    """Upload a logo image file. Only png/jpg/jpeg allowed, max 2 MB."""
    if not file.filename or not _is_valid_image(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type — only .png, .jpg, .jpeg allowed",
        )

    if file.content_type and file.content_type not in _ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid content type — only image/png, image/jpeg allowed",
        )

    content = file.file.read()
    if len(content) > _MAX_LOGO_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 2 MB)")
    file.file.seek(0)

    file_store = get_default_file_store()
    file_store.save_file(
        content=file.file,
        display_name=file.filename,
        file_origin=FileOrigin.OTHER,
        file_type=file.content_type or "image/jpeg",
        file_id=_LOGO_FILENAME,
    )
    logger.info("Theme logo uploaded successfully")


def fetch_theme_logo() -> Response:
    """Read logo from file store and return as HTTP Response."""
    try:
        file_store = get_default_file_store()
        onyx_file = file_store.get_file_with_mime_type(_LOGO_FILENAME)
        if not onyx_file:
            raise ValueError("Logo file not found in store")
    except Exception:
        logger.exception("Failed to fetch theme logo")
        raise HTTPException(status_code=404, detail="No logo file found")
    return Response(content=onyx_file.data, media_type=onyx_file.mime_type)
