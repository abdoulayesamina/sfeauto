import "../../../app/globals.css";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen max-h-screen">
        <div className="flex min-h-full bg-red-100  max-h-full items-center justify-center dark:bg-black ">
          {children}
        </div>
      </body>
    </html>
  );
}