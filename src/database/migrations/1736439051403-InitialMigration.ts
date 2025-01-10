import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1736439051403 implements MigrationInterface {
  name = 'InitialMigration1736439051403';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_names" text NOT NULL, "last_names" text NOT NULL, "gender" text NOT NULL, "email" text NOT NULL, "password" text NOT NULL, "roles" text array NOT NULL DEFAULT '{user}', "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, "inactivation_category" text, "inactivation_reason" text, "record_status" text NOT NULL DEFAULT 'active', "created_by" uuid, "updated_by" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_names" text NOT NULL, "last_names" text NOT NULL, "gender" text NOT NULL, "origin_country" text NOT NULL, "birth_date" date NOT NULL, "age" integer NOT NULL, "marital_status" text NOT NULL, "number_children" integer NOT NULL DEFAULT '0', "conversion_date" date NOT NULL, "email" text, "phone_number" text, "residence_country" text NOT NULL DEFAULT 'Perú', "residence_department" text NOT NULL DEFAULT 'Lima', "residence_province" text NOT NULL DEFAULT 'Lima', "residence_district" text NOT NULL, "residence_urban_sector" text NOT NULL, "residence_address" text NOT NULL, "reference_address" text NOT NULL, "roles" text array NOT NULL, CONSTRAINT "UQ_2714af51e3f7dd42cf66eeb08d6" UNIQUE ("email"), CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "family_groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "family_group_name" text NOT NULL, "family_group_number" integer NOT NULL, "family_group_code" text, "service_time" text NOT NULL, "country" text NOT NULL DEFAULT 'Perú', "department" text NOT NULL DEFAULT 'Lima', "province" text NOT NULL DEFAULT 'Lima', "district" text NOT NULL, "urban_sector" text NOT NULL, "address" text NOT NULL, "reference_address" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, "inactivation_category" text, "inactivation_reason" text, "record_status" text NOT NULL DEFAULT 'active', "created_by" uuid, "updated_by" uuid, "their_church_id" uuid, "their_pastor_id" uuid, "their_copastor_id" uuid, "their_supervisor_id" uuid, "their_zone_id" uuid, "their_preacher_id" uuid, CONSTRAINT "UQ_c31e7e702f7016146080dc46c89" UNIQUE ("family_group_name"), CONSTRAINT "REL_40c731141bbdab22825ae9e84c" UNIQUE ("their_preacher_id"), CONSTRAINT "PK_9ffa60a1101000f92060115427c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "supervisors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_direct_relation_to_pastor" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, "inactivation_category" text, "inactivation_reason" text, "record_status" text NOT NULL DEFAULT 'active', "member_id" uuid, "created_by" uuid, "updated_by" uuid, "their_church_id" uuid, "their_pastor_id" uuid, "their_copastor_id" uuid, "their_zone_id" uuid, CONSTRAINT "REL_f0af5f7bf9998024e4385bccad" UNIQUE ("member_id"), CONSTRAINT "REL_82f50e993d7a3487f8409c1adc" UNIQUE ("their_zone_id"), CONSTRAINT "PK_7c262062450a70e6f1b9f861232" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "disciples" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, "inactivation_category" text, "inactivation_reason" text, "record_status" text NOT NULL DEFAULT 'active', "member_id" uuid, "created_by" uuid, "updated_by" uuid, "their_church_id" uuid, "their_pastor_id" uuid, "their_copastor_id" uuid, "their_supervisor_id" uuid, "their_zone_id" uuid, "their_preacher_id" uuid, "their_family_group_id" uuid, CONSTRAINT "REL_ad9cd39de977a854616876a9f0" UNIQUE ("member_id"), CONSTRAINT "PK_bc5afc3dc2baf1090427b250f32" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "copastors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, "inactivation_category" text, "inactivation_reason" text, "record_status" text NOT NULL DEFAULT 'active', "member_id" uuid, "created_by" uuid, "updated_by" uuid, "their_pastor_id" uuid, "their_church_id" uuid, CONSTRAINT "REL_06c21b125cf2916d8d806ac00d" UNIQUE ("member_id"), CONSTRAINT "PK_d1ff03a58622ce33cae78c24340" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pastors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, "inactivation_category" text, "inactivation_reason" text, "record_status" text NOT NULL DEFAULT 'active', "member_id" uuid, "created_by" uuid, "updated_by" uuid, "their_church_id" uuid, CONSTRAINT "REL_a650bac23350614c15afc745a8" UNIQUE ("member_id"), CONSTRAINT "PK_1245c667baf256954f38ae8f9a6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "churches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "church_name" text NOT NULL, "abbreviated_church_name" text NOT NULL, "church_code" text, "is_anexe" boolean NOT NULL DEFAULT false, "service_times" text array NOT NULL, "founding_date" date NOT NULL, "email" text NOT NULL, "phone_number" text NOT NULL, "country" text NOT NULL DEFAULT 'Perú', "department" text NOT NULL DEFAULT 'Lima', "province" text NOT NULL DEFAULT 'Lima', "district" text NOT NULL, "urban_sector" text NOT NULL, "address" text NOT NULL, "reference_address" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, "inactivation_category" text, "inactivation_reason" text, "record_status" text NOT NULL DEFAULT 'active', "created_by" uuid, "updated_by" uuid, "their_main_church_id" uuid, CONSTRAINT "UQ_7fa186ba63045ac5fd322f3c19b" UNIQUE ("church_name"), CONSTRAINT "UQ_bb244e4673fc8f753e00b2cfddc" UNIQUE ("abbreviated_church_name"), CONSTRAINT "UQ_4fefe8b1874f347c5f6cd814311" UNIQUE ("church_code"), CONSTRAINT "UQ_784531116c3837f990e44a9c415" UNIQUE ("email"), CONSTRAINT "PK_6048a6f37c897751d61cbb0347a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "zones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "zone_name" text NOT NULL, "country" text NOT NULL DEFAULT 'Perú', "department" text NOT NULL DEFAULT 'Lima', "province" text NOT NULL DEFAULT 'Lima', "district" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, "inactivation_category" text, "inactivation_reason" text, "record_status" text NOT NULL DEFAULT 'active', "created_by" uuid, "updated_by" uuid, "their_pastor_id" uuid, "their_copastor_id" uuid, "their_church_id" uuid, "their_supervisor_id" uuid, CONSTRAINT "REL_ce512dd3c06a4dc89481ab803e" UNIQUE ("their_supervisor_id"), CONSTRAINT "PK_880484a43ca311707b05895bd4a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "preachers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, "inactivation_category" text, "inactivation_reason" text, "record_status" text NOT NULL DEFAULT 'active', "member_id" uuid, "created_by" uuid, "updated_by" uuid, "their_church_id" uuid, "their_pastor_id" uuid, "their_copastor_id" uuid, "their_supervisor_id" uuid, "their_zone_id" uuid, "their_family_group_id" uuid, CONSTRAINT "REL_db43084399c3f0889dd0623639" UNIQUE ("member_id"), CONSTRAINT "REL_14293cf291f6dc60e2f58d21a0" UNIQUE ("their_family_group_id"), CONSTRAINT "PK_b24160685620117a3d997cb5f64" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "external_donors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_names" text NOT NULL, "last_names" text NOT NULL, "age" integer, "birth_date" date, "gender" text NOT NULL, "email" text, "phone_number" text, "origin_country" text, "residence_country" text, "residence_city" text, "postal_code" text, "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, "record_status" text NOT NULL DEFAULT 'active', "created_by" uuid, "updated_by" uuid, CONSTRAINT "UQ_2dc01bf7bc5c5f5dbdbcea11b66" UNIQUE ("email"), CONSTRAINT "PK_e72b4eb110d106ca66b940565e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "offering_income" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" text NOT NULL, "sub_type" text, "category" text, "amount" numeric NOT NULL, "currency" text NOT NULL, "comments" text, "date" date NOT NULL, "image_urls" text array NOT NULL, "shift" text, "inactivation_reason" text, "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, "record_status" text NOT NULL DEFAULT 'active', "member_type" text, "created_by" uuid, "updated_by" uuid, "church_id" uuid, "family_group_id" uuid, "pastor_id" uuid, "copastor_id" uuid, "supervisor_id" uuid, "preacher_id" uuid, "disciple_id" uuid, "external_donor_id" uuid, "zone_id" uuid, CONSTRAINT "PK_ce10159fc7ed4ae0c15214a4e6b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "offering_expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" text NOT NULL, "sub_type" text, "amount" numeric NOT NULL, "currency" text NOT NULL, "comments" text, "date" date NOT NULL, "image_urls" text array NOT NULL, "inactivation_reason" text, "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, "record_status" text NOT NULL DEFAULT 'active', "created_by" uuid, "updated_by" uuid, "church_id" uuid, CONSTRAINT "PK_4c6b7adf692d43361448ef20208" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_f32b1cb14a9920477bcfd63df2c" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_b75c92ef36f432fe68ec300a7d4" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" ADD CONSTRAINT "FK_21a8fe1d4021e33443e95174fa5" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" ADD CONSTRAINT "FK_7340c1d50ff1ca4f391d75c8245" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" ADD CONSTRAINT "FK_163509f1d5e9ab8bcadaa841ddb" FOREIGN KEY ("their_church_id") REFERENCES "churches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" ADD CONSTRAINT "FK_24ef2f977b029f472aad7fe9a2d" FOREIGN KEY ("their_pastor_id") REFERENCES "pastors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" ADD CONSTRAINT "FK_00e1914411c22ef16a563146f08" FOREIGN KEY ("their_copastor_id") REFERENCES "copastors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" ADD CONSTRAINT "FK_a155ff7837659b188df76c47454" FOREIGN KEY ("their_supervisor_id") REFERENCES "supervisors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" ADD CONSTRAINT "FK_ef4cb411c5dd63774910e6e78d1" FOREIGN KEY ("their_zone_id") REFERENCES "zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" ADD CONSTRAINT "FK_40c731141bbdab22825ae9e84ce" FOREIGN KEY ("their_preacher_id") REFERENCES "preachers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" ADD CONSTRAINT "FK_f0af5f7bf9998024e4385bccad6" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" ADD CONSTRAINT "FK_07fd450df8c689dd5ffe351f498" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" ADD CONSTRAINT "FK_70c4694dc8ba75932c4331daaf8" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" ADD CONSTRAINT "FK_43324f99c9033a21b23c0380a00" FOREIGN KEY ("their_church_id") REFERENCES "churches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" ADD CONSTRAINT "FK_6e893c74db28cdf770c054ec0b3" FOREIGN KEY ("their_pastor_id") REFERENCES "pastors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" ADD CONSTRAINT "FK_b268e37d7fabfb2f4276c187b00" FOREIGN KEY ("their_copastor_id") REFERENCES "copastors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" ADD CONSTRAINT "FK_82f50e993d7a3487f8409c1adc4" FOREIGN KEY ("their_zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" ADD CONSTRAINT "FK_ad9cd39de977a854616876a9f03" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" ADD CONSTRAINT "FK_897687e447b0623b4342922d280" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" ADD CONSTRAINT "FK_b5f08bd92f30b8724bbcf721008" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" ADD CONSTRAINT "FK_e45ee516cda637dbd2e6e1dd9d1" FOREIGN KEY ("their_church_id") REFERENCES "churches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" ADD CONSTRAINT "FK_63d7c20de6839d118d2358e4905" FOREIGN KEY ("their_pastor_id") REFERENCES "pastors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" ADD CONSTRAINT "FK_7bf2d4bd8ed07fde1f4a123e76e" FOREIGN KEY ("their_copastor_id") REFERENCES "copastors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" ADD CONSTRAINT "FK_37f9c74b81740d3d585cbdff487" FOREIGN KEY ("their_supervisor_id") REFERENCES "supervisors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" ADD CONSTRAINT "FK_fe34c1ee643f50e163246efa285" FOREIGN KEY ("their_zone_id") REFERENCES "zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" ADD CONSTRAINT "FK_0b8f59e3ad847863550b7dd0238" FOREIGN KEY ("their_preacher_id") REFERENCES "preachers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" ADD CONSTRAINT "FK_ab8fda813178c5fa7bf858899fd" FOREIGN KEY ("their_family_group_id") REFERENCES "family_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "copastors" ADD CONSTRAINT "FK_06c21b125cf2916d8d806ac00d1" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "copastors" ADD CONSTRAINT "FK_ed88118823ef391dc747228205d" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "copastors" ADD CONSTRAINT "FK_50d4945d08206af470bc135e2cf" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "copastors" ADD CONSTRAINT "FK_4b9e7de019842d8df866d6e3798" FOREIGN KEY ("their_pastor_id") REFERENCES "pastors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "copastors" ADD CONSTRAINT "FK_ae90951a82f31814ce6f4fb519a" FOREIGN KEY ("their_church_id") REFERENCES "churches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pastors" ADD CONSTRAINT "FK_a650bac23350614c15afc745a88" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pastors" ADD CONSTRAINT "FK_8a6bfc09423136ed58ebf008fb8" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pastors" ADD CONSTRAINT "FK_973269f6e8aa69e0f03604739f3" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pastors" ADD CONSTRAINT "FK_baea18101a5d69e19fe7f990f89" FOREIGN KEY ("their_church_id") REFERENCES "churches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "churches" ADD CONSTRAINT "FK_3b1bb1e63e91a0bf3eb2732960a" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "churches" ADD CONSTRAINT "FK_b2d9f9b77e5c911e8e2aa24a123" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "churches" ADD CONSTRAINT "FK_3a6a26f2f4bd2b5239ef4a9ae68" FOREIGN KEY ("their_main_church_id") REFERENCES "churches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" ADD CONSTRAINT "FK_6a91be4984ff2e7581e6df48463" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" ADD CONSTRAINT "FK_33aff87ccf8ab51ab73c5567474" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" ADD CONSTRAINT "FK_10d0601334f3633726c272775a2" FOREIGN KEY ("their_pastor_id") REFERENCES "pastors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" ADD CONSTRAINT "FK_f346887f40bc6e9e0ccc90ff3b3" FOREIGN KEY ("their_copastor_id") REFERENCES "copastors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" ADD CONSTRAINT "FK_23fd8d58c48a84b4944e8764a63" FOREIGN KEY ("their_church_id") REFERENCES "churches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" ADD CONSTRAINT "FK_ce512dd3c06a4dc89481ab803e3" FOREIGN KEY ("their_supervisor_id") REFERENCES "supervisors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" ADD CONSTRAINT "FK_db43084399c3f0889dd06236391" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" ADD CONSTRAINT "FK_6559a87acfb7885a2244e4f8064" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" ADD CONSTRAINT "FK_7276a48e35323391ccb19c13e58" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" ADD CONSTRAINT "FK_aa710c069961990459c702913f2" FOREIGN KEY ("their_church_id") REFERENCES "churches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" ADD CONSTRAINT "FK_26e7ba31212acd06c342f8f11f6" FOREIGN KEY ("their_pastor_id") REFERENCES "pastors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" ADD CONSTRAINT "FK_bc18532f0d85ba29b4c9e726797" FOREIGN KEY ("their_copastor_id") REFERENCES "copastors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" ADD CONSTRAINT "FK_849a9a7659b65f22d1ed0bfc84a" FOREIGN KEY ("their_supervisor_id") REFERENCES "supervisors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" ADD CONSTRAINT "FK_6a9660134bf6bb49e10b53889d1" FOREIGN KEY ("their_zone_id") REFERENCES "zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" ADD CONSTRAINT "FK_14293cf291f6dc60e2f58d21a02" FOREIGN KEY ("their_family_group_id") REFERENCES "family_groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_donors" ADD CONSTRAINT "FK_3d3f932e49ab77d96262681b9af" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_donors" ADD CONSTRAINT "FK_f64d9a61f8f85a2f5205da7821a" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" ADD CONSTRAINT "FK_4c91e8618bd05630c166c795e7b" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" ADD CONSTRAINT "FK_748ce1278707f55f6215eddf9e1" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" ADD CONSTRAINT "FK_62729f186c5ddf1495f92de12f0" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" ADD CONSTRAINT "FK_5f5e5d63f03d2119e8a66b75c96" FOREIGN KEY ("family_group_id") REFERENCES "family_groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" ADD CONSTRAINT "FK_821f9ac3c4abda610be208ad1d2" FOREIGN KEY ("pastor_id") REFERENCES "pastors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" ADD CONSTRAINT "FK_9b99d9a1b7db60ff10f5b45be15" FOREIGN KEY ("copastor_id") REFERENCES "copastors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" ADD CONSTRAINT "FK_4dd6c65989a30b9208b781ac9e7" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" ADD CONSTRAINT "FK_5b622e8341e86fff7bf6c722511" FOREIGN KEY ("preacher_id") REFERENCES "preachers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" ADD CONSTRAINT "FK_3c957e6968d6ee193b888284e77" FOREIGN KEY ("disciple_id") REFERENCES "disciples"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" ADD CONSTRAINT "FK_dc4238f8afc6cd988be1e4968b5" FOREIGN KEY ("external_donor_id") REFERENCES "external_donors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" ADD CONSTRAINT "FK_58164d7f34fa65fa58a4e874a56" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_expenses" ADD CONSTRAINT "FK_b5c4da32831f48b99364344ce79" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_expenses" ADD CONSTRAINT "FK_804046083204aa2c697f79a154c" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_expenses" ADD CONSTRAINT "FK_4d903d2dc8fd1f9be98de77a4e4" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offering_expenses" DROP CONSTRAINT "FK_4d903d2dc8fd1f9be98de77a4e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_expenses" DROP CONSTRAINT "FK_804046083204aa2c697f79a154c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_expenses" DROP CONSTRAINT "FK_b5c4da32831f48b99364344ce79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" DROP CONSTRAINT "FK_58164d7f34fa65fa58a4e874a56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" DROP CONSTRAINT "FK_dc4238f8afc6cd988be1e4968b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" DROP CONSTRAINT "FK_3c957e6968d6ee193b888284e77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" DROP CONSTRAINT "FK_5b622e8341e86fff7bf6c722511"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" DROP CONSTRAINT "FK_4dd6c65989a30b9208b781ac9e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" DROP CONSTRAINT "FK_9b99d9a1b7db60ff10f5b45be15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" DROP CONSTRAINT "FK_821f9ac3c4abda610be208ad1d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" DROP CONSTRAINT "FK_5f5e5d63f03d2119e8a66b75c96"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" DROP CONSTRAINT "FK_62729f186c5ddf1495f92de12f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" DROP CONSTRAINT "FK_748ce1278707f55f6215eddf9e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offering_income" DROP CONSTRAINT "FK_4c91e8618bd05630c166c795e7b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_donors" DROP CONSTRAINT "FK_f64d9a61f8f85a2f5205da7821a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_donors" DROP CONSTRAINT "FK_3d3f932e49ab77d96262681b9af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" DROP CONSTRAINT "FK_14293cf291f6dc60e2f58d21a02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" DROP CONSTRAINT "FK_6a9660134bf6bb49e10b53889d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" DROP CONSTRAINT "FK_849a9a7659b65f22d1ed0bfc84a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" DROP CONSTRAINT "FK_bc18532f0d85ba29b4c9e726797"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" DROP CONSTRAINT "FK_26e7ba31212acd06c342f8f11f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" DROP CONSTRAINT "FK_aa710c069961990459c702913f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" DROP CONSTRAINT "FK_7276a48e35323391ccb19c13e58"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" DROP CONSTRAINT "FK_6559a87acfb7885a2244e4f8064"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preachers" DROP CONSTRAINT "FK_db43084399c3f0889dd06236391"`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" DROP CONSTRAINT "FK_ce512dd3c06a4dc89481ab803e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" DROP CONSTRAINT "FK_23fd8d58c48a84b4944e8764a63"`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" DROP CONSTRAINT "FK_f346887f40bc6e9e0ccc90ff3b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" DROP CONSTRAINT "FK_10d0601334f3633726c272775a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" DROP CONSTRAINT "FK_33aff87ccf8ab51ab73c5567474"`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" DROP CONSTRAINT "FK_6a91be4984ff2e7581e6df48463"`,
    );
    await queryRunner.query(
      `ALTER TABLE "churches" DROP CONSTRAINT "FK_3a6a26f2f4bd2b5239ef4a9ae68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "churches" DROP CONSTRAINT "FK_b2d9f9b77e5c911e8e2aa24a123"`,
    );
    await queryRunner.query(
      `ALTER TABLE "churches" DROP CONSTRAINT "FK_3b1bb1e63e91a0bf3eb2732960a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pastors" DROP CONSTRAINT "FK_baea18101a5d69e19fe7f990f89"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pastors" DROP CONSTRAINT "FK_973269f6e8aa69e0f03604739f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pastors" DROP CONSTRAINT "FK_8a6bfc09423136ed58ebf008fb8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pastors" DROP CONSTRAINT "FK_a650bac23350614c15afc745a88"`,
    );
    await queryRunner.query(
      `ALTER TABLE "copastors" DROP CONSTRAINT "FK_ae90951a82f31814ce6f4fb519a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "copastors" DROP CONSTRAINT "FK_4b9e7de019842d8df866d6e3798"`,
    );
    await queryRunner.query(
      `ALTER TABLE "copastors" DROP CONSTRAINT "FK_50d4945d08206af470bc135e2cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "copastors" DROP CONSTRAINT "FK_ed88118823ef391dc747228205d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "copastors" DROP CONSTRAINT "FK_06c21b125cf2916d8d806ac00d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" DROP CONSTRAINT "FK_ab8fda813178c5fa7bf858899fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" DROP CONSTRAINT "FK_0b8f59e3ad847863550b7dd0238"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" DROP CONSTRAINT "FK_fe34c1ee643f50e163246efa285"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" DROP CONSTRAINT "FK_37f9c74b81740d3d585cbdff487"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" DROP CONSTRAINT "FK_7bf2d4bd8ed07fde1f4a123e76e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" DROP CONSTRAINT "FK_63d7c20de6839d118d2358e4905"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" DROP CONSTRAINT "FK_e45ee516cda637dbd2e6e1dd9d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" DROP CONSTRAINT "FK_b5f08bd92f30b8724bbcf721008"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" DROP CONSTRAINT "FK_897687e447b0623b4342922d280"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciples" DROP CONSTRAINT "FK_ad9cd39de977a854616876a9f03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" DROP CONSTRAINT "FK_82f50e993d7a3487f8409c1adc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" DROP CONSTRAINT "FK_b268e37d7fabfb2f4276c187b00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" DROP CONSTRAINT "FK_6e893c74db28cdf770c054ec0b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" DROP CONSTRAINT "FK_43324f99c9033a21b23c0380a00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" DROP CONSTRAINT "FK_70c4694dc8ba75932c4331daaf8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" DROP CONSTRAINT "FK_07fd450df8c689dd5ffe351f498"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" DROP CONSTRAINT "FK_f0af5f7bf9998024e4385bccad6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" DROP CONSTRAINT "FK_40c731141bbdab22825ae9e84ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" DROP CONSTRAINT "FK_ef4cb411c5dd63774910e6e78d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" DROP CONSTRAINT "FK_a155ff7837659b188df76c47454"`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" DROP CONSTRAINT "FK_00e1914411c22ef16a563146f08"`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" DROP CONSTRAINT "FK_24ef2f977b029f472aad7fe9a2d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" DROP CONSTRAINT "FK_163509f1d5e9ab8bcadaa841ddb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" DROP CONSTRAINT "FK_7340c1d50ff1ca4f391d75c8245"`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_groups" DROP CONSTRAINT "FK_21a8fe1d4021e33443e95174fa5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_b75c92ef36f432fe68ec300a7d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_f32b1cb14a9920477bcfd63df2c"`,
    );
    await queryRunner.query(`DROP TABLE "offering_expenses"`);
    await queryRunner.query(`DROP TABLE "offering_income"`);
    await queryRunner.query(`DROP TABLE "external_donors"`);
    await queryRunner.query(`DROP TABLE "preachers"`);
    await queryRunner.query(`DROP TABLE "zones"`);
    await queryRunner.query(`DROP TABLE "churches"`);
    await queryRunner.query(`DROP TABLE "pastors"`);
    await queryRunner.query(`DROP TABLE "copastors"`);
    await queryRunner.query(`DROP TABLE "disciples"`);
    await queryRunner.query(`DROP TABLE "supervisors"`);
    await queryRunner.query(`DROP TABLE "family_groups"`);
    await queryRunner.query(`DROP TABLE "members"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
