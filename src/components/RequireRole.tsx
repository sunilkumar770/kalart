import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api, DEMO_ACCOUNTS, type Role } from "../data/store";
import { IconShield, IconUser, IconArrowRight } from "./icons";

export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { user, setUser, toast } = useApp();
  const location = useLocation();

  const metaEnv = ((import.meta as any).env) || {};
  const isDevOrTest =
    Boolean(metaEnv.DEV) ||
    metaEnv.MODE === "test" ||
    (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo"));

  if (!user) {
    const demo = DEMO_ACCOUNTS.find((a) => a.role === role);

    const handleQuickSignIn = async () => {
      if (!demo) return;
      try {
        const u = await api.login(demo.email, demo.password);
        setUser(u);
        toast("success", `Signed in as ${u.name} (${u.role})`);
      } catch {
        toast("error", "Unable to sign in");
      }
    };

    return (
      <main id="main" className="container section--tight">
        <div className="ka-auth" style={{ maxWidth: 520, margin: "40px auto" }}>
          <div className="card card--pad" style={{ textAlign: "center" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "var(--ka-clay-soft)",
                color: "var(--ka-clay)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 16px",
              }}
            >
              <IconShield size={24} />
            </div>
            <h1 style={{ fontSize: "1.35rem", margin: "0 0 8px" }}>
              {role === "admin" ? "Platform Console Access" : "Artisan Workspace Access"}
            </h1>
            <p className="text-small text-muted" style={{ marginBottom: 20 }}>
              This section is restricted to {role === "admin" ? "platform administrators" : "verified artisan partners"}.
              Please sign in with authorized credentials.
            </p>

            {demo && isDevOrTest && (
              <div
                className="card card--pad"
                style={{
                  background: "var(--ka-stone)",
                  borderColor: "var(--ka-line-strong)",
                  marginBottom: 20,
                  textAlign: "left",
                }}
              >
                <strong style={{ fontSize: "0.88rem", display: "block", marginBottom: 4 }}>
                  Demo credentials available
                </strong>
                <p className="text-small text-muted" style={{ margin: "0 0 10px" }}>
                  Sign in as <strong>{demo.name}</strong> ({demo.email})
                </p>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm btn--block"
                  onClick={handleQuickSignIn}
                >
                  <IconUser size={15} /> Continue as {demo.name}
                </button>
              </div>
            )}

            <Link
              to={`/login?next=${encodeURIComponent(location.pathname)}`}
              className="btn btn--outline btn--block"
            >
              Sign in with password <IconArrowRight size={15} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (user.role !== role) {
    return (
      <main id="main" className="container section--tight">
        <div className="ka-auth" style={{ maxWidth: 520, margin: "40px auto" }}>
          <div className="card card--pad" style={{ textAlign: "center" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "var(--ka-warning-soft)",
                color: "var(--ka-warning)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 16px",
              }}
            >
              <IconShield size={24} />
            </div>
            <h1 style={{ fontSize: "1.35rem", margin: "0 0 8px" }}>Access Restricted</h1>
            <p className="text-small text-muted" style={{ marginBottom: 16 }}>
              You are signed in as <strong>{user.name}</strong> with role <strong>{user.role}</strong>.
              This area requires <strong>{role}</strong> privileges.
            </p>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => {
                api.logout();
                setUser(null);
              }}
            >
              Sign out &amp; switch account
            </button>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
