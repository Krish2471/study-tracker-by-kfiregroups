import { useState, useEffect } from 'react';
import { usePreferences } from '../store/usePreferences';

const API_URL = 'https://api.frankfurter.app/latest?from=USD';

export function useCurrency() {
  const { currency } = usePreferences();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRates() {
      try {
        const cached = localStorage.getItem('exchange-rates');
        const cacheTime = localStorage.getItem('exchange-rates-time');
        
        // Cache for 1 hour
        if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 3600000) {
          setRates(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Add USD as 1 since base is USD
        const newRates = { ...data.rates, USD: 1 };
        setRates(newRates);
        localStorage.setItem('exchange-rates', JSON.stringify(newRates));
        localStorage.setItem('exchange-rates-time', Date.now().toString());
      } catch (error) {
        console.error("Failed to fetch rates, using fallback.", error);
        // Fallback static rates if offline
        setRates({ USD: 1, EUR: 0.9, GBP: 0.8, INR: 83.0, JPY: 150.0 });
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
  }, []);

  const formatAmount = (amountInUSD: number) => {
    if (loading || !rates[currency]) return '...';
    
    const convertedAmount = amountInUSD * rates[currency];
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(convertedAmount);
  };

  const convertToUSD = (amountInLocal: number) => {
     if (loading || !rates[currency]) return amountInLocal;
     return amountInLocal / rates[currency];
  }

  return { formatAmount, convertToUSD, loading };
}
