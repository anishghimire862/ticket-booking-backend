import type { MigrationInterface, QueryRunner } from 'typeorm'

export class InitSchema1768506650268 implements MigrationInterface {
  name = 'InitSchema1768506650268'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "events" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "name" text NOT NULL, "startsAt" TIMESTAMP WITH TIME ZONE NOT NULL, "status" text NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "ticket_tiers" ("id" SERIAL NOT NULL, "eventId" integer NOT NULL, "name" text NOT NULL, "priceCents" integer NOT NULL, "displayOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_9e5dce055eb2af9bfbaaf3d5b25" UNIQUE ("eventId", "name"), CONSTRAINT "PK_917cfec124fa5e8ce04d1e7b865" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "ticket_inventory" ("id" SERIAL NOT NULL, "tierId" integer NOT NULL, "totalQuantity" integer NOT NULL, "availableQuantity" integer NOT NULL, "reservedQuantity" integer NOT NULL DEFAULT '0', "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_0fd5eb3553b7b0344337b86123" UNIQUE ("tierId"), CONSTRAINT "CHK_5ee575c9fa964dbc1488b6f171" CHECK ("reservedQuantity" + "availableQuantity" <= "totalQuantity"), CONSTRAINT "CHK_74382637a3a5ed14285a978195" CHECK ("availableQuantity" <= "totalQuantity"), CONSTRAINT "CHK_ceffb933e162835f9f176fb172" CHECK ("availableQuantity" >= 0), CONSTRAINT "PK_fcfb668a8a4b70dceb19f08c37d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "booking_items" ("id" SERIAL NOT NULL, "bookingId" integer NOT NULL, "tierId" integer NOT NULL, "quantity" integer NOT NULL, "lineTotalCents" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_37f85becac4cda06b47bc8a4abe" UNIQUE ("bookingId", "tierId"), CONSTRAINT "PK_53d863efb388346f9bee6ec6701" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "bookings" ("id" SERIAL NOT NULL, "eventId" integer NOT NULL, "userId" integer NOT NULL, "status" text NOT NULL, "cardName" text NOT NULL, "totalAmountCents" integer NOT NULL, "idempotencyKey" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_d1844ed4216c0cbdbeb40c85004" UNIQUE ("idempotencyKey"), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" SERIAL NOT NULL, "bookingId" integer NOT NULL, "paymentMethod" text NOT NULL, "cardName" text NOT NULL, "cardLast4" text NOT NULL, "amountCents" integer NOT NULL, "status" text NOT NULL, "reference" text, "errorMessage" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "ticket_tiers" ADD CONSTRAINT "FK_a9059a9111a2206081a347d3b6e" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "ticket_inventory" ADD CONSTRAINT "FK_0fd5eb3553b7b0344337b86123d" FOREIGN KEY ("tierId") REFERENCES "ticket_tiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "booking_items" ADD CONSTRAINT "FK_13671e33965ca9dca96bd3c733e" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "booking_items" ADD CONSTRAINT "FK_085e1a8e356452278626ce04f5e" FOREIGN KEY ("tierId") REFERENCES "ticket_tiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_f95d476ef16fad91a50544b60c3" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_1ead3dc5d71db0ea822706e389d" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_1ead3dc5d71db0ea822706e389d"`,
    )
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_f95d476ef16fad91a50544b60c3"`,
    )
    await queryRunner.query(
      `ALTER TABLE "booking_items" DROP CONSTRAINT "FK_085e1a8e356452278626ce04f5e"`,
    )
    await queryRunner.query(
      `ALTER TABLE "booking_items" DROP CONSTRAINT "FK_13671e33965ca9dca96bd3c733e"`,
    )
    await queryRunner.query(
      `ALTER TABLE "ticket_inventory" DROP CONSTRAINT "FK_0fd5eb3553b7b0344337b86123d"`,
    )
    await queryRunner.query(
      `ALTER TABLE "ticket_tiers" DROP CONSTRAINT "FK_a9059a9111a2206081a347d3b6e"`,
    )
    await queryRunner.query(`DROP TABLE "payments"`)
    await queryRunner.query(`DROP TABLE "bookings"`)
    await queryRunner.query(`DROP TABLE "booking_items"`)
    await queryRunner.query(`DROP TABLE "ticket_inventory"`)
    await queryRunner.query(`DROP TABLE "ticket_tiers"`)
    await queryRunner.query(`DROP TABLE "events"`)
  }
}
