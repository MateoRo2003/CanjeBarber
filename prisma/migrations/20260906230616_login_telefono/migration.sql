-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "telefono" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "googleId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clientes_telefono_key" ON "clientes"("telefono");

