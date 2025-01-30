import { describe, it, expect } from 'vitest';
import config from '../utils/config';
import { PageRoutesFuncReduce } from './routes'; // Regola il percorso in base al tuo progetto

const deployPath = config.deployPath;

describe('PageRoutesFuncReduce', () => {
  it('should correctly build flat routes including child routes', () => {
    const flatRoutes = PageRoutesFuncReduce();
    
    expect(flatRoutes).toHaveProperty('HOME');
    expect(flatRoutes['HOME']).toBe(`${deployPath}/home`);
    
    expect(flatRoutes).toHaveProperty('TELEMATIC_RECEIPT');
    expect(flatRoutes['TELEMATIC_RECEIPT']).toBe(`${deployPath}/flows/telematic-receipt/`);

    expect(flatRoutes).toHaveProperty('TELEMATIC_RECEIPT_EXPORT_OVERVIEW');
    expect(flatRoutes['TELEMATIC_RECEIPT_EXPORT_OVERVIEW']).toBe(`${deployPath}/flows/telematic-receipt/export-overview`);
  });

  it('should handle routes without children correctly', () => {
    const flatRoutes = PageRoutesFuncReduce();
    expect(flatRoutes).toHaveProperty('REPORTING');
    expect(flatRoutes['REPORTING']).toBe(`${deployPath}/flows/reporting/`);
  });

});
