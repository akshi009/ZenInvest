import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <h1 className="text-2xl font-bold">Company not found</h1>
      <p className="mt-3 text-ink-2">
        We couldn&rsquo;t find data for that symbol. Try searching for a
        company by name or ticker (e.g. AAPL, RELIANCE, TCS).
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-accent px-5 py-3 font-semibold text-on-accent"
      >
        Back to Explore
      </Link>
    </div>
  );
}
