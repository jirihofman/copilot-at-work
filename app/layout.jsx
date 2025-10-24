import "./globals.css";

export const metadata = {
  title: "Copilot at Work - PR Tracker",
  description: "Track merged Copilot PRs over time",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
