import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, HelpCircle, BookOpen, Shield, Beaker, AlertTriangle, Lightbulb, FileText, ExternalLink,
  Home, GraduationCap
} from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    color: 'text-blue-600 bg-blue-100',
    faqs: [
      {
        question: 'What is this tool and how do I use it?',
        answer: `Our simulator helps you check if it's safe to mix different products together. It's like having a safety expert in your pocket!

How to use it:
• Pick who you are (home user, student, etc.)
• Add the products or ingredients you want to check
• Click "Run Simulation"
• Get easy-to-understand safety results

The tool will tell you if the combination is safe, risky, or dangerous, and suggest safer options if needed.`
      },
      {
        question: 'Which user type should I pick?',
        answer: `Pick the one that sounds most like you:

• Household - You're checking cleaning products at home
• DIY - You're working on craft or home projects
• Student - You're learning and exploring
• Teacher - You're planning safe demonstrations
• Researcher - You need detailed scientific info
• Business - You're creating products to sell

Don't worry about picking wrong - you can always change it!`
      },
      {
        question: 'Is this free to use?',
        answer: `Yes! Create a free account and you get:

• Unlimited safety checks
• Save your results
• Earn reward points
• Access to all basic features

You can try it once without signing up to see how it works.`
      },
      {
        question: 'Can I trust the results?',
        answer: `Our tool is great for learning and quick safety checks, but please remember:

• It's meant for education and guidance
• For serious concerns, ask a professional
• Always read product labels
• When in doubt, don't mix!

We use trusted databases and AI to give you the best information possible.`
      }
    ]
  },
  {
    id: 'safety',
    title: 'Safety Tips',
    icon: Shield,
    color: 'text-red-600 bg-red-100',
    faqs: [
      {
        question: 'What do the safety colors mean?',
        answer: `We use colors to show how risky something is:

🟢 SAFE - Go ahead, just use common sense
🟡 LOW - Be careful, follow basic precautions  
🟠 MODERATE - Take extra care, use protection
🔴 DANGEROUS - Avoid this combination
⚫ FATAL - NEVER mix these - very dangerous

When you see red or black, take it seriously!`
      },
      {
        question: 'What should I NEVER mix at home?',
        answer: `These common products are dangerous together:

❌ Bleach + Ammonia cleaners (creates toxic gas)
❌ Bleach + Vinegar (creates harmful fumes)  
❌ Bleach + Rubbing alcohol (creates toxic chemicals)
❌ Different drain cleaners (can explode or release gas)

Simple rule: Don't mix cleaning products! Use one at a time and rinse between.`
      },
      {
        question: 'What if I accidentally mix something bad?',
        answer: `Stay calm and act quickly:

1. Leave the area right away
2. Get to fresh air
3. Tell others to stay away
4. Open windows if you can do it safely
5. Call Poison Control: 1-800-222-1222
6. Call 911 if you feel very sick

Don't try to clean it up yourself if fumes are strong!`
      },
      {
        question: 'How do I stay safe when cleaning?',
        answer: `Easy tips for safe cleaning:

✓ Open windows for fresh air
✓ Wear rubber gloves
✓ Read product labels first
✓ Use one product at a time
✓ Rinse surfaces between products
✓ Store products away from kids
✓ Keep products in original bottles

Simple rule: More products ≠ cleaner. One at a time is best!`
      }
    ]
  },
  {
    id: 'features',
    title: 'Using the App',
    icon: Beaker,
    color: 'text-teal-600 bg-teal-100',
    faqs: [
      {
        question: 'What are "Safer Alternatives"?',
        answer: `When our tool finds a risky combination, it suggests safer options!

You'll see:
• Products that work just as well but are safer
• Where to buy them
• How they compare in effectiveness and price

This helps you get the job done without the risk.`
      },
      {
        question: 'How do I save my results?',
        answer: `When you're logged in, everything saves automatically!

You can:
• See past checks in your dashboard
• Run them again anytime
• Track how many you've done

Create a free account to start saving your work.`
      },
      {
        question: 'What is the barcode scanner?',
        answer: `Point your camera at any product barcode to learn about it!

The scanner shows you:
• What's in the product
• Any safety concerns
• Tips for safe use

It's a quick way to check products while shopping or at home.`
      },
      {
        question: 'How do reward points work?',
        answer: `Earn points just by using the app!

How to earn:
• Run a simulation = 5 points
• Leave a review = 5-10 points
• Complete a tutorial = varies

Points show up on your profile. Check back for ways to use them!`
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Help & Support',
    icon: AlertTriangle,
    color: 'text-amber-600 bg-amber-100',
    faqs: [
      {
        question: 'I can\'t find a product - what do I do?',
        answer: `Try these tips:

• Use a common name (like "bleach" instead of brand name)
• Check your spelling
• Try a simpler term
• Type it in manually if you don't see it in the list

We're always adding new products! Let us know what's missing.`
      },
      {
        question: 'The results are taking too long',
        answer: `Here's what to try:

• Check your internet connection
• Try fewer products at once
• Refresh the page and try again

Most checks take just 5-15 seconds. Common combinations are even faster!`
      },
      {
        question: 'Something seems wrong with my results',
        answer: `We want to get it right! Here's how to help:

• Use the feedback button after any simulation
• Tell us what seemed off
• Include which products you checked

We review all feedback to keep improving. For urgent safety questions, email contact@suttain.com`
      },
      {
        question: 'My points aren\'t showing up',
        answer: `Points should appear within a few moments. If not:

• Make sure you're logged in
• Refresh the page
• Check your profile dashboard

Still missing after 24 hours? Contact us with the date and what you did.`
      }
    ]
  }
];

const BEST_PRACTICES = [
  {
    title: 'Check Before You Mix',
    description: 'Use the simulator before combining any products at home.',
    icon: Search
  },
  {
    title: 'One Product at a Time',
    description: 'Use one cleaner, rinse well, then use another if needed.',
    icon: Beaker
  },
  {
    title: 'Open the Windows',
    description: 'Fresh air is your friend when using any strong products.',
    icon: Home
  },
  {
    title: 'Know Who to Call',
    description: 'Poison Control: 1-800-222-1222. Save it in your phone!',
    icon: AlertTriangle
  },
  {
    title: 'Read the Labels',
    description: 'Product labels have important safety info - take a quick look.',
    icon: GraduationCap
  },
  {
    title: 'Keep Products Apart',
    description: 'Store cleaning products separately and away from kids.',
    icon: FileText
  }
];

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredCategories = FAQ_CATEGORIES.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search FAQs, tips, and best practices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Best Practices Quick Tips */}
      {!searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Best Practices
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BEST_PRACTICES.map((practice, index) => (
              <motion.div
                key={practice.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white/90 backdrop-blur-sm h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <practice.icon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{practice.title}</h3>
                        <p className="text-slate-600 text-xs mt-1">{practice.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* FAQ Categories */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-500" />
          Frequently Asked Questions
        </h2>

        {filteredCategories.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">No results found</h3>
              <p className="text-slate-500 text-sm">Try different keywords or browse categories below</p>
            </CardContent>
          </Card>
        ) : (
          filteredCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                      <category.icon className="w-5 h-5" />
                    </div>
                    {category.title}
                    <Badge variant="secondary">{category.faqs.length} topics</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${category.id}-${faqIndex}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="font-medium text-slate-800">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="prose prose-sm prose-slate max-w-none pt-2">
                            {faq.answer.split('\n').map((line, i) => {
                              if (line.startsWith('**') && line.endsWith('**')) {
                                return <h4 key={i} className="font-bold text-slate-900 mt-3 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                              }
                              if (line.startsWith('• **')) {
                                const parts = line.substring(2).split('**');
                                return <p key={i} className="ml-4 mb-1">• <strong>{parts[1]}</strong>{parts[2]}</p>;
                              }
                              if (line.startsWith('• ') || line.startsWith('❌ ') || line.startsWith('✅ ')) {
                                return <p key={i} className="ml-4 mb-1">{line}</p>;
                              }
                              if (line.match(/^\d+\./)) {
                                return <p key={i} className="ml-4 mb-1">{line}</p>;
                              }
                              return line ? <p key={i} className="mb-2 text-slate-600">{line}</p> : null;
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* External Resources */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Additional Resources
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <a 
              href="https://www.osha.gov/chemical-hazards" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Shield className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-medium">OSHA Chemical Hazards</p>
                <p className="text-sm text-slate-400">Official workplace safety guidelines</p>
              </div>
            </a>
            <a 
              href="https://pubchem.ncbi.nlm.nih.gov/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Beaker className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-medium">PubChem Database</p>
                <p className="text-sm text-slate-400">Comprehensive chemical information</p>
              </div>
            </a>
            <a 
              href="https://www.cdc.gov/niosh/topics/emres/chemagent.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-medium">NIOSH Emergency Response</p>
                <p className="text-sm text-slate-400">Chemical emergency guidance</p>
              </div>
            </a>
            <a 
              href="https://www.epa.gov/saferchoice" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Home className="w-5 h-5 text-teal-400" />
              <div>
                <p className="font-medium">EPA Safer Choice</p>
                <p className="text-sm text-slate-400">Safer chemical products</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}