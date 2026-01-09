import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlayCircle, ChevronRight, ChevronLeft, CheckCircle, Beaker, FlaskConical,
  Users, Briefcase, GraduationCap, Home, Lightbulb, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import AuthContext from '../auth/AuthContext';

const WALKTHROUGHS = [
  {
    id: 'household',
    title: 'Household Chemical Safety Check',
    description: 'Learn to verify if common household products can be safely mixed',
    icon: Home,
    color: 'from-green-500 to-emerald-600',
    persona: 'Household User',
    difficulty: 'Beginner',
    steps: [
      {
        title: 'Select Your Persona',
        description: 'Start by choosing "Household User" persona to get relevant safety information for home use.',
        tip: 'The household persona focuses on common cleaning products and everyday chemicals.',
        action: 'Click on the Household User card in the persona selection screen.'
      },
      {
        title: 'Add Your First Chemical',
        description: 'Search for the first product you want to check. For example, try searching for "bleach".',
        tip: 'You can search by common names like "bleach" or scientific names like "sodium hypochlorite".',
        action: 'Type "bleach" in the search box and select it from the results.'
      },
      {
        title: 'Add a Second Chemical',
        description: 'Now add another chemical you\'re considering mixing. Try "ammonia" or "vinegar".',
        tip: 'The simulator will warn you about dangerous combinations automatically.',
        action: 'Search and add a second chemical to your simulation.'
      },
      {
        title: 'Run the Simulation',
        description: 'Click the "Simulate" button to analyze the interaction between your chemicals.',
        tip: 'The analysis includes risk scores, potential products formed, and safety recommendations.',
        action: 'Click the green "Run Simulation" button.'
      },
      {
        title: 'Understand the Results',
        description: 'Review the safety status, risk assessment, and any warnings provided.',
        tip: 'Pay special attention to the "Products Formed" section - this shows what chemicals could be created.',
        action: 'Read through all sections of the results carefully.'
      },
      {
        title: 'Explore Safer Alternatives',
        description: 'If the combination is dangerous, check the "Safer Alternatives" section for better options.',
        tip: 'Alternatives are tailored to your persona and include commercial product names.',
        action: 'Click "View Safer Alternatives" if available.'
      }
    ]
  },
  {
    id: 'research',
    title: 'Advanced Research Analysis',
    description: 'Conduct detailed chemical interaction studies with experimental parameters',
    icon: FlaskConical,
    color: 'from-purple-500 to-indigo-600',
    persona: 'Researcher',
    difficulty: 'Advanced',
    steps: [
      {
        title: 'Select Researcher Persona',
        description: 'Choose the "Researcher" persona for access to advanced analysis tools and parameters.',
        tip: 'This mode includes concentration controls, temperature settings, and detailed reaction mechanisms.',
        action: 'Click on the Researcher card in persona selection.'
      },
      {
        title: 'Add Chemicals with Parameters',
        description: 'Search for chemicals and set specific concentrations, purity levels, and volumes.',
        tip: 'Use scientific names (IUPAC) for precise matching in our database.',
        action: 'Add chemicals and configure their parameters.'
      },
      {
        title: 'Set Experimental Conditions',
        description: 'Configure temperature, pressure, and other environmental factors.',
        tip: 'Different conditions can significantly affect reaction outcomes and safety.',
        action: 'Adjust the experimental condition sliders.'
      },
      {
        title: 'Configure Safety Protocols',
        description: 'Set up appropriate safety measures based on the chemicals involved.',
        tip: 'The system will recommend PPE and containment based on your chemical selection.',
        action: 'Review and confirm safety protocols.'
      },
      {
        title: 'Analyze Results',
        description: 'Study the detailed reaction mechanism, energy profile, and product formation.',
        tip: 'Research mode includes citations to peer-reviewed sources.',
        action: 'Examine all tabs in the results section.'
      },
      {
        title: 'Generate Lab Report',
        description: 'Export a comprehensive report suitable for documentation or further study.',
        tip: 'Reports include all parameters, results, and safety recommendations.',
        action: 'Click "Generate Report" in the results section.'
      }
    ]
  },
  {
    id: 'business',
    title: 'Commercial Product Formulation',
    description: 'Evaluate chemical safety for cosmetic and skincare product development',
    icon: Briefcase,
    color: 'from-slate-700 to-slate-900',
    persona: 'Business',
    difficulty: 'Professional',
    steps: [
      {
        title: 'Select Business Persona',
        description: 'Choose the "Business" persona for commercial product formulation analysis.',
        tip: 'This mode focuses on regulatory compliance and commercial viability.',
        action: 'Click on the Business card in persona selection.'
      },
      {
        title: 'Define Your Product Category',
        description: 'Select the type of product you\'re formulating (skincare, cleaning, etc.).',
        tip: 'Different categories have different regulatory requirements.',
        action: 'Choose your product category from the dropdown.'
      },
      {
        title: 'Add Formulation Ingredients',
        description: 'Add all ingredients you plan to use in your formulation.',
        tip: 'Include both active ingredients and excipients for complete analysis.',
        action: 'Search and add all ingredients one by one.'
      },
      {
        title: 'Set Concentrations',
        description: 'Specify the percentage or concentration of each ingredient.',
        tip: 'Regulatory limits often specify maximum concentrations.',
        action: 'Enter the concentration for each ingredient.'
      },
      {
        title: 'Run Compatibility Analysis',
        description: 'Analyze how ingredients interact with each other.',
        tip: 'Some ingredients can degrade or form harmful compounds when combined.',
        action: 'Click "Analyze Formulation" button.'
      },
      {
        title: 'Review Compliance Status',
        description: 'Check regulatory compliance for your target markets.',
        tip: 'Consider using the AI Compliance Co-Pilot for detailed regulatory analysis.',
        action: 'Review the compliance section in results.'
      }
    ]
  },
  {
    id: 'teaching',
    title: 'Classroom Demonstration Setup',
    description: 'Plan safe and educational chemistry demonstrations',
    icon: GraduationCap,
    color: 'from-teal-500 to-cyan-600',
    persona: 'Teacher',
    difficulty: 'Intermediate',
    steps: [
      {
        title: 'Select Teacher Persona',
        description: 'Choose the "Teacher" persona for classroom-focused analysis.',
        tip: 'This mode emphasizes educational value and safety for classroom settings.',
        action: 'Click on the Teacher card in persona selection.'
      },
      {
        title: 'Define Learning Objectives',
        description: 'Consider what chemical principles you want to demonstrate.',
        tip: 'The simulator will highlight educational aspects of reactions.',
        action: 'Plan your demonstration goals.'
      },
      {
        title: 'Select Demo Chemicals',
        description: 'Choose chemicals that effectively demonstrate your concept safely.',
        tip: 'Start with well-known, safer reactions like baking soda and vinegar.',
        action: 'Add chemicals for your demonstration.'
      },
      {
        title: 'Verify Safety for Classroom',
        description: 'Ensure the reaction is appropriate for your teaching environment.',
        tip: 'Consider ventilation, student distance, and available safety equipment.',
        action: 'Review the safety status carefully.'
      },
      {
        title: 'Review Educational Notes',
        description: 'Check the reaction mechanism and what concepts it demonstrates.',
        tip: 'Use the "what happens" section to explain to students.',
        action: 'Study the reaction details section.'
      },
      {
        title: 'Prepare Safety Briefing',
        description: 'Use the safety information to prepare student safety briefing.',
        tip: 'Always brief students on proper observation distance and emergency procedures.',
        action: 'Note down key safety points for your class.'
      }
    ]
  }
];

