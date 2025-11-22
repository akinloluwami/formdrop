import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";
import { OTPEmail } from "@/emails/OTPEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: process.env.NODE_ENV === "development" ? "sandbox" : "production",
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // if (process.env.NODE_ENV === "development") {
        //   console.log("=".repeat(50));
        //   console.log(`📧 Email OTP for ${email}`);
        //   console.log(`Type: ${type}`);
        //   console.log(`OTP Code: ${otp}`);
        //   console.log("=".repeat(50));
        // } else {
        try {
          console.log(`Sending OTP email to ${email}`);

          const { error } = await resend.emails.send({
            from: "FormDrop <onboarding@mail.formdrop.co>",
            to: email,
            subject: "Your Verification Code",
            react: OTPEmail({ otp }),
          });

          if (error) {
            throw new Error(`Failed to send email: ${error.message}`);
          }

          console.log(`Sent OTP email to ${email}`);
        } catch (error) {
          console.error("Error sending email:", error);
        }
        // }
      },
      sendVerificationOnSignUp: true,
      otpLength: 6,
      expiresIn: 1500,
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: process.env.POLAR_PRODUCT_ID!,
              slug: "Pro",
            },
          ],
          successUrl: "/success?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
        }),
      ],
    }),
  ],
});
