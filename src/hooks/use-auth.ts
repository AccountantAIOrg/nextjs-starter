import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AuthSession } from "@krutai/auth";

import { trpc } from "@/lib/trpc";

export function useAuth() {
  const utils = trpc.useUtils();
  const router = useRouter();
  const [sessionQueryEnabled, setSessionQueryEnabled] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setSessionQueryEnabled(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/session");
      if (!res.ok) {
        return null; // Return null when there is no active session
      }
      const data = await res.json();
      return data.session;
    },
    enabled: sessionQueryEnabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const session = data as AuthSession | null | undefined;

  const signInMutation = trpc.auth.signIn.useMutation({
    onSuccess: () => {
      toast.success("Signed in successfully");
      utils.auth.session.invalidate();
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const signUpMutation = trpc.auth.signUp.useMutation({
    onSuccess: () => {
      toast.success("Account created successfully");
      utils.auth.session.invalidate();
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const signOutMutation = trpc.auth.signOut.useMutation({
    onSuccess: () => {
      toast.success("Signed out successfully");
      utils.auth.session.invalidate();
      router.push("/sign-in");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    session,
    isLoading: sessionQueryEnabled && isSessionLoading,
    signIn: signInMutation.mutate,
    isSigningIn: signInMutation.isPending,
    signUp: signUpMutation.mutate,
    isSigningUp: signUpMutation.isPending,
    signOut: signOutMutation.mutate,
    isSigningOut: signOutMutation.isPending,
  };
}
