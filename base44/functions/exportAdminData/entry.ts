import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

// Helper to convert array of objects to CSV
function convertToCSV(data, entityName) {
  if (!data || data.length === 0) {
    return `entity,message\n${entityName},No data available\n`;
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    'entity,' + headers.join(','), // Add entity name as first column
    ...data.map(row => {
      const values = headers.map(header => {
        const escaped = ('' + (row[header] === null || row[header] === undefined ? '' : row[header])).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      return `${entityName},` + values.join(',');
    })
  ];
  return csvRows.join('\n');
}


Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const entitiesToExport = [
        { name: 'User', fields: ['id', 'full_name', 'email', 'role', 'reward_points', 'created_date'] },
        { name: 'Formula', fields: ['id', 'name', 'product_type', 'difficulty_level', 'status', 'created_by', 'created_date'] },
        { name: 'Simulation', fields: ['id', 'chemicals', 'risk_score', 'created_by', 'created_date'] },
        { name: 'Review', fields: ['id', 'feature_used', 'rating', 'helpful', 'created_by', 'created_date'] },
        { name: 'DemoRequest', fields: ['id', 'name', 'email', 'company_name', 'status', 'created_date'] },
        { name: 'JobPosting', fields: ['id', 'title', 'location', 'type', 'status', 'created_date'] },
        { name: 'ContactSubmission', fields: ['id', 'name', 'email', 'subject', 'is_read', 'created_date'] },
    ];
    
    const dataPromises = entitiesToExport.map(entity => 
        base44.asServiceRole.entities[entity.name].filter({}, '-created_date', null, false, entity.fields)
    );

    const results = await Promise.all(dataPromises);
    
    let fullCsv = '';
    results.forEach((data, index) => {
        const entityName = entitiesToExport[index].name;
        fullCsv += convertToCSV(data, entityName) + '\n\n';
    });

    return new Response(fullCsv, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="suttain_platform_report_${new Date().toISOString().split('T')[0]}.csv"`
        }
    });

  } catch (error) {
    console.error('Error exporting admin data:', error);
    return new Response(JSON.stringify({ error: 'Failed to export data.' }), { status: 500 });
  }
});