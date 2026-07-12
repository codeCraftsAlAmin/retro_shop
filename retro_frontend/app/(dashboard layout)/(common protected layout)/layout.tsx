export default function CommonProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <br />
      Common Protected Layout
      {children}
    </>
  );
}
