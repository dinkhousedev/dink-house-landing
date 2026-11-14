import NextLink from "next/link";

import DefaultLayout from "@/layouts/default";

const SUPPORT_EMAIL = "contact@thedinkhousepb.com";

export default function AccountDeletionPage() {
  return (
    <DefaultLayout title="Delete your account - The Dink House">
      <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-3">
          Delete your account
        </h1>
        <p className="text-gray-400 mb-10">
          The Dink House member app. This cannot be undone.
        </p>

        <div className="space-y-8 text-gray-200 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-dink-lime mb-2">In the app</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Sign in with the email and password on the account.</li>
              <li>Open Account.</li>
              <li>Choose Delete account.</li>
              <li>Type the account email, then choose Delete my account.</li>
            </ol>
            <p className="mt-3">
              Deleting the account signs that phone out. A paid membership is
              canceled at the end of the period already paid for.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dink-lime mb-2">
              If you cannot sign in
            </h2>
            <p>
              Email{" "}
              <a className="text-dink-lime" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>{" "}
              from the address on the account and ask us to delete it. Include
              the name on the membership so we can match the record.
            </p>
          </section>

          <section>
            <p>
              What the app stores, and what deletion removes, is described in
              the{" "}
              <NextLink className="text-dink-lime" href="/privacy">
                privacy policy
              </NextLink>
              .
            </p>
          </section>
        </div>
      </section>
    </DefaultLayout>
  );
}
