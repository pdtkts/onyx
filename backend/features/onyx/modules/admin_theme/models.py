from enum import Enum

from pydantic import BaseModel
from pydantic import Field


class LogoDisplayStyle(str, Enum):
    LOGO_AND_NAME = "logo_and_name"
    LOGO_ONLY = "logo_only"
    NAME_ONLY = "name_only"


class ThemeSettings(BaseModel):
    """Theme settings with full EnterpriseSettings field parity.

    Stored in KV under 'custom_theme_settings'. Injected into the
    enterpriseSettings slot when EE is not active.
    """

    application_name: str | None = None
    use_custom_logo: bool = False
    use_custom_logotype: bool = False
    logo_display_style: LogoDisplayStyle | None = None

    # Custom navigation
    custom_nav_items: list[dict] = Field(default_factory=list)

    # Chat components
    two_lines_for_chat_header: bool | None = None
    custom_lower_disclaimer_content: str | None = None
    custom_header_content: str | None = None
    custom_popup_header: str | None = None
    custom_popup_content: str | None = None
    enable_consent_screen: bool | None = None
    consent_screen_prompt: str | None = None
    show_first_visit_notice: bool | None = None
    custom_greeting_message: str | None = None
