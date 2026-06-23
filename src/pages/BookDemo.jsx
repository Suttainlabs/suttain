import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BookDemo() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/BookADemo', { replace: true });
  }, [navigate]);
  return null;
}