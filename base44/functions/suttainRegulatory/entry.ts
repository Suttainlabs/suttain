import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { query } = body;
    if (!query) return Response.json({ error: 'query required' }, { status: 400 });

    const enc = encodeURIComponent(query.trim());

    // Step 1: Resolve CID from PubChem by name (also works for CAS numbers)
    let cid = null;
    const cidRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${enc}/cids/JSON`);
    if (cidRes.ok) {
      const cidData = await cidRes.json();
      cid = cidData?.IdentifierList?.CID?.[0];
    }

    if (!cid) {
      return Response.json({
        source: 'PubChem GHS (regulatory aggregated)',
        query,
        ghs_available: false,
        message: 'No published GHS classification for this compound.'
      });
    }

    // Step 2: Fetch GHS Classification section from PUG View
    const ghsRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=GHS+Classification`);
    if (!ghsRes.ok) {
      return Response.json({
        source: 'PubChem GHS (regulatory aggregated)',
        query,
        cid,
        ghs_available: false,
        message: 'No published GHS classification for this compound.'
      });
    }

    const ghsData = await ghsRes.json();

    let signalWord = null;
    let hazardStatements = [];
    let pictograms = [];

    // Recursively find the GHS Classification section
    function findGhsSection(sections) {
      for (const s of sections) {
        if (s.TOCHeading && s.TOCHeading.toLowerCase().includes('ghs classification')) {
          return s;
        }
        if (s.Section) {
          const found = findGhsSection(s.Section);
          if (found) return found;
        }
      }
      return null;
    }

    const sections = ghsData?.Record?.Section || [];
    const ghsSection = findGhsSection(sections);

    if (ghsSection && ghsSection.Information) {
      for (const info of ghsSection.Information) {
        const name = (info.Name || '').toLowerCase();
        const strings = info.Value?.StringWithMarkup || [];
        const fullText = strings.map(s => s.String).join('\n');

        if (name.includes('pictogram')) {
          for (const swm of strings) {
            const markup = swm.Markup || [];
            for (const m of markup) {
              if (m.Property && m.Property.URL) {
                const match = m.Property.URL.match(/GHS(\d+)/);
                if (match && !pictograms.includes('GHS' + match[1])) {
                  pictograms.push('GHS' + match[1]);
                }
              }
            }
            const ghsMatch = swm.String?.match(/GHS\d+/g);
            if (ghsMatch) {
              for (const g of ghsMatch) {
                if (!pictograms.includes(g)) pictograms.push(g);
              }
            }
          }
        } else if (name.includes('signal')) {
          signalWord = fullText.trim();
        } else if (name.includes('hazard statement')) {
          const lines = fullText.split(/[\n;]+/).map(s => s.trim()).filter(Boolean);
          for (const line of lines) {
            const match = line.match(/^(H\d+[A-Za-z]*?):\s*(.+)$/);
            if (match) {
              hazardStatements.push({ code: match[1], text: match[2] });
            } else {
              const hMatch = line.match(/^(H\d+[A-Za-z]*)/);
              if (hMatch) {
                hazardStatements.push({ code: hMatch[1], text: line.substring(hMatch[1].length).replace(/^[:\s]+/, '') });
              }
            }
          }
        }
      }
    }

    const ghsAvailable = !!(signalWord || hazardStatements.length > 0 || pictograms.length > 0);

    return Response.json({
      source: 'PubChem GHS (regulatory aggregated)',
      query,
      cid,
      ghs_available: ghsAvailable,
      signal_word: signalWord,
      hazard_statements: hazardStatements,
      pictograms: pictograms
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});