export default function GuidedWalkthroughs() {
  const { user, refreshUser } = useContext(AuthContext);
  const [selectedWalkthrough, setSelectedWalkthrough] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [completedWalkthroughs, setCompletedWalkthroughs] = useState({});

  // Load saved progress from user profile
  useEffect(() => {
    if (user?.learning_progress?.walkthroughs) {
      setCompletedWalkthroughs(user.learning_progress.walkthroughs);
    }
  }, [user]);

  // When selecting a walkthrough, load its saved progress
  useEffect(() => {
    if (selectedWalkthrough && completedWalkthroughs[selectedWalkthrough.id]) {
      setCompletedSteps(completedWalkthroughs[selectedWalkthrough.id]);
    } else {
      setCompletedSteps([]);
    }
  }, [selectedWalkthrough, completedWalkthroughs]);

  // Save progress to user profile
  const saveProgress = async (walkthroughId, steps) => {
    if (!user) return;
    try {
      const currentProgress = user.learning_progress || {};
      const newWalkthroughs = {
        ...(currentProgress.walkthroughs || {}),
        [walkthroughId]: steps
      };
      await base44.auth.updateMe({
        learning_progress: {
          ...currentProgress,
          walkthroughs: newWalkthroughs
        }
      });
      setCompletedWalkthroughs(newWalkthroughs);
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Failed to save learning progress:', error);
    }
  };

  const handleStepComplete = () => {
    let newCompletedSteps = completedSteps;
    if (!completedSteps.includes(currentStep)) {
      newCompletedSteps = [...completedSteps, currentStep];
      setCompletedSteps(newCompletedSteps);
      saveProgress(selectedWalkthrough.id, newCompletedSteps);
    }
    if (currentStep < selectedWalkthrough.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const resetWalkthrough = () => {
    setSelectedWalkthrough(null);
    setCurrentStep(0);
  };

  if (selectedWalkthrough) {
    const step = selectedWalkthrough.steps[currentStep];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${selectedWalkthrough.color}`} />
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${selectedWalkthrough.color} rounded-lg flex items-center justify-center`}>
                  <selectedWalkthrough.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">{selectedWalkthrough.title}</h2>
                  <p className="text-sm text-slate-600">Step {currentStep + 1} of {selectedWalkthrough.steps.length}</p>
                </div>
              </div>
              <Button variant="outline" onClick={resetWalkthrough}>
                Exit Walkthrough
              </Button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
              {selectedWalkthrough.steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    completedSteps.includes(index)
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? `bg-gradient-to-r ${selectedWalkthrough.color} text-white`
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {completedSteps.includes(index) ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-600" />
              {step.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-700 text-lg">{step.description}</p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Pro Tip</p>
                  <p className="text-amber-700 text-sm">{step.tip}</p>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <PlayCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-teal-800">Action Required</p>
                  <p className="text-teal-700">{step.action}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              <div className="flex items-center gap-3">
                <Link to={createPageUrl('Simulator')}>
                  <Button variant="outline" className="gap-2">
                    <Beaker className="w-4 h-4" />
                    Open Simulator
                  </Button>
                </Link>

                {currentStep < selectedWalkthrough.steps.length - 1 ? (
                  <Button
                    onClick={handleStepComplete}
                    className={`gap-2 bg-gradient-to-r ${selectedWalkthrough.color} hover:opacity-90`}
                  >
                    Mark Complete & Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={resetWalkthrough}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" /> Finish Walkthrough
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {WALKTHROUGHS.map((walkthrough, index) => (
        <motion.div
          key={walkthrough.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden h-full"
            onClick={() => setSelectedWalkthrough(walkthrough)}
          >
            <div className={`h-2 bg-gradient-to-r ${walkthrough.color}`} />
            <CardContent className="p-6">
              <div className={`w-14 h-14 bg-gradient-to-br ${walkthrough.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <walkthrough.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{walkthrough.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{walkthrough.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {walkthrough.persona}
                </Badge>
                <Badge variant="secondary">{walkthrough.difficulty}</Badge>
                <Badge variant="secondary">{walkthrough.steps.length} steps</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}