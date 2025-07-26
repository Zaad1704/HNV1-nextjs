import Property from '../models/Property';
import Tenant from '../models/Tenant';

export const validatePropertyTenantConnection = async (organizationId: string) => {
  try {
    const properties = await Property.find({ organizationId });
    const tenants = await Tenant.find({ organizationId, status: 'Active' });
    
    const issues: any[] = [];
    
    for (const property of properties) {
      const propertyTenants = tenants.filter(t => t.propertyId?.toString() === property._id.toString());
      
      // Check for unit number consistency
      for (const tenant of propertyTenants) {
        if (!tenant.unit || tenant.unit === '') {
          issues.push({
            type: 'missing_unit',
            tenantId: tenant._id,
            tenantName: tenant.name,
            propertyId: property._id,
            propertyName: property.name
          });
        }
        
        const unitNumber = parseInt(tenant.unit);
        if (unitNumber > property.numberOfUnits) {
          issues.push({
            type: 'invalid_unit',
            tenantId: tenant._id,
            tenantName: tenant.name,
            unit: tenant.unit,
            propertyId: property._id,
            propertyName: property.name,
            maxUnits: property.numberOfUnits
          });
        }
      }
      
      // Check for duplicate units
      const unitCounts: Record<string, number> = {};
      propertyTenants.forEach(tenant => {
        if (tenant.unit) {
          unitCounts[tenant.unit] = (unitCounts[tenant.unit] || 0) + 1;
        }
      });
      
      Object.entries(unitCounts).forEach(([unit, count]: [string, number]) => {
        if (count > 1) {
          issues.push({
            type: 'duplicate_unit',
            unit,
            count,
            propertyId: property._id,
            propertyName: property.name,
            tenants: propertyTenants.filter(t => t.unit === unit).map(t => ({
              id: t._id,
              name: t.name
            }))
          });
        }
      });
    }
    
    return {
      valid: issues.length === 0,
      issues,
      summary: {
        totalProperties: properties.length,
        totalTenants: tenants.length,
        issuesFound: issues.length
      }
    };
  } catch (error) {
    console.error('Data validation error:', error);
    throw error;
  }
};

export const fixDataInconsistencies = async (organizationId: string) => {
  try {
    const validation = await validatePropertyTenantConnection(organizationId);
    const fixes: any[] = [];
    
    for (const issue of validation.issues) {
      switch (issue.type) {
        case 'missing_unit': {
          const prop1 = await Property.findById(issue.propertyId);
          if (!prop1) continue;
          const occupied1 = await Tenant.find({ 
            propertyId: issue.propertyId, 
            organizationId,
            status: 'Active',
            unit: { $nin: [null, ''] }
          }).distinct('unit');
          
          let nextUnit1 = '1';
          for (let i = 1; i <= prop1.numberOfUnits; i++) {
            if (!occupied1.includes(i.toString())) {
              nextUnit1 = i.toString();
              break;
            }
          }
          
          await Tenant.findByIdAndUpdate(issue.tenantId, { unit: nextUnit1 });
          fixes.push({
            fixType: 'assigned_unit',
            tenantId: issue.tenantId,
            assignedUnit: nextUnit1
          });
          break;
        }
          
        case 'invalid_unit': {
          const prop2 = await Property.findById(issue.propertyId);
          if (!prop2) continue;
          const occupied2 = await Tenant.find({ 
            propertyId: issue.propertyId, 
            organizationId,
            status: 'Active',
            _id: { $ne: issue.tenantId },
            unit: { $nin: [null, ''] }
          }).distinct('unit');
          
          let nextUnit2 = '1';
          for (let i = 1; i <= prop2.numberOfUnits; i++) {
            if (!occupied2.includes(i.toString())) {
              nextUnit2 = i.toString();
              break;
            }
          }
          
          await Tenant.findByIdAndUpdate(issue.tenantId, { unit: nextUnit2 });
          fixes.push({
            fixType: 'corrected_unit',
            tenantId: issue.tenantId,
            oldUnit: issue.unit,
            newUnit: nextUnit2
          });
          break;
        }
          
        case 'duplicate_unit': {
          const duplicateTenants = issue.tenants.slice(1);
          for (const tenant of duplicateTenants) {
            const prop3 = await Property.findById(issue.propertyId);
            if (!prop3) continue;
            const occupied3 = await Tenant.find({ 
              propertyId: issue.propertyId, 
              organizationId,
              status: 'Active',
              _id: { $ne: tenant.id },
              unit: { $nin: [null, ''] }
            }).distinct('unit');
            
            let nextUnit3 = '1';
            for (let i = 1; i <= prop3.numberOfUnits; i++) {
              if (!occupied3.includes(i.toString())) {
                nextUnit3 = i.toString();
                break;
              }
            }
            
            await Tenant.findByIdAndUpdate(tenant.id, { unit: nextUnit3 });
            fixes.push({
              fixType: 'resolved_duplicate',
              tenantId: tenant.id,
              oldUnit: issue.unit,
              newUnit: nextUnit3
            });
          }
          break;
        }
      }
    }
    
    return {
      fixesApplied: fixes.length,
      fixes,
      validation: await validatePropertyTenantConnection(organizationId)
    };
  } catch (error) {
    console.error('Data fix error:', error);
    throw error;
  }
};