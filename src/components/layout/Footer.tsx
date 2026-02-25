import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-8 px-6 md:px-12 border-t border-[var(--green-08)]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div className="font-heading font-extrabold text-xl text-green">
          NutriCoach<span className="text-text"> AI</span>
        </div>
        <div className="flex flex-wrap gap-6 justify-center md:justify-end text-[0.88rem]">
          <Link
            href="/signup?coach=1"
            className="text-text-dim hover:text-green transition-colors no-underline"
          >
            For Coaches
          </Link>
          <Link
            href="/login"
            className="text-text-dim hover:text-green transition-colors no-underline"
          >
            Log in
          </Link>
          <Link
            href="/invite/accept"
            className="text-text-dim hover:text-green transition-colors no-underline"
          >
            Accept invite
          </Link>
        </div>
      </div>
      <p className="text-text-dim text-[0.82rem] mt-4 text-center md:text-left">
        © 2026 NutriCoach AI · Supplement-agnostic · Works with any brand
      </p>
    </footer>
  );
}
