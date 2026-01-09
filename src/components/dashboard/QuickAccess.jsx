import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { TestTube, Atom, QrCode, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const tools = [
    {
        title: 'Chemical Simulator',
        description: 'Test chemical interactions.',
        icon: TestTube,
        color: 'from-[var(--suttain-teal)] to-[var(--suttain-blue)]',
        link: 'Simulator'
    },
    {
        title: 'Formula Generator',
        description: 'Create custom formulas.',
        icon: Atom,
        color: 'from-[var(--suttain-violet)] to-purple-400',
        link: 'generator'
    },
    {
        title: 'Product Quick Scan',
        description: 'Analyze products via barcode.',
        icon: QrCode,
        color: 'from-sky-400 to-cyan-400',
        link: 'BarcodeScanner'
    }
];

export default function QuickAccess() {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tools.map((tool) => (
                    <Link to={createPageUrl(tool.link)} key={tool.title} className="group">
                        <Card className="h-full overflow-hidden border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${tool.color} mb-4 group-hover:scale-105 transition-transform`}>
                                    <tool.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-1">{tool.title}</h3>
                                <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                                <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                                    Open
                                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}