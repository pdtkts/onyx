from fastapi import APIRouter
from fastapi import Depends

from features.onyx.configs.app_configs import FEATURES_API_PREFIX
from onyx.auth.users import current_user
from onyx.db.models import User

router = APIRouter(prefix=f"/{FEATURES_API_PREFIX}/health", tags=["features"])


@router.get("")
def features_health_check(
    _current_user: User = Depends(current_user),
) -> dict:
    """Health check for the features layer. Requires authentication."""
    return {"status": "ok", "layer": "features"}
