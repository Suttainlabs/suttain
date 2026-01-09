import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QrCode, ArrowRight, Clock, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ScanCard = ({ scan }) => {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-cyan-100">
        {scan.product_image ? (
          <img src={scan.product_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <Package className="w-5 h-5 text-cyan-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{scan.product_name || 'Unknown Product'}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-mono">{scan.barcode}</span>
          {scan.ingredient_count && (
            <>
              <span>•</span>
              <span>{scan.ingredient_count} ingredients</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
        <Clock className="w-3 h-3" />
        {formatDistanceToNow(new Date(scan.created_date), { addSuffix: true })}
      </div>
    </div>
  );
};

export default function ScannedProducts({ scans, isLoading }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="w-5 h-5 text-cyan-600" />
          Scanned Products
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : scans.length > 0 ? (
          <div className="space-y-1">
            {scans.slice(0, 4).map(scan => (
              <ScanCard key={scan.id} scan={scan} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <QrCode className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No scans yet</p>
            <p className="text-xs text-slate-400">Scan your first product!</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Link to={createPageUrl("BarcodeScanner")} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            Open Scanner
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}