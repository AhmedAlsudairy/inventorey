-- Create default status types if they don't exist
INSERT INTO "public"."status_type" ("code", "name", "entity_type")
SELECT 'ACT', 'Active', 'product'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."status_type" WHERE "entity_type" = 'product' AND "code" = 'ACT'
);

INSERT INTO "public"."status_type" ("code", "name", "entity_type")
SELECT 'ACT', 'Active', 'inventory'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."status_type" WHERE "entity_type" = 'inventory' AND "code" = 'ACT'
);

INSERT INTO "public"."status_type" ("code", "name", "entity_type")
SELECT 'ACT', 'Active', 'warehouse'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."status_type" WHERE "entity_type" = 'warehouse' AND "code" = 'ACT'
);

INSERT INTO "public"."status_type" ("code", "name", "entity_type")
SELECT 'ACT', 'Active', 'rack'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."status_type" WHERE "entity_type" = 'rack' AND "code" = 'ACT'
);

INSERT INTO "public"."status_type" ("code", "name", "entity_type")
SELECT 'ACT', 'Active', 'shelf'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."status_type" WHERE "entity_type" = 'shelf' AND "code" = 'ACT'
);
