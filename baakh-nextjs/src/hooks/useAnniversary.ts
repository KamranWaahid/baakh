import { useState, useEffect } from 'react';

interface AnniversaryData {
  poetName: { en: string; sd: string };
  avatarUrl?: string;
  anniversaryType: 'birth' | 'death';
  date: string;
  month: number;
  day: number;
  poetSlug: string;
}

export function useAnniversary() {
  const [currentAnniversary, setCurrentAnniversary] = useState<AnniversaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Ensure this only runs on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run the anniversary logic after component is mounted on client
    if (!mounted) return;

    const fetchAnniversaryData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all poets from the database
        const response = await fetch('/api/poets/?limit=1000');
        if (!response.ok) {
          throw new Error('Failed to fetch poets');
        }
        
        const data = await response.json();
        const poets = data.poets || [];
        
        // Filter poets with valid birth or death dates
        const poetsWithDates = poets.filter((poet: any) => 
          poet.birth_date || poet.death_date
        );
        
        if (poetsWithDates.length === 0) {
          setCurrentAnniversary(null);
          setIsLoading(false);
          return;
        }
        
        // Get today's actual date from the system - NOW on the client side
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();
        
        console.log('=== CLIENT SIDE DATE CHECK ===');
        console.log('Today\'s date:', today.toDateString());
        console.log('Today\'s full date:', today.toISOString());
        console.log('Current year:', currentYear, 'Month:', currentMonth, 'Day:', currentDay);
        console.log('Is client side:', typeof window !== 'undefined');
        
        // Check for today's anniversary ONLY
        let todayAnniversary: AnniversaryData | null = null;
        
        for (const poet of poetsWithDates) {
          // Check birth anniversary
          if (poet.birth_date) {
            const birthDate = new Date(poet.birth_date);
            if (!isNaN(birthDate.getTime())) {
              const birthMonth = birthDate.getMonth();
              const birthDay = birthDate.getDate();
              
              console.log(`Checking ${poet.english_name}: birth month=${birthMonth}, day=${birthDay}`);
              
              // Check if today is this poet's birth anniversary
              if (birthMonth === currentMonth && birthDay === currentDay) {
                console.log(`🎉 Found today's birth anniversary for ${poet.english_name}!`);
                todayAnniversary = {
                  poetName: { 
                    en: poet.english_name || poet.sindhi_name, 
                    sd: poet.sindhi_name || poet.english_name 
                  },
                  avatarUrl: poet.file_url || `/avatars/${poet.poet_slug || 'default'}.jpg`,
                  anniversaryType: 'birth' as const,
                  date: today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
                  month: birthMonth,
                  day: birthDay,
                  poetSlug: poet.poet_slug
                };
                break;
              }
            }
          }
          
          // Check death anniversary
          if (poet.death_date) {
            const deathDate = new Date(poet.death_date);
            if (!isNaN(deathDate.getTime())) {
              const deathMonth = deathDate.getMonth();
              const deathDay = deathDate.getDate();
              
              console.log(`Checking ${poet.english_name}: death month=${deathMonth}, day=${deathDay}`);
              
              // Check if today is this poet's death anniversary
              if (deathMonth === currentMonth && deathDay === currentDay) {
                console.log(`🕯️ Found today's death anniversary for ${poet.english_name}!`);
                todayAnniversary = {
                  poetName: { 
                    en: poet.english_name || poet.sindhi_name, 
                    sd: poet.sindhi_name || poet.english_name 
                  },
                  avatarUrl: poet.file_url || `/avatars/${poet.poet_slug || 'default'}.jpg`,
                  anniversaryType: 'death' as const,
                  date: today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
                  month: deathMonth,
                  day: deathDay,
                  poetSlug: poet.poet_slug
                };
                break;
              }
            }
          }
        }
        
        // Set the current anniversary - ONLY show if there's an anniversary today
        if (todayAnniversary) {
          console.log('✅ Setting today\'s anniversary:', todayAnniversary);
          setCurrentAnniversary(todayAnniversary);
        } else {
          console.log('📅 No anniversary found for today - hiding badge completely');
          setCurrentAnniversary(null);
        }
        
      } catch (error) {
        console.error('Error fetching anniversary data:', error);
        setCurrentAnniversary(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnniversaryData();
  }, [mounted]); // Only run when mounted changes

  return { currentAnniversary, isLoading };
}
