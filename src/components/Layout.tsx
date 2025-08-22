import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

//main
// export const Layout: React.FC<LayoutProps> = ({ children }) => {
//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
//       <Header />
//       <main className="container mx-auto px-4 py-8">{children}</main>
//       <Footer />
//     </div>
//   );
// };

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
};
