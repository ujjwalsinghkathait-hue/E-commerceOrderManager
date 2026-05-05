import { Suspense } from "react";
import { RegisterForm } from "@/app/register/RegisterForm";
import { Spinner } from "@/components/ui/spinner";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 justify-center py-24">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
