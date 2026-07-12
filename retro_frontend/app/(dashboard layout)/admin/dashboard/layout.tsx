export default function AdmonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <br />
      Admin Layout
      {children}
    </>
  );
}
