"use client";

import { useState, useCallback, type ChangeEvent } from "react";

/** Shape of a single browser cookie export entry */
interface BrowserCookieEntry {
  name: string;
  value: string;
  domain?: string;
  [key: string]: unknown;
}

/** Cookie names we need to extract from the JSON */
const TARGET_COOKIES = {
  __Secure_1PSID: "__Secure-1PSID",
  __Secure_1PSIDTS: "__Secure-1PSIDTS",
} as const;

interface CookieJsonParserProps {
  /** Callback when cookies are successfully extracted */
  onCookiesExtracted: (cookies: {
    secure_1psid: string;
    secure_1psidts: string;
  }) => void;
  disabled?: boolean;
}

/**
 * Textarea that accepts pasted JSON cookie array (e.g. from browser
 * extension "EditThisCookie" or DevTools export) and auto-extracts
 * __Secure-1PSID and __Secure-1PSIDTS values.
 */
export function CookieJsonParser({
  onCookiesExtracted,
  disabled = false,
}: CookieJsonParserProps) {
  const [rawJson, setRawJson] = useState("");
  const [parseStatus, setParseStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [parseMessage, setParseMessage] = useState("");

  const parseCookieJson = useCallback(
    (jsonStr: string) => {
      if (!jsonStr.trim()) {
        setParseStatus("idle");
        setParseMessage("");
        return;
      }

      try {
        const parsed = JSON.parse(jsonStr);

        // Support both array of cookies and single cookie object
        const cookies: BrowserCookieEntry[] = Array.isArray(parsed)
          ? parsed
          : [parsed];

        // Find target cookies by name
        let secure1psid = "";
        let secure1psidts = "";

        for (const cookie of cookies) {
          if (!cookie.name || !cookie.value) continue;

          if (cookie.name === TARGET_COOKIES.__Secure_1PSID) {
            secure1psid = cookie.value;
          } else if (cookie.name === TARGET_COOKIES.__Secure_1PSIDTS) {
            secure1psidts = cookie.value;
          }
        }

        if (!secure1psid && !secure1psidts) {
          setParseStatus("error");
          setParseMessage(
            `No ${TARGET_COOKIES.__Secure_1PSID} or ${TARGET_COOKIES.__Secure_1PSIDTS} found in ${cookies.length} cookies. ` +
              "Make sure you export cookies from gemini.google.com or google.com domain."
          );
          return;
        }

        if (!secure1psid) {
          setParseStatus("error");
          setParseMessage(
            `Found ${TARGET_COOKIES.__Secure_1PSIDTS} but missing ${TARGET_COOKIES.__Secure_1PSID}. Check your cookie export.`
          );
          return;
        }

        if (!secure1psidts) {
          setParseStatus("error");
          setParseMessage(
            `Found ${TARGET_COOKIES.__Secure_1PSID} but missing ${TARGET_COOKIES.__Secure_1PSIDTS}. Check your cookie export.`
          );
          return;
        }

        // Both found — notify parent and show success
        onCookiesExtracted({
          secure_1psid: secure1psid,
          secure_1psidts: secure1psidts,
        });

        setParseStatus("success");
        setParseMessage(
          `Extracted both cookies from ${cookies.length} entries. Fields auto-filled below.`
        );
      } catch {
        setParseStatus("error");
        setParseMessage(
          "Invalid JSON. Paste the full cookie array exported from your browser extension."
        );
      }
    },
    [onCookiesExtracted]
  );

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRawJson(value);
    parseCookieJson(value);
  };

  const statusColor =
    parseStatus === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : parseStatus === "error"
        ? "text-red-600 dark:text-red-400"
        : "text-text-subtle";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-text-strong">
        Quick Import: Paste Cookie JSON
      </label>
      <textarea
        value={rawJson}
        onChange={handleChange}
        disabled={disabled}
        placeholder={`Paste your browser cookie JSON array here...\n\nExample: [{"name":"__Secure-1PSID","value":"..."},{"name":"__Secure-1PSIDTS","value":"..."}]`}
        rows={4}
        className={[
          "w-full rounded-md border px-3 py-2 text-xs font-mono",
          "bg-background placeholder:text-text-subtle",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          "resize-y min-h-[80px] max-h-[200px]",
          disabled ? "opacity-50 cursor-not-allowed" : "",
          parseStatus === "error" ? "border-red-500" : "border-border",
          parseStatus === "success" ? "border-emerald-500" : "",
        ].join(" ")}
      />
      {parseMessage && (
        <p className={`text-xs ${statusColor}`}>{parseMessage}</p>
      )}
      {parseStatus === "idle" && (
        <p className="text-xs text-text-subtle">
          Export cookies from gemini.google.com using a browser extension (e.g.
          &quot;EditThisCookie&quot; or &quot;Cookie-Editor&quot;), then paste the JSON here.
        </p>
      )}
    </div>
  );
}
