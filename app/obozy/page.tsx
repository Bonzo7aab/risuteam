import { Metadata } from "next";
import CampsClient from "./page-client";

export const metadata: Metadata = {
  title: "Risu Team | Obozy",
};

const Camp = () => {
  return <CampsClient />;
};

export default Camp;
