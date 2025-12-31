import "@/src/app/globals.css";

export default function AutLayout({children}: React.ReactNode){
    return (
        <html>
            <body>
                {children}
            </body>
        </html>
    )
}