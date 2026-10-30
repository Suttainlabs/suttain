// Redirects to the Carbon Ledger
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CarbonOpportunitySimulator() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/CarbonTaxSimulator', { replace: true }); }, [navigate]);
  return null;
}