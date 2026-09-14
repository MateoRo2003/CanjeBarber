-- AlterEnum
ALTER TYPE "TipoTransaccion" ADD VALUE 'BONUS';

-- CreateTable
CREATE TABLE "configuracion" (
    "id" TEXT NOT NULL DEFAULT 'config',
    "bienvenidaActiva" BOOLEAN NOT NULL DEFAULT false,
    "puntosBienvenida" INTEGER NOT NULL DEFAULT 0,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);
