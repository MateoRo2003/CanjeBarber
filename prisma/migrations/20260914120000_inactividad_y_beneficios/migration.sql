-- AlterEnum
ALTER TYPE "TipoTransaccion" ADD VALUE 'PENALIZACION';

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN "ultimoLogin" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "configuracion"
  ADD COLUMN "inactividadActiva" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "inactividadDias" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "inactividadPuntos" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "inactividadConsideraLogin" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "inactividadConsideraCanje" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "inactividadConsideraSuma" BOOLEAN NOT NULL DEFAULT true;
