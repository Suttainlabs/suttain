import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, AlertTriangle, Beaker, CheckCircle2, XCircle, 
  ChevronRight, ChevronLeft, Award, RotateCcw
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AuthContext from '../auth/AuthContext';

const TUTORIALS = [
  {
    id: 'basics',
    title: 'Home Safety Basics',
    description: 'Simple tips to stay safe with everyday products',
    icon: Shield,
    color: 'bg-blue-500',
    duration: '5 min',
    level: 'Easy',
    lessons: [
      {
        title: 'Reading Warning Labels',
        content: `Product labels tell you how to use things safely. Here's what to look for:

Common Warning Symbols:
• Skull icon - Very dangerous, keep away from children
• Flame icon - Can catch fire easily
• Hand with burns - Can hurt your skin
• Exclamation mark - Use with care

Simple Tips:
• Always read the label before using any product
• Look for words like "Warning" or "Danger"
• Keep products in their original containers
• Store away from children and pets`,
        quiz: {
          question: 'What does a skull symbol on a product mean?',
          options: ['It smells bad', 'Very dangerous - keep away', 'It\'s old', 'Eco-friendly'],
          correct: 1
        }
      },
      {
        title: 'Protecting Yourself',
        content: `Simple ways to stay safe when cleaning or using products:

Basic Protection:
• Rubber gloves - Protect your hands from irritation
• Open windows - Let fresh air in when using strong cleaners
• Safety glasses - Protect eyes if splashing might happen
• Old clothes - In case of spills

Good Habits:
• Wash hands after using any cleaning products
• Don't touch your face while cleaning
• Take breaks if you feel dizzy or smell strong fumes`,
        quiz: {
          question: 'Why should you open windows when cleaning?',
          options: ['To see better', 'To let fresh air in', 'To dry surfaces faster', 'No reason'],
          correct: 1
        }
      },
      {
        title: 'Storing Products Safely',
        content: `Keep your home safe by storing products properly:

Storage Tips:
• Keep products in original bottles with labels
• Store in cool, dry places
• Keep cleaning products away from food
• Put dangerous items up high, away from kids

Never Store Together:
• Bleach and ammonia cleaners
• Different drain cleaners
• Pool chemicals near other products`,
        quiz: {
          question: 'Where should you store cleaning products?',
          options: ['Near food', 'In direct sunlight', 'Cool dry place away from kids', 'Anywhere convenient'],
          correct: 2
        }
      }
    ]
  },
  {
    id: 'mixing',
    title: 'What NOT to Mix',
    description: 'Learn which products should never be combined',
    icon: AlertTriangle,
    color: 'bg-red-500',
    duration: '5 min',
    level: 'Important',
    lessons: [
      {
        title: 'Dangerous Combinations',
        content: `Some everyday products become dangerous when mixed:

NEVER Mix These:
• Bleach + Ammonia cleaners = Toxic fumes
• Bleach + Vinegar = Harmful gas
• Bleach + Rubbing alcohol = Very toxic
• Different drain cleaners together = Can explode

Warning Signs:
• Strong unusual smell
• Smoke or bubbles
• Getting hot
• Makes you cough or eyes water

If this happens, leave the area and get fresh air!`,
        quiz: {
          question: 'What happens if you mix bleach and ammonia?',
          options: ['Cleans better', 'Creates toxic fumes', 'Nothing', 'Smells nice'],
          correct: 1
        }
      },
      {
        title: 'Safe Cleaning Practices',
        content: `How to clean safely:

One Product at a Time:
• Use one cleaner, then rinse well
• Wait before using a different product
• Never mix products to make them "stronger"

Safe Order:
1. Pick one cleaning product
2. Use it as directed
3. Rinse the surface with water
4. Wait a few minutes
5. Now you can use a different product if needed

Better Alternatives:
• Baking soda and water - Safe all-purpose cleaner
• Vinegar and water - Good for glass (but NOT with bleach!)`,
        quiz: {
          question: 'How should you use multiple cleaning products?',
          options: ['Mix them together', 'Use one at a time with rinsing between', 'Use them all at once', 'Doesn\'t matter'],
          correct: 1
        }
      }
    ]
  },
  {
    id: 'emergency',
    title: 'What To Do If Something Goes Wrong',
    description: 'Quick steps for common accidents',
    icon: Shield,
    color: 'bg-green-500',
    duration: '5 min',
    level: 'Essential',
    lessons: [
      {
        title: 'If You Spill Something',
        content: `Stay calm and follow these steps:

For Small Spills:
1. Open windows for fresh air
2. Put on rubber gloves
3. Wipe up with paper towels
4. Rinse area with water
5. Wash your hands well

For Big Spills or Strong Fumes:
1. Leave the room immediately
2. Get everyone out
3. Open windows from outside if possible
4. Call for help if needed
5. Don't go back until air is clear`,
        quiz: {
          question: 'What\'s the first thing to do for a small spill?',
          options: ['Panic', 'Open windows for fresh air', 'Ignore it', 'Call 911'],
          correct: 1
        }
      },
      {
        title: 'If It Gets On Your Skin or Eyes',
        content: `Act quickly:

On Your Skin:
• Rinse with lots of cool water for 15-20 minutes
• Remove any jewelry or clothing that got wet
• Don't rub or scratch
• See a doctor if it still hurts

In Your Eyes:
• Rinse immediately with water for 15-20 minutes
• Keep eyes open while rinsing
• Don't rub your eyes
• Get medical help right away

Breathing Problems:
• Get to fresh air immediately
• Sit down and breathe slowly
• Call for help if you feel very sick`,
        quiz: {
          question: 'How long should you rinse skin that touched a chemical?',
          options: ['30 seconds', '2 minutes', '15-20 minutes', '1 minute'],
          correct: 2
        }
      },
      {
        title: 'Emergency Numbers to Know',
        content: `Keep these handy:

Important Numbers:
• Poison Control: 1-800-222-1222
• Emergency: 911

When to Call:
• Feeling very sick after using a product
• Accidentally swallowed something
• Severe skin burns
• Can't stop coughing
• Trouble breathing

What to Tell Them:
• What product was involved
• How much was used
• What happened
• How you're feeling now`,
        quiz: {
          question: 'What is the Poison Control number?',
          options: ['911', '1-800-222-1222', '411', '311'],
          correct: 1
        }
      }
    ]
  }
];

