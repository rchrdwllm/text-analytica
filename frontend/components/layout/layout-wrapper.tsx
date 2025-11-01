import { ReactNode } from "react";
import Sidebar from "./sidebar";

const LayoutWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
    </div>
  );
};

export default LayoutWrapper;
