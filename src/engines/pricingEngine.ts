export interface PricingResult {
  fibuMonthly: number;
  jaAnnual: number;
  plattformMonthly: number;
  payrollMonthly: number;
  payrollSetupTotal: number;
  einrichtung: number;
  steuerlicheEinrichtung: number;
  totalMonthly: number;
  totalAnnual: number;
  totalYear1: number;
  scalingFactor: number;
  isHolding: boolean;
  payrollFlag: boolean;
}

const BASE_FIBU = 185;
const BASE_JA = 2900;
const BASE_PLATTFORM = 55;
const PLATTFORM_CAP = 99;
const BASE_TOTAL = (BASE_FIBU * 12) + BASE_JA + (BASE_PLATTFORM * 12); // 5780
const SCALING_RATE = 0.0186;

export function calculatePricing(
  jahresumsatz: number,
  companyType: string,
  serviceNeeds: string,
  employees: number,
  taxTakeover: string,
): PricingResult {
  const isHolding = companyType === 'Holding';
  const needsPayroll = serviceNeeds.includes('Payroll');
  const needsTaxSetup = taxTakeover === 'Tax Registration by Integral';

  let fibuMonthly: number;
  let jaAnnual: number;
  let plattformMonthly: number;
  let scalingFactor: number;

  if (isHolding) {
    fibuMonthly = 74; // Flat rate (FiBu + JA all-inclusive)
    jaAnnual = 0; // included in flat
    plattformMonthly = 55;
    scalingFactor = 1;
  } else {
    const totalPackage = Math.max(BASE_TOTAL, jahresumsatz * SCALING_RATE);
    scalingFactor = totalPackage / BASE_TOTAL;
    fibuMonthly = Math.round(BASE_FIBU * scalingFactor);
    jaAnnual = Math.round(BASE_JA * scalingFactor);
    plattformMonthly = Math.min(Math.round(BASE_PLATTFORM * scalingFactor), PLATTFORM_CAP);
  }

  // Payroll
  let payrollMonthly = 0;
  let payrollSetupTotal = 0;
  const payrollFlag = needsPayroll && employees >= 5;

  if (needsPayroll && employees > 0) {
    const pricePerPayslip = employees < 5 ? 25 : 20; // >=5 is flagged for manual pricing
    payrollMonthly = pricePerPayslip * employees;
    payrollSetupTotal = 30 + (15 * employees); // Company setup + per-employee setup
  }

  // One-time costs
  const einrichtung = 250;
  const steuerlicheEinrichtung = needsTaxSetup ? 550 : 0;

  // Totals
  const totalMonthly = fibuMonthly + plattformMonthly + payrollMonthly;
  const totalAnnual = isHolding
    ? (fibuMonthly * 12) + (plattformMonthly * 12) + (payrollMonthly * 12)
    : (fibuMonthly * 12) + jaAnnual + (plattformMonthly * 12) + (payrollMonthly * 12);
  const totalYear1 = totalAnnual + einrichtung + steuerlicheEinrichtung + payrollSetupTotal;

  return {
    fibuMonthly,
    jaAnnual,
    plattformMonthly,
    payrollMonthly,
    payrollSetupTotal,
    einrichtung,
    steuerlicheEinrichtung,
    totalMonthly,
    totalAnnual,
    totalYear1,
    scalingFactor,
    isHolding,
    payrollFlag,
  };
}

export function getRevenueRange(umsatz: number): string {
  if (umsatz === 0) return '0€ - Holding';
  if (umsatz < 100000) return '< 100k €';
  if (umsatz < 300000) return '100k - 300k €';
  if (umsatz < 750000) return '300k - 750k €';
  if (umsatz < 1500000) return '750k - 1,5 M €';
  if (umsatz < 5000000) return '1,5M - 5M €';
  return '5M € +';
}
