-- Colonnes du Kanban propres à chaque projet.
CREATE TABLE "project_columns" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "category" "TaskStatus" NOT NULL,
    "position" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_columns_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "project_columns_project_id_position_idx" ON "project_columns"("project_id", "position");

ALTER TABLE "project_columns" ADD CONSTRAINT "project_columns_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Données : chaque projet existant reçoit les quatre colonnes correspondant aux anciens statuts.
INSERT INTO "project_columns" ("id", "workspace_id", "project_id", "name", "category", "position")
SELECT gen_random_uuid()::text, p."workspace_id", p."id", c.name, c.category::"TaskStatus", c.position
FROM "projects" p
CROSS JOIN (VALUES
  ('À faire', 'todo', 1024),
  ('En cours', 'in_progress', 2048),
  ('En revue', 'in_review', 3072),
  ('Terminé', 'done', 4096)
) AS c(name, category, position);

-- Chaque tâche rejoint la colonne de son statut.
ALTER TABLE "tasks" ADD COLUMN "column_id" TEXT;
UPDATE "tasks" t SET "column_id" = c."id"
FROM "project_columns" c
WHERE c."project_id" = t."project_id" AND c."category" = t."status";
ALTER TABLE "tasks" ALTER COLUMN "column_id" SET NOT NULL;

DROP INDEX "tasks_project_id_status_position_idx";
CREATE INDEX "tasks_column_id_position_idx" ON "tasks"("column_id", "position");
CREATE INDEX "tasks_project_id_status_idx" ON "tasks"("project_id", "status");

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "project_columns"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
