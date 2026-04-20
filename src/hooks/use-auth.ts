import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

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
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const signInMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Sign in failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Signed in successfully");
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Sign up failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Sign out failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Signed out successfully");
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/sign-in");
    },
  });

  return {
    session,
    isLoading: isSessionLoading,
    signIn: signInMutation.mutate,
    isSigningIn: signInMutation.isPending,
    signUp: signUpMutation.mutate,
    isSigningUp: signUpMutation.isPending,
    signOut: signOutMutation.mutate,
    isSigningOut: signOutMutation.isPending,
  };
}
