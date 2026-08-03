CREATE TYPE "AuthOtpRequestPurpose" AS ENUM ('REGISTRATION', 'PASSWORD_RESET');

CREATE TABLE "auth_otp_request" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "purpose" "AuthOtpRequestPurpose" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "auth_otp_request_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "auth_otp_request_identifier_purpose_createdAt_idx" ON "auth_otp_request"("identifier", "purpose", "createdAt");
