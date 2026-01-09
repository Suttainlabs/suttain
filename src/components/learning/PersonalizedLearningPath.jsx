import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, AlertTriangle, Beaker, Atom, CheckCircle2, XCircle, 
  ChevronRight, ChevronLeft, Award, Sparkles, FlaskConical,
  GraduationCap, BookOpen, Microscope, Building2, Home, Hammer,
  Trophy, Lock, ArrowRight, RotateCcw, Target,
  Clock, Zap, FileCheck, TestTube
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AuthContext from '../auth/AuthContext';
import { LEARNING_MODULES, LEARNING_PATHS, getRecommendedModules, calculateSkillLevel } from './learningPathData';
import { sendLearningCompletionEmail } from './useLearningProgress';
import { toast } from 'sonner';

const ICON_MAP = {
  Shield, AlertTriangle, Beaker, Atom, FlaskConical, GraduationCap,
  BookOpen, Microscope, Building2, Home, Hammer, FileCheck, TestTube
};

const PersonaCard = ({ persona, path, isSelected, onSelect }) => {
  const Icon = ICON_MAP[path.icon] || BookOpen;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(persona)}
      className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-bold text-slate-900">{path.name}</h3>
      <p className="text-sm text-slate-600 mt-1">{path.description}</p>
      <div className="mt-3 flex items-center gap-2">
        <Badge variant="secondary">{path.modules.length} modules</Badge>
        {isSelected && <Badge className="bg-indigo-600">Selected</Badge>}
      </div>
    </motion.div>
  );
};

