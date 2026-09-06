-- AlterEnum
ALTER TYPE "TipoTransaccion" ADD VALUE 'AJUSTE';

-- AlterTable
ALTER TABLE "transacciones" ADD COLUMN     "nota" TEXT;
