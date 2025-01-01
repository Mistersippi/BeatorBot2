import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Track, GameState, ProgressStats } from './types';
import { AudioPlayer } from './AudioPlayer';
import { ProgressTracker } from './ProgressTracker';
import { GuessButtons } from './GuessButtons';
import { mockTracks } from './mockData';

const TOTAL_TRACKS = 5; // Reduced for demo purposes

export function Challenge() {
  const location = useLocation();
  const navigate = useNavigate();
  const genre = location.state?.genre;

  const [gameState, setGameState] = useState<GameState>({
    currentTrack: 0,
    score: 0,
    totalTracks: TOTAL_TRACKS,
    answers: [],
  });

  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!genre) {
      navigate('/');
      return;
    }

    // Simulate API call to fetch tracks
    setIsLoading(true);
    setTimeout(() => {
      setTracks(mockTracks);
      setIsLoading(false);
    }, 1000);
  }, [genre, navigate]);

  const currentTrack = tracks[gameState.currentTrack];
  const isGameComplete = gameState.currentTrack === TOTAL_TRACKS;

  const stats: ProgressStats = {
    correct: gameState.score,
    total: gameState.totalTracks,
    percentage: Math.round((gameState.score / Math.max(1, gameState.answers.length)) * 100),
  };

  useEffect(() => {
    if (isGameComplete && tracks.length > 0) {
      navigate('/results', {
        state: {
          tracks,
          answers: gameState.answers,
          score: gameState.score,
          genre: genre.name,
        },
      });
    }
  }, [isGameComplete, tracks.length, gameState.answers, gameState.score, genre, navigate]);

  const handleGuess = (isAIGuess: boolean) => {
    if (!currentTrack) return;
    
    const isCorrect = isAIGuess === currentTrack.isAI;
    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      currentTrack: prev.currentTrack + 1,
      answers: [...prev.answers, isCorrect],
    }));
  };

  if (!genre) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-purple-200 rounded w-48 mx-auto mb-4" />
            <div className="h-64 bg-purple-100 rounded-2xl mb-8" />
            <div className="flex justify-center space-x-4">
              <div className="h-12 w-32 bg-purple-200 rounded-xl" />
              <div className="h-12 w-32 bg-purple-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <ProgressTracker stats={stats} />
          {!isGameComplete && currentTrack && (
            <>
              <AudioPlayer track={currentTrack} />
              <GuessButtons onGuess={handleGuess} />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}