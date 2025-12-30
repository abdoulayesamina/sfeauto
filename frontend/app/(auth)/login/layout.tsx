import "../../../app/globals.css";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen max-h-screen w-full">
        <div className="w-full flex min-h-full max-h-full items-center justify-center dark:bg-black ">
          {children}
        </div>
      </body>
    </html>
  );
}