import '../styles/globals.css';
import { ThemeProvider } from '../hooks/useTheme';
import { AuthProvider } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import StoreInit from '../components/StoreInit';

export const metadata = {
  title: 'WanderLog – Travel Journals',
  description: 'A community of travellers sharing real journals from around the world.',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#1a1a1a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,300;1,8..60,400;1,8..60,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        {/* Prevent theme flash */}
        <script dangerouslySetInnerHTML={{__html:`
          (function(){
            var t=localStorage.getItem('wl_theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
            document.documentElement.setAttribute('data-theme',t);
          })();
        `}} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <StoreInit />
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
