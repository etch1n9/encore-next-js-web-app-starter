import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import styles from "@/app/page.module.css";
import { cookies } from "next/headers";
import LogoutForm from "@/app/components/LogoutForm";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Encore + Next.js",
};

// Novus by Pendo install snippet, followed by the single, anonymous
// pendo.initialize call for this page lifecycle. The signed-in visitor is
// registered later with pendo.identify, never with a second initialize.
const pendoSnippet = `
(function(apiKey){
    (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
    v=['initialize','identify','updateOptions','pageLoad','track', 'trackAgent'];for(w=0,x=v.length;w<x;++w)(function(m){
    o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
    y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
    z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
})('1a9d8030-c6fb-4e96-bb01-461c6c54ea0e');
pendo.initialize({ visitor: { id: '' } });
`;

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/users", label: "User List" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoggedIn = cookies().has("auth-token");

  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: pendoSnippet }} />
        <script src="https://encore.dev/encore-toolbar.js"></script>
      </head>
      <body className={inter.className}>
        <header>
          <nav className={styles.nav}>
            <div className={styles.navLinks}>
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </div>

            {isLoggedIn ? (
              <LogoutForm />
            ) : (
              <form action="/auth/login" method="post">
                <input type="text" placeholder="Email" name="email" />
                <input type="password" placeholder="Password" name="password" />
                <button type="submit">Login</button>
              </form>
            )}
          </nav>
        </header>

        <main className={styles.main}>{children}</main>
      </body>
    </html>
  );
}
