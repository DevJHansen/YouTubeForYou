"use client";

import { useEffect, useState } from "react";
import { AuthShell } from "../AuthShell";

type Status = "sending" | "done" | "no-extension" | "error";

declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (
          extensionId: string,
          message: unknown,
          callback?: (response: unknown) => void,
        ) => void;
        lastError?: { message: string };
      };
    };
  }
}

export function ExtensionBridge({
  email,
  plan,
  accessToken,
  refreshToken,
  expiresAt,
  userId,
}: {
  email: string;
  plan: "free" | "pro";
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}) {
  const [status, setStatus] = useState<Status>("sending");

  useEffect(() => {
    const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID;
    if (!extensionId) {
      setStatus("no-extension");
      return;
    }
    const chrome = window.chrome;
    if (!chrome?.runtime?.sendMessage) {
      setStatus("no-extension");
      return;
    }
    chrome.runtime.sendMessage(
      extensionId,
      {
        type: "foryou:auth",
        email,
        plan,
        accessToken,
        refreshToken,
        expiresAt,
        userId,
      },
      () => {
        if (chrome.runtime?.lastError) {
          setStatus("error");
          return;
        }
        setStatus("done");
      },
    );
  }, [email, plan, accessToken, refreshToken, expiresAt, userId]);

  return (
    <AuthShell title="Linking extension" subtitle={email}>
      {status === "sending" && <div className="auth-note">Sending session to the extension…</div>}
      {status === "done" && (
        <div className="auth-note auth-note--ok">
          Linked. You can close this tab and return to YouTube.
        </div>
      )}
      {status === "no-extension" && (
        <div className="auth-note">
          Extension not detected. Install YouTube ForYou first, then return to this page.
        </div>
      )}
      {status === "error" && (
        <div className="auth-error">Couldn’t reach the extension. Try reopening the popup.</div>
      )}
      <div className="auth-meta">
        <div><span>Plan</span><strong>{plan.toUpperCase()}</strong></div>
      </div>
    </AuthShell>
  );
}
