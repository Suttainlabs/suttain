import React from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
const steps=[['overview','The molecule'],['optimize','How stable is it'],['charge','Where charge sits'],['dipole','Polarity'],['notes','Save & cite']];
export default function GuidedResultNavigation({tab,onChange,footer=false}) {
  const index=steps.findIndex(([id]) => id===tab);
  if(footer)return <div className="guided-result-pagination"><button className="guided-result-prev" disabled={index===0} onClick={() => onChange(steps[index-1][0])}><ChevronLeft size={16}/>Prev</button><button className="guided-result-next" disabled={index===steps.length-1} onClick={() => onChange(steps[index+1][0])}>Next<ChevronRight size={16}/></button></div>;
  return <nav aria-label="Calculation result steps" className="guided-result-navigation">{steps.map(([id,label],i) => <button key={id} onClick={() => onChange(id)} aria-current={tab===id ? 'step' : undefined} className={tab===id ? 'guided-result-step is-current' : 'guided-result-step'}><span className="font-mono">{i+1}</span><span>{label}</span></button>)}</nav>;
}