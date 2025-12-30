import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuDemo } from "@/shared/components/drop-down-menu";
import "../../app/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen max-h-screen">
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full min-h-full max-h-full flex flex-col">
            <div className="h-25 w-full flex items-center border-b px-3">
              <SidebarTrigger />
              <div className="flex-1 flex justify-between px-4">

                <span className="lg:ml-8 ml-0 flex items-center relative w-[40%]  min-w-[200px]">
                  <Search className="absolute size-5 pl-2 "/>
                  <Input className="min-w-[200px] pl-7 " placeholder="Rechercher ..."/>
                </span>

                <div className=" flex items-center gap-2 text-lg mr-0 lg:mr-6 ">
                  <div className="hidden lg:flex flex-col items-end mr-4">
                    <Badge variant="default">Admin</Badge>
                    <span className="text-xs text-gray-500">Nom-prenom</span>
                  </div>
                  <Avatar className="hidden lg:block w-10 h-10">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <DropdownMenuDemo />
                </div>
                
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
