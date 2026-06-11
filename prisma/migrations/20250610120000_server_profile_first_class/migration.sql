-- Server profile first-class pivot

CREATE TYPE "SchoolType" AS ENUM ('OLDSCHOOL', 'MIDDLESCHOOL', 'NEWSCHOOL');
CREATE TYPE "GameplayDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'FARM', 'PVP', 'PVP_FARM');

ALTER TABLE "Server" ADD COLUMN "maxLevel" INTEGER;
ALTER TABLE "Server" ADD COLUMN "schoolType" "SchoolType";
ALTER TABLE "Server" ADD COLUMN "gameplayDifficulty" "GameplayDifficulty";
ALTER TABLE "Server" ADD COLUMN "originCountry" TEXT;
ALTER TABLE "Server" ADD COLUMN "mainLanguage" TEXT;
ALTER TABLE "Server" ADD COLUMN "supportedLanguages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Server" ADD COLUMN "representsServer" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Server" ADD COLUMN "systemAlchemy" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Server" ADD COLUMN "systemScarf" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Server" ADD COLUMN "systemLycan" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Server" ADD COLUMN "systemBonus67" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Server" ADD COLUMN "systemOfflineShop" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Server" ADD COLUMN "systemCostume" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Server" ADD COLUMN "systemPet" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Server" ADD COLUMN "systemMount" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Server" ADD COLUMN "systemBattlePass" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Server" ADD COLUMN "systemDungeonRanking" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Server" ADD COLUMN "systemElement" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Server" ADD COLUMN "systemTalisman" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Server" SET
  "schoolType" = CASE
    WHEN "serverType"::text IN ('OLDSCHOOL', 'PVP', 'PVM', 'MIXED') AND "serverType"::text = 'OLDSCHOOL' THEN 'OLDSCHOOL'::"SchoolType"
    WHEN "serverType"::text = 'MIDDLESCHOOL' THEN 'MIDDLESCHOOL'::"SchoolType"
    WHEN "serverType"::text = 'NEWSCHOOL' THEN 'NEWSCHOOL'::"SchoolType"
    WHEN "serverType"::text = 'PVP' THEN 'OLDSCHOOL'::"SchoolType"
    WHEN "serverType"::text = 'PVM' THEN 'MIDDLESCHOOL'::"SchoolType"
    WHEN "serverType"::text = 'MIXED' THEN 'MIDDLESCHOOL'::"SchoolType"
    ELSE 'OLDSCHOOL'::"SchoolType"
  END,
  "gameplayDifficulty" = CASE
    WHEN "serverType"::text = 'PVP' THEN 'PVP'::"GameplayDifficulty"
    WHEN "serverType"::text = 'PVM' THEN 'FARM'::"GameplayDifficulty"
    WHEN "serverType"::text = 'MIXED' THEN 'PVP_FARM'::"GameplayDifficulty"
    ELSE 'MEDIUM'::"GameplayDifficulty"
  END,
  "originCountry" = COALESCE("region", 'Global'),
  "mainLanguage" = COALESCE("language", 'English'),
  "supportedLanguages" = ARRAY[COALESCE("language", 'English')]::TEXT[];

ALTER TABLE "Server" ALTER COLUMN "schoolType" SET NOT NULL;
ALTER TABLE "Server" ALTER COLUMN "gameplayDifficulty" SET NOT NULL;
ALTER TABLE "Server" ALTER COLUMN "originCountry" SET NOT NULL;
ALTER TABLE "Server" ALTER COLUMN "mainLanguage" SET NOT NULL;
ALTER TABLE "Server" ALTER COLUMN "description" DROP NOT NULL;

ALTER TABLE "Server" DROP COLUMN "region";
ALTER TABLE "Server" DROP COLUMN "language";
ALTER TABLE "Server" DROP COLUMN "serverType";
ALTER TABLE "Server" DROP COLUMN IF EXISTS "expRate";
ALTER TABLE "Server" DROP COLUMN IF EXISTS "yangRate";
ALTER TABLE "Server" DROP COLUMN IF EXISTS "dropRate";

DROP TYPE IF EXISTS "ServerType";

-- ServerMemberRole migration
CREATE TYPE "ServerMemberRole_new" AS ENUM (
  'OWNER',
  'CO_OWNER',
  'ADMINISTRATOR',
  'COMMUNITY_MANAGER',
  'PROMOTER',
  'CONTENT_CREATOR',
  'PLAYER'
);

ALTER TABLE "ServerMember" ADD COLUMN "role_new" "ServerMemberRole_new";

UPDATE "ServerMember" SET "role_new" = CASE "role"::text
  WHEN 'OWNER' THEN 'OWNER'::"ServerMemberRole_new"
  WHEN 'ADMIN' THEN 'ADMINISTRATOR'::"ServerMemberRole_new"
  WHEN 'PROMOTER' THEN 'PROMOTER'::"ServerMemberRole_new"
  WHEN 'ANALYST' THEN 'CONTENT_CREATOR'::"ServerMemberRole_new"
  ELSE 'PLAYER'::"ServerMemberRole_new"
END;

ALTER TABLE "ServerMember" DROP COLUMN "role";
ALTER TABLE "ServerMember" RENAME COLUMN "role_new" TO "role";
ALTER TABLE "ServerMember" ALTER COLUMN "role" SET NOT NULL;

DROP TYPE "ServerMemberRole";
ALTER TYPE "ServerMemberRole_new" RENAME TO "ServerMemberRole";

CREATE INDEX "Server_schoolType_idx" ON "Server"("schoolType");
CREATE INDEX "Server_gameplayDifficulty_idx" ON "Server"("gameplayDifficulty");
CREATE INDEX "Server_originCountry_idx" ON "Server"("originCountry");
CREATE INDEX "Server_mainLanguage_idx" ON "Server"("mainLanguage");

DROP INDEX IF EXISTS "Server_serverType_idx";
DROP INDEX IF EXISTS "Server_region_idx";
DROP INDEX IF EXISTS "Server_language_idx";

-- RecommendationPreference column rename
ALTER TABLE "RecommendationPreference" RENAME COLUMN "serverTypeWeights" TO "schoolTypeWeights";
ALTER TABLE "RecommendationPreference" ADD COLUMN "difficultyWeights" JSONB;
ALTER TABLE "RecommendationPreference" RENAME COLUMN "regionWeights" TO "originCountryWeights";
