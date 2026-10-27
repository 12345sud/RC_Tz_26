import './globals.css';

export const metadata = {
  title: 'ARCADE - Air Hockey | Robotics Club NITW | Technozion',
  description: 'Official Air Hockey Match Arena & Tournament Leaderboard by Robotics Club NIT Warangal for Technozion',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased arcade-grid min-h-screen flex flex-col text-slate-100 selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
