"""Auto-discovery and registration for feature modules.

Scans all subpackages in features.onyx.modules/ and calls their
register() function if defined. Failed registrations are logged
but do not crash the application.
"""

import importlib
import pkgutil

from onyx.utils.logger import setup_logger

logger = setup_logger()


def register_all() -> None:
    """Auto-discover and register all feature modules."""
    import features.onyx.modules as modules_pkg

    for _importer, modname, ispkg in pkgutil.iter_modules(modules_pkg.__path__):
        if not ispkg:
            continue
        try:
            mod = importlib.import_module(f"features.onyx.modules.{modname}")
            if hasattr(mod, "register"):
                mod.register()
                logger.info(f"Registered feature module: {modname}")
        except Exception:
            logger.exception(f"Failed to register module: {modname}")
