import { Suspense } from "react";

import { SendFlow } from "@/components/send/send-flow";

export default function SendPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-center text-slate-500">Loading transfer form…</div>}>
      <SendFlow />
    </Suspense>
  );
}
