import { Metadata } from "next";
import { Suspense } from "react";
import CampsClient from "./page-client";

export const metadata: Metadata = {
  title: "Risu Team | Obozy",
};

const Camp = () => {
  return (
    <Suspense fallback={null}>
      <CampsClient />
    </Suspense>
  );
};

export default Camp;
