import { Suspense } from "react";
import { CatalogClient } from "@/app/_components/CatalogClient";
import { Spinner } from "@/components/ui/spinner";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 justify-center py-24">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <CatalogClient />
    </Suspense>
  );
}
