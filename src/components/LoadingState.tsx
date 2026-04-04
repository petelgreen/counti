"use client";

import Loader from "@/components/ui/loader";

export default function LoadingState({ message = "מנתח את הארוחה" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-5">
      <Loader size={40} />
      <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
        {message}
      </p>
    </div>
  );
}
