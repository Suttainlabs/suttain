import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, Info } from 'lucide-react';

function scoreColor(score) {
  if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-white', label: 'Compatible' };
  if (score >= 50) return { bg: 'bg-amber-400', text: 'text-white', label: 'Caution' };
  return { bg: 'bg-red-500', text: 'text-white', label: 'Incompatible' };
}

function findPair(matrix, nameA, nameB) {
  return matrix?.find(p =>
    (p.ingredient_a === nameA && p.ingredient_b === nameB) ||
    (p.ingredient_a === nameB && p.ingredient_b === nameA)
  );
}

export default function InteractionHeatmap({ matrix, ingredients }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const cellData = useMemo(() => {
    if (!matrix || !ingredients) return null;
    const n = ingredients.length;
    const cells = [];

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          cells.push({ i, j, score: null, isSelf: true, ingredient_a: ingredients[i].name, ingredient_b: ingredients[i].name });
        } else {
          const pair = findPair(matrix, ingredients[i].name, ingredients[j].name);
          cells.push({
            i, j,
            score: pair?.score ?? 50,
            isSelf: false,
            ingredient_a: ingredients[i].name,
            ingredient_b: ingredients[j].name,
            explanation: pair?.explanation || 'No interaction data available',
            mitigation: pair?.mitigation || 'N/A'
          });
        }
      }
    }
    return { cells, n };
  }, [matrix, ingredients]);

  if (!cellData) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-8 text-center">
          <Grid3x3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Run analysis to view interaction heatmap</p>
        </CardContent>
      </Card>
    );
  }

  const { cells, n } = cellData;

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-teal-600" /> Interaction Heatmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="text-[10px] bg-emerald-100 text-emerald-700">80-100 Compatible</Badge>
            <Badge className="text-[10px] bg-amber-100 text-amber-700">50-79 Caution</Badge>
            <Badge className="text-[10px] bg-red-100 text-red-700">0-49 Incompatible</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div
            className="inline-grid gap-0.5"
            style={{ gridTemplateColumns: `120px repeat(${n}, minmax(50px, 1fr))` }}
          >
            {/* Top-left corner */}
            <div className="flex items-center justify-center p-1">
              <Grid3x3 className="w-3 h-3 text-slate-300" />
            </div>
            {/* Column headers */}
            {ingredients.map((ing, j) => (
              <div key={`col-${j}`} className="text-[10px] font-semibold text-slate-600 text-center p-1 truncate" title={ing.name}>
                {ing.name.length > 8 ? ing.name.slice(0, 7) + '...' : ing.name}
              </div>
            ))}
            {/* Rows */}
            {ingredients.map((rowIng, i) => (
              <React.Fragment key={`row-${i}`}>
                <div className="text-[10px] font-semibold text-slate-600 flex items-center p-1 truncate" title={rowIng.name}>
                  {rowIng.name.length > 12 ? rowIng.name.slice(0, 11) + '...' : rowIng.name}
                </div>
                {ingredients.map((_, j) => {
                  const cell = cells.find(c => c.i === i && c.j === j);
                  if (cell?.isSelf) {
                    return <div key={`cell-${i}-${j}`} className="bg-slate-200 flex items-center justify-center h-10 rounded-sm"><span className="text-[9px] text-slate-400">--</span></div>;
                  }
                  const colors = scoreColor(cell?.score ?? 50);
                  return (
                    <div
                      key={`cell-${i}-${j}`}
                      className={`${colors.bg} ${colors.text} flex items-center justify-center h-10 rounded-sm cursor-pointer transition-transform hover:scale-110 hover:z-10 relative`}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${cell?.ingredient_a} + ${cell?.ingredient_b}: ${cell?.score}`}
                    >
                      <span className="text-xs font-bold">{cell?.score}</span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Hovered Cell Detail */}
        {hoveredCell && !hoveredCell.isSelf && (
          <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-3.5 h-3.5 text-teal-600" />
              <p className="text-sm font-semibold text-slate-800">
                {hoveredCell.ingredient_a} + {hoveredCell.ingredient_b}
              </p>
              <Badge className={`text-[10px] ${scoreColor(hoveredCell.score).bg} ${scoreColor(hoveredCell.score).text}`}>
                {hoveredCell.score} - {scoreColor(hoveredCell.score).label}
              </Badge>
              <Badge className="text-[10px] bg-slate-100 text-slate-500">Source: AI Analysis</Badge>
            </div>
            <p className="text-xs text-slate-600">{hoveredCell.explanation}</p>
            {hoveredCell.mitigation && hoveredCell.mitigation !== 'N/A' && (
              <div className="mt-2 p-2 rounded-md bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700"><strong>Mitigation:</strong> {hoveredCell.mitigation}</p>
              </div>
            )}
          </div>
        )}

        {/* Default hint */}
        {!hoveredCell && (
          <p className="mt-3 text-xs text-center text-slate-400">Hover over any cell to view interaction details and mitigation suggestions</p>
        )}
      </CardContent>
    </Card>
  );
}