const ModuleCard = ({ module, isCompleted, isLocked, onStart, progress }) => {
  const Icon = ICON_MAP[module.icon] || Beaker;
  
  return (
    <Card className={`relative overflow-hidden transition-all ${
      isLocked ? 'opacity-60' : 'hover:shadow-lg'
    }`}>
      {isCompleted && (
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
      {isLocked && (
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      <CardContent className="p-5">
        <div className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-bold text-slate-900 mb-1">{module.title}</h3>
        <p className="text-sm text-slate-600 mb-3">{module.description}</p>
        
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className="capitalize">{module.level}</Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {module.duration}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="w-3 h-3" /> {module.points} pts
          </Badge>
        </div>

        {progress > 0 && progress < 100 && (
          <div className="mb-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-slate-500 mt-1">{progress}% complete</p>
          </div>
        )}

        <Button 
          onClick={() => onStart(module)}
          disabled={isLocked}
          className={`w-full ${isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          {isLocked ? 'Complete prerequisites first' : isCompleted ? 'Review Module' : 'Start Module'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>

        {module.certification && (
          <p className="text-xs text-center text-slate-500 mt-2">
            🏆 Earns: {module.certification.name}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const CertificationBadge = ({ cert }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-xl p-4 text-center"
  >
    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mb-3">
      <Trophy className="w-8 h-8 text-white" />
    </div>
    <h4 className="font-bold text-amber-900">{cert.name}</h4>
    <p className="text-xs text-amber-700 mt-1">Score: {cert.score}%</p>
    <p className="text-xs text-amber-600">{new Date(cert.earned_date).toLocaleDateString()}</p>
  </motion.div>
);

export default function PersonalizedLearningPath() {
  const { user, refreshUser } = useContext(AuthContext);
  const [learningProgress, setLearningProgress] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);

  // Load learning progress
  useEffect(() => {
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      const progress = await base44.entities.LearningProgress.filter({});
      if (progress.length > 0) {
        setLearningProgress(progress[0]);
        setSelectedPersona(progress[0].persona);
      } else {
        setShowPersonaSelector(true);
      }
    } catch (error) {
      console.error('Failed to load learning progress:', error);
      setShowPersonaSelector(true);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPersona = async (persona) => {
    setSelectedPersona(persona);
    setShowPersonaSelector(false);
    
    if (!user) return;

    try {
      const existingProgress = await base44.entities.LearningProgress.filter({});
      
      if (existingProgress.length > 0) {
        await base44.entities.LearningProgress.update(existingProgress[0].id, { persona });
        setLearningProgress({ ...existingProgress[0], persona });
      } else {
        const newProgress = await base44.entities.LearningProgress.create({
          persona,
          skill_level: 'beginner',
          completed_modules: [],
          completed_quizzes: [],
          certifications: [],
          total_points: 0,
          streak_days: 0,
          recommended_path: LEARNING_PATHS[persona]?.modules || [],
          usage_stats: { simulations_run: 0, formulas_created: 0, scans_completed: 0 }
        });
        setLearningProgress(newProgress);
      }
    } catch (error) {
      console.error('Failed to save persona:', error);
    }
  };

  const startModule = (module) => {
    setActiveModule(module);
    setCurrentLesson(0);
    setShowQuiz(false);
    setSelectedAnswer(null);
    setQuizResult(null);
  };

  const handleAnswerSelect = async (index) => {
    setSelectedAnswer(index);
    const lesson = activeModule.lessons[currentLesson];
    const isCorrect = index === lesson.quiz.correct;
    setQuizResult(isCorrect);

    if (isCorrect && user && learningProgress) {
      // Update quiz scores
      const quizRecord = {
        module_id: activeModule.id,
        quiz_id: lesson.id,
        score: 100,
        attempts: 1,
        completed_date: new Date().toISOString()
      };

      const updatedQuizzes = [...(learningProgress.completed_quizzes || []), quizRecord];
      
      try {
        await base44.entities.LearningProgress.update(learningProgress.id, {
          completed_quizzes: updatedQuizzes,
          last_activity_date: new Date().toISOString()
        });
        setLearningProgress(prev => ({ ...prev, completed_quizzes: updatedQuizzes }));
      } catch (error) {
        console.error('Failed to save quiz progress:', error);
      }
    }
  };

  const nextLesson = () => {
    if (currentLesson < activeModule.lessons.length - 1) {
      setCurrentLesson(prev => prev + 1);
      setShowQuiz(false);
      setSelectedAnswer(null);
      setQuizResult(null);
    }
  };

  const completeModule = async () => {
    if (!user || !learningProgress) {
      setActiveModule(null);
      return;
    }

    try {
      const updatedModules = [...(learningProgress.completed_modules || []), activeModule.id];
      const newPoints = (learningProgress.total_points || 0) + activeModule.points;
      const newSkillLevel = calculateSkillLevel(updatedModules, learningProgress.completed_quizzes || []);
      
      const updateData = {
        completed_modules: updatedModules,
        total_points: newPoints,
        skill_level: newSkillLevel,
        last_activity_date: new Date().toISOString()
      };

      // Check for certification
      if (activeModule.certification) {
        const avgScore = (learningProgress.completed_quizzes || [])
          .filter(q => q.module_id === activeModule.id)
          .reduce((sum, q) => sum + q.score, 0) / activeModule.lessons.length;

        if (avgScore >= activeModule.certification.passingScore) {
          const cert = {
            certification_id: activeModule.certification.id,
            name: activeModule.certification.name,
            earned_date: new Date().toISOString(),
            score: Math.round(avgScore)
          };
          updateData.certifications = [...(learningProgress.certifications || []), cert];
          
          toast.success(`🏆 Certification Earned: ${cert.name}!`);
          
          // Send completion email
          sendLearningCompletionEmail(user, activeModule.title);
        }
      }

      await base44.entities.LearningProgress.update(learningProgress.id, updateData);
      setLearningProgress(prev => ({ ...prev, ...updateData }));
      
      // Award user reward points
      try {
        const currentPoints = user.reward_points || 0;
        await base44.auth.updateMe({ reward_points: currentPoints + activeModule.points });
        if (refreshUser) refreshUser();
        toast.success(`+${activeModule.points} points earned!`);
      } catch (e) {
        console.error('Failed to award points:', e);
      }

    } catch (error) {
      console.error('Failed to complete module:', error);
    }

    setActiveModule(null);
  };

  const isModuleLocked = (module) => {
    if (!learningProgress) return true;
    return !module.prerequisites.every(p => 
      (learningProgress.completed_modules || []).includes(p)
    );
  };

  const isModuleCompleted = (moduleId) => {
    return (learningProgress?.completed_modules || []).includes(moduleId);
  };

  const getModuleProgress = (module) => {
    if (!learningProgress) return 0;
    const completedQuizzes = (learningProgress.completed_quizzes || [])
      .filter(q => q.module_id === module.id).length;
    return Math.round((completedQuizzes / module.lessons.length) * 100);
  };

  // Get recommended modules
  const recommendations = selectedPersona ? getRecommendedModules(
    selectedPersona,
    learningProgress?.completed_modules || [],
    learningProgress?.completed_quizzes || [],
    learningProgress?.usage_stats || {}
  ) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Persona Selection
  if (showPersonaSelector || !selectedPersona) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Learning Path</h2>
          <p className="text-slate-600">Select the path that best matches your goals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(LEARNING_PATHS).map(([key, path]) => (
            <PersonaCard
              key={key}
              persona={key}
              path={path}
              isSelected={selectedPersona === key}
              onSelect={selectPersona}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Active Module View
  if (activeModule) {
    const lesson = activeModule.lessons[currentLesson];
    const Icon = ICON_MAP[activeModule.icon] || Beaker;
    const progress = ((currentLesson + 1) / activeModule.lessons.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Module Header */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${activeModule.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">{activeModule.title}</h2>
                  <p className="text-sm text-slate-600">Lesson {currentLesson + 1} of {activeModule.lessons.length}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setActiveModule(null)}>
                <RotateCcw className="w-4 h-4 mr-2" /> Exit
              </Button>
            </div>
            <Progress value={progress} className="mt-4 h-2" />
          </CardContent>
        </Card>

        {/* Lesson Content */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              {lesson.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {!showQuiz ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="prose prose-slate max-w-none whitespace-pre-line">
                    {lesson.content.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <h4 key={i} className="font-bold text-slate-900 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                      }
                      if (line.startsWith('• ')) {
                        return <p key={i} className="ml-4 mb-1">{line}</p>;
                      }
                      return <p key={i} className="mb-2 text-slate-700">{line}</p>;
                    })}
                  </div>
                  <Button 
                    onClick={() => setShowQuiz(true)}
                    className="mt-6 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Take Quiz <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-900 mb-4">{lesson.quiz.question}</h4>
                    <div className="space-y-2">
                      {lesson.quiz.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => selectedAnswer === null && handleAnswerSelect(index)}
                          disabled={selectedAnswer !== null}
                          className={`w-full p-3 rounded-lg text-left transition-all ${
                            selectedAnswer === null
                              ? 'bg-white hover:bg-indigo-100 border border-slate-200'
                              : index === lesson.quiz.correct
                              ? 'bg-green-100 border-2 border-green-500'
                              : selectedAnswer === index
                              ? 'bg-red-100 border-2 border-red-500'
                              : 'bg-white border border-slate-200 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {selectedAnswer !== null && index === lesson.quiz.correct && (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            )}
                            {selectedAnswer === index && index !== lesson.quiz.correct && (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span>{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {quizResult !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg ${quizResult ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}
                    >
                      {quizResult ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-green-700">
                            <Award className="w-5 h-5" />
                            <span className="font-semibold">Correct!</span>
                          </div>
                          {lesson.quiz.explanation && (
                            <p className="text-sm text-green-600">{lesson.quiz.explanation}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-amber-700 font-semibold">Not quite. Review and try again!</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setShowQuiz(false);
                              setSelectedAnswer(null);
                              setQuizResult(null);
                            }}
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentLesson > 0) {
                    setCurrentLesson(prev => prev - 1);
                    setShowQuiz(false);
                    setSelectedAnswer(null);
                    setQuizResult(null);
                  }
                }}
                disabled={currentLesson === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              {currentLesson < activeModule.lessons.length - 1 ? (
                <Button
                  onClick={nextLesson}
                  disabled={!quizResult}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Next Lesson <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={completeModule}
                  disabled={!quizResult}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Trophy className="w-4 h-4 mr-2" /> Complete Module
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Main Learning Dashboard
  const path = LEARNING_PATHS[selectedPersona];
  const PathIcon = ICON_MAP[path.icon] || BookOpen;
  const completedCount = (learningProgress?.completed_modules || []).length;
  const totalModules = path.modules.length;
  const overallProgress = (completedCount / totalModules) * 100;

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <PathIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{path.name}</h2>
                <p className="text-indigo-100">{path.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className="bg-white/20 text-white capitalize">
                    {learningProgress?.skill_level || 'beginner'}
                  </Badge>
                  <span className="text-sm text-indigo-100">
                    {learningProgress?.total_points || 0} points earned
                  </span>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => setShowPersonaSelector(true)}
            >
              Change Path
            </Button>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-indigo-100">Overall Progress</span>
              <span className="font-bold">{completedCount}/{totalModules} modules</span>
            </div>
            <Progress value={overallProgress} className="h-3 bg-white/20" />
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      {learningProgress?.certifications?.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Your Certifications
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {learningProgress.certifications.map((cert, i) => (
              <CertificationBadge key={i} cert={cert} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Recommended For You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map(module => (
              <Card key={module.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="p-4">
                  <Badge className="bg-indigo-100 text-indigo-700 mb-2">{module.reason}</Badge>
                  <h4 className="font-bold text-slate-900">{module.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{module.description}</p>
                  <Button 
                    size="sm" 
                    className="mt-3 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => startModule(module)}
                    disabled={isModuleLocked(module)}
                  >
                    Start <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Modules */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-slate-600" />
          Your Learning Path
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {path.modules.map(moduleId => {
            const module = LEARNING_MODULES[moduleId];
            if (!module) return null;
            return (
              <ModuleCard
                key={moduleId}
                module={module}
                isCompleted={isModuleCompleted(moduleId)}
                isLocked={isModuleLocked(module)}
                onStart={startModule}
                progress={getModuleProgress(module)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}