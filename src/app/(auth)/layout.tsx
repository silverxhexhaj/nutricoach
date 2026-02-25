export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-6">
      <a href="/" className="font-heading font-extrabold text-xl text-green mb-8">
        NutriCoach <span className="text-text">AI</span>
      </a>
      {children}
    </div>
  );
}
