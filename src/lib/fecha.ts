const AR_OFFSET_HORAS = 3; // America/Argentina/Buenos_Aires es UTC-3 todo el año (sin horario de verano)

/** Instante UTC que corresponde a las 00:00 de "hoy" en hora de Argentina. */
export function inicioDeHoyAR(): Date {
  const ahoraAR = new Date(Date.now() - AR_OFFSET_HORAS * 3600 * 1000);
  const inicioAR = Date.UTC(
    ahoraAR.getUTCFullYear(),
    ahoraAR.getUTCMonth(),
    ahoraAR.getUTCDate(),
  );
  return new Date(inicioAR + AR_OFFSET_HORAS * 3600 * 1000);
}
