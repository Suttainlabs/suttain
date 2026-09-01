import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import {
  User, Briefcase, ArrowRight, CheckCircle2,
  FlaskConical, FileText, BarChart2, Clock, Wand2, Cpu, FolderOpen
} from 'lucide-react';
import LoadFormulaModal from './LoadFormulaModal';

const PathCard = ({ icon: Icon, title, description, features, onSelect, accent }) => (
  <motion.button
    type="button"
    onClick={onSelect}
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
    className={`group text-left w-full rounded-2xl border-2 bg-white p-6 sm:p-7 transition-all duration-300 shadow-sm hover:shadow-xl ${accent.hoverBorder}`}
  >
    <div className="flex items-center gap-4 mb-5">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${accent.iconBg}`}>
        <Icon className={`w-7 h-7 ${accent.iconText}`} strokeWidth={1.75} />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-3 text-sm">
          <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${accent.checkBg}`}>
            <CheckCircle2 className={`w-4 h-4 ${accent.checkText}`} strokeWidth={2.5} />
          </span>
          <span className="text-slate-700 leading-relaxed">{feature}</span>
        </li>
      ))}
    </ul>
    <div className={`mt-6 flex items-center gap-2 font-semibold text-sm ${accent.ctaText}`}>
      Start here
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </div>
  </motion.button>
);

const RecentProjectCard = ({ formula, onClick }) => {
  const getIconByType = (type) => {
    if (type?.includes('cleaner') || type?.includes('cleaning')) return FlaskConical;
    if (type?.includes('moisturizer') || type?.includes('skincare')) return FileText;
    return BarChart2;
  };

  const Icon = getIconByType(formula.product_type);
  const isBusinessMode = formula.is_business_mode;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="cursor-pointer"
      onClick={() => onClick(formula)}
    >
      <Card className="border-2 border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isBusinessMode ? 'bg-violet-100' : 'bg-teal-100'
            }`}>
              <Icon className={`w-4 h-4 ${isBusinessMode ? 'text-violet-600' : 'text-teal-600'}`} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-bold text-slate-900 line-clamp-1">
                {formula.name}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 capitalize">
                {formula.product_type?.replace(/_/g, ' ')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`text-xs ${
              formula.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {formula.status === 'completed' ? 'Completed' : 'Draft'}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{new Date(formula.updated_date).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function GeneratorDashboard({ onModeSelect, onFormulaSelect }) {
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [recentFormulas, setRecentFormulas] = useState([]);

  const urlParams = new URLSearchParams(window.location.search);
  const fromSimulation = urlParams.get('from_simulation') === '1';
  const simMolecule = urlParams.get('molecule') || '';
  const simType = urlParams.get('sim_type') || '';
  const simStability = urlParams.get('stability') || '';

  const fromSDS = urlParams.get('source') === 'sds';
  const sdsChemical = urlParams.get('chemical') || '';

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const formulas = await base44.entities.Formula.list('-updated_date', 3);
        setRecentFormulas(formulas);
      } catch (error) {
        console.error("Failed to fetch recent formulas:", error);
      }
    };
    fetchRecent();
  }, []);

  const handleSelectAndLoad = (formula) => {
    setShowLoadModal(false);
    onFormulaSelect(formula);
  };

  return (
    <div className="space-y-10">
      {/* Contextual banners */}
      {fromSDS && sdsChemical && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3"
        >
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-teal-900 text-sm">
              Generating a safer formula for: {sdsChemical}
            </p>
            <p className="text-xs text-teal-700 mt-0.5">
              Source: SDS Analyzer: the description field will be pre-filled with a safer alternative context.
            </p>
          </div>
        </motion.div>
      )}

      {fromSimulation && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3"
        >
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-teal-900 text-sm">
              This formula was initialized from a Computational Simulation result
            </p>
            <p className="text-xs text-teal-700">
              {simMolecule && <>Molecule: <span className="font-semibold">{simMolecule}</span>, </>}
              {simType && <>Simulation type: <span className="font-semibold">{simType}</span>{simStability && `, Stability: ${simStability}`}</>}
            </p>
            <a href="/ComputationalSimulation" className="text-xs text-teal-600 hover:text-teal-800 font-semibold underline mt-1 inline-block">
              Back to Computational Simulations
            </a>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="text-center space-y-2 pt-2">
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold text-slate-900"
        >
          Formula Generator
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-base text-slate-500 max-w-xl mx-auto"
        >
          Choose your path and start creating professional-grade formulas
        </motion.p>
      </div>

      {/* Two path cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <PathCard
          icon={User}
          title="Individual Creator"
          description="For personal projects and DIY enthusiasts"
          features={[
            "Simple, easy-to-find ingredient names",
            "Beginner-friendly step-by-step instructions",
            "Small batch sizes (100g - 500g)",
            "Home kitchen equipment only",
            "Basic safety tips & usage guidance"
          ]}
          onSelect={() => onModeSelect('individual')}
          accent={{
            hoverBorder: 'hover:border-teal-400',
            iconBg: 'bg-teal-100',
            iconText: 'text-teal-600',
            checkBg: 'bg-teal-100',
            checkText: 'text-teal-600',
            ctaText: 'text-teal-700'
          }}
        />
        <PathCard
          icon={Briefcase}
          title="Business Formulation"
          description="For startups, brands, and commercial production"
          features={[
            "INCI nomenclature & CAS numbers",
            "Multi-region regulatory compliance (FDA, EU, ASEAN)",
            "Scalable batch calculations (kg to tons)",
            "Cost analysis & supplier sourcing data",
            "GMP documentation & stability testing protocols",
            "Certification guidance (Organic, Vegan, Cruelty-free)"
          ]}
          onSelect={() => onModeSelect('business')}
          accent={{
            hoverBorder: 'hover:border-violet-400',
            iconBg: 'bg-violet-100',
            iconText: 'text-violet-600',
            checkBg: 'bg-violet-100',
            checkText: 'text-violet-600',
            ctaText: 'text-violet-700'
          }}
        />
      </motion.div>

      {/* Smart Start banner */}
      <motion.button
        type="button"
        onClick={() => onModeSelect('smart_start')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full p-6 sm:p-7 rounded-2xl bg-slate-800 text-left shadow-lg hover:shadow-xl hover:bg-slate-900 transition-all duration-300 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <Wand2 className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-xl font-bold text-white">New Here? Let Us Guide You</h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-600 text-white text-xs font-semibold">
                Recommended
              </span>
            </div>
            <p className="text-white/80 text-sm">
              No chemistry knowledge needed. Answer a few simple questions and we'll create the perfect formula for you.
            </p>
          </div>
          <ArrowRight className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
      </motion.button>

      {/* Load saved project */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLoadModal(true)}
          className="text-slate-500 hover:text-slate-900"
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Load saved project
        </Button>
      </div>

      {/* Recent Projects */}
      {recentFormulas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4 pt-2"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent projects</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLoadModal(true)}
              className="text-slate-500 hover:text-slate-900"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentFormulas.map(formula => (
              <RecentProjectCard
                key={formula.id}
                formula={formula}
                onClick={handleSelectAndLoad}
              />
            ))}
          </div>
        </motion.div>
      )}

      {showLoadModal && (
        <LoadFormulaModal
          isOpen={showLoadModal}
          onClose={() => setShowLoadModal(false)}
          onSelectFormula={handleSelectAndLoad}
        />
      )}
    </div>
  );
}