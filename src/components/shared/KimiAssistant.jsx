
import React, { useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvokeLLM } from "@/integrations/Core";
import ReactMarkdown from "react-markdown";

export default function KimiAssistant({ prompt }) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleAnalyze = async () => {
    if (isLoading || !prompt.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      const aiResponse = await InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true
      });

      const finalResponse = aiResponse || "I apologize, but I encountered an issue processing your request. Please try rephrasing your question or try again.";
      setResponse(finalResponse);
    } catch (error) {
      console.error('Expert Analysis error:', error);
      setResponse("I'm experiencing technical difficulties with the analysis. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          Expert Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-3 text-purple-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing chemical interactions...</span>
          </div>
        ) : response ? (
          <div className="prose prose-sm max-w-none text-slate-700">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        ) : (
          <Button
            onClick={handleAnalyze}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
            disabled={!prompt.trim()}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Get Expert Analysis
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
