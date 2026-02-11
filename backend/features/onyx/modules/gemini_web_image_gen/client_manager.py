"""Singleton client manager for gemini_webapi.

Manages a long-lived GeminiClient with auto_refresh=True.
Supports reinit when admin updates cookies via UI.
Runs a dedicated asyncio event loop in a background thread
so sync callers can schedule coroutines via run_coroutine_threadsafe.
"""

from __future__ import annotations

import asyncio
import threading
from typing import Any
from typing import Coroutine
from typing import TYPE_CHECKING
from typing import TypeVar

from onyx.utils.logger import setup_logger

if TYPE_CHECKING:
    from gemini_webapi import GeminiClient

logger = setup_logger()

T = TypeVar("T")

# Module-level lock for thread-safe singleton + init operations
_lock = threading.Lock()


class GeminiWebClientManager:
    """Thread-safe singleton managing a GeminiClient instance."""

    _instance: GeminiWebClientManager | None = None

    def __init__(self) -> None:
        self._client: GeminiClient | None = None
        self._loop: asyncio.AbstractEventLoop | None = None
        self._thread: threading.Thread | None = None
        self._psid: str = ""
        self._psidts: str = ""

    @classmethod
    def get_instance(cls) -> GeminiWebClientManager:
        """Get or create the singleton instance."""
        if cls._instance is None:
            with _lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    @property
    def loop(self) -> asyncio.AbstractEventLoop:
        """Return the dedicated event loop, starting it if needed.

        Thread-safe: uses _lock to prevent duplicate loop creation.
        """
        with _lock:
            if self._loop is None or not self._loop.is_running():
                self._start_event_loop()
            assert self._loop is not None
            return self._loop

    @property
    def client(self) -> GeminiClient | None:
        return self._client

    def _start_event_loop(self) -> None:
        """Start a background thread running an asyncio event loop.

        Caller MUST hold _lock before calling this method.
        """
        self._loop = asyncio.new_event_loop()

        def _run_loop(loop: asyncio.AbstractEventLoop) -> None:
            asyncio.set_event_loop(loop)
            loop.run_forever()

        self._thread = threading.Thread(
            target=_run_loop,
            args=(self._loop,),
            daemon=True,
            name="gemini-web-event-loop",
        )
        self._thread.start()

    def init_client(self, psid: str, psidts: str) -> None:
        """Initialize or reinitialize the client with new cookies.

        Thread-safe: uses _lock to prevent concurrent init.
        If cookies haven't changed and client is alive, skip reinit.
        """
        with _lock:
            if (
                self._client is not None
                and self._psid == psid
                and self._psidts == psidts
            ):
                return

            self._close_existing_client_unlocked()
            self._psid = psid
            self._psidts = psidts

        # Run async init outside lock to avoid deadlock with loop property
        loop = self.loop
        future = asyncio.run_coroutine_threadsafe(
            self._async_init_client(psid, psidts),
            loop,
        )
        # Timeout matches client.init(timeout=120) with headroom
        future.result(timeout=150)
        logger.info("GeminiClient initialized successfully")

    async def _async_init_client(self, psid: str, psidts: str) -> None:
        """Async client initialization with auto_refresh enabled."""
        from gemini_webapi import GeminiClient

        client = GeminiClient(psid, psidts)
        await client.init(
            timeout=120,
            auto_close=False,
            auto_refresh=True,
            refresh_interval=540,
            verbose=False,
        )
        self._client = client

    def _close_existing_client_unlocked(self) -> None:
        """Close the existing client if any. Caller MUST hold _lock."""
        if self._client is not None:
            try:
                loop = self._loop
                if loop is not None and loop.is_running():
                    future = asyncio.run_coroutine_threadsafe(
                        self._client.close(),
                        loop,
                    )
                    future.result(timeout=10)
            except Exception:
                logger.warning("Failed to close existing GeminiClient")
            finally:
                self._client = None

    def close(self) -> None:
        """Shut down client and event loop."""
        with _lock:
            self._close_existing_client_unlocked()
            if self._loop is not None and self._loop.is_running():
                self._loop.call_soon_threadsafe(self._loop.stop)
            self._thread = None
            self._loop = None

    def run_coroutine(self, coro: Coroutine[Any, Any, T]) -> T:
        """Schedule a coroutine on the managed loop and block for result.

        Args:
            coro: An awaitable coroutine object.

        Returns:
            The result of the coroutine.
        """
        future = asyncio.run_coroutine_threadsafe(coro, self.loop)
        return future.result(timeout=120)
