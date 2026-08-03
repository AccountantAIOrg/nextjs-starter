CREATE TYPE "OtpRequestPurpose" AS ENUM ('REGISTRATION', 'PASSWORD_RESET');

CREATE TABLE "otp_request" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "purpose" "OtpRequestPurpose" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "otp_request_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "otp_request_email_purpose_createdAt_idx" ON "otp_request"("email", "purpose", "createdAt");