export default function InteractiveTutorials() {
  const { user, refreshUser } = useContext(AuthContext);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [completedLessons, setCompletedLessons] = useState({});

  // Load saved progress from user profile
  useEffect(() => {
    if (user?.learning_progress?.tutorials) {
      setCompletedLessons(user.learning_progress.tutorials);
    }
  }, [user]);

  // Save progress to user profile
  const saveProgress = async (newCompletedLessons) => {
    if (!user) return;
    try {
      const currentProgress = user.learning_progress || {};
      await base44.auth.updateMe({
        learning_progress: {
          ...currentProgress,
          tutorials: newCompletedLessons
        }
      });
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Failed to save learning progress:', error);
    }
  };

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
    const isCorrect = index === selectedTutorial.lessons[currentLesson].quiz.correct;
    setQuizResult(isCorrect);
    
    if (isCorrect) {
      const key = `${selectedTutorial.id}-${currentLesson}`;
      const newCompletedLessons = { ...completedLessons, [key]: true };
      setCompletedLessons(newCompletedLessons);
      saveProgress(newCompletedLessons);
    }
  };

  const nextLesson = () => {
    if (currentLesson < selectedTutorial.lessons.length - 1) {
      setCurrentLesson(prev => prev + 1);
      setShowQuiz(false);
      setSelectedAnswer(null);
      setQuizResult(null);
    }
  };

  const prevLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(prev => prev - 1);
      setShowQuiz(false);
      setSelectedAnswer(null);
      setQuizResult(null);
    }
  };

  const resetTutorial = () => {
    setSelectedTutorial(null);
    setCurrentLesson(0);
    setShowQuiz(false);
    setSelectedAnswer(null);
    setQuizResult(null);
  };

  const getProgress = (tutorial) => {
    const completed = tutorial.lessons.filter((_, i) => 
      completedLessons[`${tutorial.id}-${i}`]
    ).length;
    return (completed / tutorial.lessons.length) * 100;
  };

  if (selectedTutorial) {
    const lesson = selectedTutorial.lessons[currentLesson];
    const progress = ((currentLesson + 1) / selectedTutorial.lessons.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Tutorial Header */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${selectedTutorial.color} rounded-lg flex items-center justify-center`}>
                  <selectedTutorial.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">{selectedTutorial.title}</h2>
                  <p className="text-sm text-slate-600">Lesson {currentLesson + 1} of {selectedTutorial.lessons.length}</p>
                </div>
              </div>
              <Button variant="outline" onClick={resetTutorial} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Exit Tutorial
              </Button>
            </div>
            <Progress value={progress} className="mt-4 h-2" />
          </CardContent>
        </Card>

        {/* Lesson Content */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-indigo-600" />
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
                  className="prose prose-slate max-w-none"
                >
                  <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                    {lesson.content.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <h4 key={i} className="font-bold text-slate-900 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                      }
                      if (line.startsWith('• **')) {
                        const [bold, rest] = line.substring(3).split('**');
                        return <p key={i} className="ml-4 mb-1">• <strong>{bold}</strong>{rest}</p>;
                      }
                      if (line.startsWith('• ')) {
                        return <p key={i} className="ml-4 mb-1">{line}</p>;
                      }
                      return <p key={i} className="mb-2">{line}</p>;
                    })}
                  </div>
                  <Button 
                    onClick={() => setShowQuiz(true)} 
                    className="mt-6 bg-indigo-600 hover:bg-indigo-700 gap-2"
                  >
                    Take Quiz <ChevronRight className="w-4 h-4" />
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
                            <span className={selectedAnswer !== null && index === lesson.quiz.correct ? 'font-semibold' : ''}>
                              {option}
                            </span>
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
                        <div className="flex items-center gap-2 text-green-700">
                          <Award className="w-5 h-5" />
                          <span className="font-semibold">Correct! Great job!</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-amber-700">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-semibold">Not quite. Review the lesson and try again!</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setShowQuiz(false);
                              setSelectedAnswer(null);
                              setQuizResult(null);
                            }}
                            className="gap-2 text-amber-700 border-amber-300 hover:bg-amber-100"
                          >
                            <ChevronLeft className="w-4 h-4" /> Back to Lesson
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
                onClick={prevLesson}
                disabled={currentLesson === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              {currentLesson < selectedTutorial.lessons.length - 1 ? (
                <Button
                  onClick={nextLesson}
                  disabled={!completedLessons[`${selectedTutorial.id}-${currentLesson}`]}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  Next Lesson <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={resetTutorial}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Award className="w-4 h-4" /> Complete Tutorial
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {TUTORIALS.map((tutorial, index) => (
        <motion.div
          key={tutorial.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer group h-full"
            onClick={() => setSelectedTutorial(tutorial)}
          >
            <CardContent className="p-6">
              <div className={`w-14 h-14 ${tutorial.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <tutorial.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{tutorial.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{tutorial.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{tutorial.level}</Badge>
                <Badge variant="secondary">{tutorial.duration}</Badge>
                <Badge variant="secondary">{tutorial.lessons.length} lessons</Badge>
              </div>
              <Progress value={getProgress(tutorial)} className="h-2" />
              <p className="text-xs text-slate-500 mt-2">{Math.round(getProgress(tutorial))}% complete</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}