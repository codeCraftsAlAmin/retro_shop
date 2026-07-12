export default function CustomerDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <br />
      Customer Dashboard Layout
      {children}
    </>
  );
}
