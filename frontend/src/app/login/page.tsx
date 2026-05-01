import { Suspense } from "react";
import { LoginForm } from "@/app/login/LoginForm";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 justify-center py-24">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
