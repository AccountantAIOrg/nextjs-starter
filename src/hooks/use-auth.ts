import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AuthSession } from "@krutai/auth";

import { trpc } from "@/lib/trpc";

export function useAuth() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const { data, isLoading: isSessionLoading } = trpc.auth.session.useQuery(undefined, {
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
    isLoading: isSessionLoading,
    signIn: signInMutation.mutate,
    isSigningIn: signInMutation.isPending,
    signUp: signUpMutation.mutate,
    isSigningUp: signUpMutation.isPending,
    signOut: signOutMutation.mutate,
    isSigningOut: signOutMutation.isPending,
  };
}
