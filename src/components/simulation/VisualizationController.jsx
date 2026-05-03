import React, { useState, useRef } from 'react';
import { Plus, Trash2, Layers, Filter, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PRESET_MOLECULES = [
  { name: 'Water (H₂O)', smiles: 'O', label: 'HOH', color: '#3b82f6' },
  { name: 'Sodium Ion (Na+)', smiles: '[Na+]', label: 'NA', color: '#ef4444' },
  { name: 'Chloride Ion (Cl-)', smiles: '[Cl-]', label: 'CL', color: '#10b981' },
  { name: 'Calcium (Ca2+)', smiles: '[Ca+2]', label: 'CA', color: '#f59e0b' },
  { name: 'Methane (CH4)', smiles: 'C', label: 'CH4', color: '#8b5cf6' },
];

export default function VisualizationController({ viewerRef, viewer: viewerProp, onAddMolecule, onRemoveItem, onSeparateResidue }) {
  // Support both a ref (preferred) and a direct viewer instance
  const getViewer = () => viewerRef?.current || viewerProp || null;
  const [addedItems, setAddedItems] = useState([]);
  const [visibleLayers, setVisibleLayers] = useState(new Set(['protein']));
  const [selectedItem, setSelectedItem] = useState(null);
  const [showSeparateMode, setShowSeparateMode] = useState(false);
  const [residueChains, setResidueChains] = useState([]);
  const [selectedChain, setSelectedChain] = useState(null);
  const [selectedResidue, setSelectedResidue] = useState(null);
  const [hasProteinStructure, setHasProteinStructure] = useState(false);

  const addMolecule = async (molecule) => {
    const itemId = `${molecule.label}-${Date.now()}`;
    const newItem = {
      id: itemId,
      name: molecule.name,
      label: molecule.label,
      smiles: molecule.smiles,
      color: molecule.color,
      visible: true,
    };

    setAddedItems(prev => [...prev, newItem]);
    setSelectedItem(itemId);

    if (onAddMolecule) {
      onAddMolecule(newItem);
    }

    // Load molecule into viewer
    const v = getViewer();
    if (v && molecule.smiles) {
      try {
        const smilesUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(molecule.smiles)}/SDF`;
        const res = await fetch(smilesUrl);
        if (res.ok) {
          const molData = await res.text();
          v.addModel(molData, 'sdf');
          v.setStyle({ model: -1 }, { stick: { colorscheme: 'element' } });
          v.zoomTo();
          v.zoom(0.8);
          v.render();
        } else {
          console.warn(`PubChem fetch failed for ${molecule.smiles}`);
        }
      } catch (e) {
        console.warn('Could not load molecule into viewer:', e);
      }
    }
  };

  const removeMolecule = (itemId) => {
    setAddedItems(prev => prev.filter(item => item.id !== itemId));
    if (selectedItem === itemId) setSelectedItem(null);

    if (onRemoveItem) {
      onRemoveItem(itemId);
    }

    const v = getViewer();
    if (v) v.render();
  };

  const toggleVisibility = (itemId) => {
    setAddedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, visible: !item.visible } : item
      )
    );

    const v = getViewer();
    if (v) v.render();
  };

  const separateResidueByChain = (chainId) => {
    const isDeselecting = selectedChain === chainId;
    setSelectedChain(isDeselecting ? null : chainId);
    
    if (onSeparateResidue) {
      onSeparateResidue({ type: 'chain', value: isDeselecting ? null : chainId });
    }

    const v = getViewer();
    if (v) {
      if (isDeselecting) {
        v.setStyle({}, { cartoon: { color: 'spectrum' }, stick: { colorscheme: 'element' } });
      } else {
        v.setStyle({}, { cartoon: { color: 'gray', opacity: 0.15 }, stick: { hidden: true } });
        v.setStyle({ chain: chainId }, { cartoon: { color: 'spectrum', opacity: 1 }, stick: { colorscheme: 'element' } });
      }
      v.render();
    }
  };

  const separateByResidueType = (residueType) => {
    const isDeselecting = selectedResidue === residueType;
    setSelectedResidue(isDeselecting ? null : residueType);
    
    if (onSeparateResidue) {
      onSeparateResidue({ type: 'residue', value: isDeselecting ? null : residueType });
    }

    const v = getViewer();
    if (v) {
      if (isDeselecting) {
        v.setStyle({}, { cartoon: { color: 'spectrum' }, stick: { colorscheme: 'element' } });
      } else {
        v.setStyle({}, { cartoon: { color: 'gray', opacity: 0.15 }, stick: { hidden: true } });
        v.setStyle({ resn: residueType }, { stick: { colorscheme: 'whiteCarbon' }, cartoon: { color: 'orange', opacity: 1 } });
      }
      v.render();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setShowSeparateMode(false)}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-all ${
            !showSeparateMode
              ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Plus className="w-4 h-4 inline mr-1.5" /> Add Items
        </button>
        <button
           onClick={() => setShowSeparateMode(true)}
           className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-all ${
            showSeparateMode
              ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600'
              : 'text-slate-600 hover:bg-slate-50'
           }`}
         >
           <Layers className="w-4 h-4 inline mr-1.5" /> Residues
         </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {!showSeparateMode ? (
          <div className="space-y-4">
            {/* Preset Molecules */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2.5 block">Quick Add:</p>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_MOLECULES.map(mol => (
                  <button
                    key={mol.label}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addMolecule(mol);
                    }}
                    className="px-2.5 py-2 rounded-lg border-2 border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 transition-all text-xs font-medium text-slate-700 hover:text-blue-700 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: mol.color }}
                      />
                      <span className="truncate">{mol.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Added Items */}
            {addedItems && addedItems.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2.5 block">Active ({addedItems.length}):</p>
                <div className="space-y-1.5">
                  {addedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={`p-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedItem === item.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-500">{item.smiles}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVisibility(item.id);
                            }}
                            className="p-1 rounded hover:bg-slate-100"
                            title={item.visible ? 'Hide' : 'Show'}
                          >
                            {item.visible ? (
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMolecule(item.id);
                            }}
                            className="p-1 rounded hover:bg-red-100"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Plus className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">Click molecules above to add to scene</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chain Selection */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2.5 block">Separate by Chain:</p>
              <div className="grid grid-cols-2 gap-2">
                {['A', 'B', 'C', 'D'].map(chain => (
                   <button
                     key={chain}
                     onClick={() => separateResidueByChain(chain)}
                     className={`px-3 py-2 rounded-lg border-2 transition-all text-xs font-semibold ${
                       selectedChain === chain
                         ? 'border-purple-600 bg-purple-100 text-purple-800'
                         : 'border-slate-200 text-slate-700 hover:border-purple-400 hover:bg-purple-50'
                     }`}
                   >
                     Chain {chain}
                   </button>
                ))}
              </div>
            </div>

            {/* Residue Type Selection */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2.5 block">Highlight Residues:</p>
              <div className="grid grid-cols-2 gap-2">
                {['ALA', 'GLY', 'SER', 'ARG', 'ASP', 'LYS'].map(residue => (
                   <button
                     key={residue}
                     onClick={() => separateByResidueType(residue)}
                     className={`px-2 py-1.5 rounded border-2 text-xs font-semibold transition-all ${
                       selectedResidue === residue
                         ? 'border-purple-600 bg-purple-100 text-purple-800'
                         : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700'
                     }`}
                   >
                     {residue}
                   </button>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 text-xs text-purple-800">
              <p className="font-semibold mb-1">💡 Tip:</p>
              <p>Select chains or residue types to separate and highlight them in the 3D view.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}