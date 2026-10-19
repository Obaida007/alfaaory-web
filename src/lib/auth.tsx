"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { get, send, setUnauthorizedHandler, tokenStore, type User } from "./api";

type AuthContextValue = {
  user: User | undefined;
  /** False until the browser has read the stored token (avoids redirect flashes). */
  ready: boolean;
  isLoggedIn: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const notify = () => listeners.forEach((cb) => cb());

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const token = useSyncExternalStore(subscribe, tokenStore.get, () => null);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);

  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => get<User>("/me").then((r) => r.data),
    enabled: !!token,
    staleTime: 30_000,
  });

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.removeQueries({ queryKey: ["me"] });
      notify();
    });
  }, [queryClient]);

  const login = useCallback(
    async (newToken: string) => {
      tokenStore.set(newToken);
      notify();
      await queryClient.invalidateQueries();
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await send("post", "/auth/logout");
    } catch {
      /* token may already be invalid */
    }
    tokenStore.set(null);
    queryClient.clear();
    notify();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: token ? me.data : undefined,
      ready: hydrated && (!token || !me.isPending),
      isLoggedIn: !!token,
      login,
      logout,
    }),
    [token, me.data, me.isPending, hydrated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Sends guests to /login?next=<current page>. Returns true when the page may render. */
export function useRequireAuth(): boolean {
  const { ready, isLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !isLoggedIn) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, isLoggedIn, router, pathname]);

  return ready && isLoggedIn;
}
