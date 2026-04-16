import { AntdRegistry } from "@ant-design/nextjs-registry";
import "antd/dist/reset.css";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: process.env.APP_TITLE || "카운터",
    description: "Customizable milestone counter",
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
