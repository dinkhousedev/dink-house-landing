import NextLink from "next/link";

import DefaultLayout from "@/layouts/default";

const SUPPORT_EMAIL = "contact@thedinkhousepb.com";

export default function PrivacyPage() {
  return (
    <DefaultLayout title="Privacy Policy - The Dink House">
      <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-3">
          Privacy Policy
        </h1>
        <p className="text-gray-400 mb-10">
          The Dink House member app and thedinkhousepb.com. Last updated
          November 6, 2026.
        </p>

        <div className="space-y-8 text-gray-200 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-dink-lime mb-2">Who we are</h2>
            <p>
              The Dink House is a pickleball club in Bell County, Texas. This
              policy covers the member app and this website. Questions go to{" "}
              <a className="text-dink-lime" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dink-lime mb-2">
              Account information
            </h2>
            <p>
              Creating an account requires a first name, last name, email,
              password, date of birth, and gender. Phone number is optional.
              You must be at least 13. The app is not directed at children
              under 13, and we do not knowingly keep an account for anyone
              younger than that.
            </p>
            <p className="mt-3">
              We use this information to run your membership: schedule, court
              bookings, check-in, and door unlock at the club. Account codes
              are emailed from {SUPPORT_EMAIL} through Brevo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dink-lime mb-2">Payments</h2>
            <p>
              Membership fees and court or session fees are charges for access
              to the physical club. Stripe processes the card. The app does not
              store your card number. We keep the membership status, the
              booking, and the Stripe customer reference needed to cancel or
              renew that charge.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dink-lime mb-2">
              Door unlock
            </h2>
            <p>
              Unlocking the door checks your location once, at the door, so the
              unlock only works at the club. The camera scans a door code when
              you choose that path. NFC reads the door sticker. Face or
              fingerprint confirmation stays on your phone. We store the
              signature from that prompt and a public key for the phone that is
              allowed to unlock. We do not store a face or fingerprint
              template, and we do not share your location with other members.
            </p>
            <p className="mt-3">
              Camera images used for a scan are not saved as photos in your
              account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dink-lime mb-2">
              Who else sees it
            </h2>
            <p>
              Club staff can see the member profile, bookings, and unlock
              activity needed to run the facility. Stripe sees the payment.
              Brevo sends the account email. We do not sell personal
              information, and we do not use it for advertising. The app does
              not show ads.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dink-lime mb-2">
              Deleting your account
            </h2>
            <p>
              In the app, open Account, choose Delete account, and type your
              email. That signs the phone out and cancels a paid membership at
              the end of the current period. You can also email{" "}
              <a className="text-dink-lime" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>{" "}
              if you cannot sign in. The steps are written out on the{" "}
              <NextLink className="text-dink-lime" href="/account-deletion">
                account deletion
              </NextLink>{" "}
              page.
            </p>
          </section>
        </div>
      </section>
    </DefaultLayout>
  );
}
