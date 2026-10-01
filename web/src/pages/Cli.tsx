import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth, SignIn } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function CliAuth() {
  const [searchParams] = useSearchParams();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const code = searchParams.get("code");
  const [status, setStatus] = useState<"pending" | "approving" | "success" | "denied" | "error">("pending");
  const [errorMsg, setErrorMsg] = useState("");

  const handleApprove = async () => {
    if (!code) return;
    setStatus("approving");
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/v1/cli/auth/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userCode: code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `HTTP ${res.status}`);
      }
      setStatus("success");
    } catch (e: any) {
      setErrorMsg(e.message || "An error occurred");
      setStatus("error");
    }
  };

  const handleDeny = async () => {
    if (!code) return;
    try {
      const token = await getToken();
      await fetch(`${API_URL}/v1/cli/auth/deny`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userCode: code }),
      });
      setStatus("denied");
    } catch {
      setStatus("denied");
    }
  };

  // ── Loading ──
  if (!isLoaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#000" }}>
        <div style={{ width: 32, height: 32, border: "4px solid #A259FF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  // ── Not signed in → inline Clerk login ──
  if (!isSignedIn) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#000", padding: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Authorize CLI</h1>
          <p style={{ color: "#999", fontSize: 14 }}>
            Sign in to approve the CLI connection{code ? ` for code ${code}` : ""}.
          </p>
        </div>
        <SignIn
          routing="hash"
          fallbackRedirectUrl={`/cli${code ? `?code=${code}` : ""}`}
        />
      </div>
    );
  }

  // ── No code ──
  if (!code) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#000", gap: 16 }}>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>No code provided</h2>
        <p style={{ color: "#999" }}>Open this page from your CLI.</p>
      </div>
    );
  }

  // ── Success ──
  if (status === "success") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#000", gap: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(162,89,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 32 }}>✓</span>
        </div>
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>CLI Authorized</h2>
        <p style={{ color: "#999", maxWidth: 360, textAlign: "center" }}>
          You can return to your terminal. The CLI is now authenticated.
        </p>
      </div>
    );
  }

  // ── Denied ──
  if (status === "denied") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#000", gap: 24 }}>
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>Request Denied</h2>
        <p style={{ color: "#999" }}>You can close this window.</p>
      </div>
    );
  }

  // ── Error ──
  if (status === "error") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#000", gap: 24 }}>
        <h2 style={{ color: "#ff4444", fontSize: 20, fontWeight: 700 }}>Error</h2>
        <p style={{ color: "#999" }}>{errorMsg}</p>
        <button onClick={() => setStatus("pending")} style={{ padding: "8px 16px", background: "#333", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
  }

  // ── Pending: show code + approve/deny ──
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#000", gap: 32 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(162,89,255,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 24 }}>⌨</span>
        </div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Connect SkillManager CLI</h1>
        <p style={{ color: "#999", maxWidth: 400 }}>
          Verify that the code below matches the one displayed in your terminal.
        </p>
      </div>

      <div style={{ padding: 32, border: "1px solid #333", background: "#111", borderRadius: 16 }}>
        <div style={{ fontSize: 48, fontFamily: "monospace", fontWeight: 700, color: "#fff", letterSpacing: "0.1em", textAlign: "center" }}>
          {code}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, width: "100%", maxWidth: 400 }}>
        <button
          onClick={handleDeny}
          disabled={status === "approving"}
          style={{ flex: 1, padding: "12px 16px", background: "#222", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 500, cursor: "pointer", opacity: status === "approving" ? 0.5 : 1 }}
        >
          Refuser
        </button>
        <button
          onClick={handleApprove}
          disabled={status === "approving"}
          style={{ flex: 1, padding: "12px 16px", background: "#A259FF", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 500, cursor: "pointer", opacity: status === "approving" ? 0.5 : 1 }}
        >
          {status === "approving" ? "Approval..." : "Autoriser"}
        </button>
      </div>
    </div>
  );
}
