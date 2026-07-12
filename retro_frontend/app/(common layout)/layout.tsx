export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <br />
      Common Layout
      {children}
    </>
  );
}
