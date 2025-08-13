import { useState, useEffect } from 'react';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event) => setMatches(event.matches);

    // Initial check
    setMatches(mediaQueryList.matches);

    // Listen for changes
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
    } 
    // else {
    //   // Fallback for older browsers
    //   mediaQueryList.addListener(listener);
    // }

    // Cleanup
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener);
      } 
    //   else {
    //     mediaQueryList.removeListener(listener);
    //   }
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;