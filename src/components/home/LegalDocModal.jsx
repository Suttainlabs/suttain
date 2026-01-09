import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, FileText } from 'lucide-react';

export default function LegalDocModal({ isOpen, onClose, title, url }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl h-[90vh] flex flex-col"
        >
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <CardTitle className="text-xl font-semibold text-slate-900">
                  {title}
                </CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <iframe
                src={url}
                className="w-full h-full border-0"
                title={title}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}