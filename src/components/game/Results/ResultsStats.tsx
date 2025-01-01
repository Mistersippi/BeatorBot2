import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import type { Track } from '../Challenge/types';

interface ResultsStatsProps {
  answers: boolean[];
  tracks: Track[];
}

export function ResultsStats({ answers, tracks }: ResultsStatsProps) {
  const aiTracks = tracks.filter(track => track.isAI);
  const realTracks = tracks.filter(track => !track.isAI);
  
  const aiCorrect = answers.filter((correct, i) => correct && tracks[i].isAI).length;
  const realCorrect = answers.filter((correct, i) => correct && !tracks[i].isAI).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Bot className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold">AI Detection</h3>
        </div>
        <p className="text-3xl font-bold mb-2">
          {Math.round((aiCorrect / aiTracks.length) * 100)}%
        </p>
        <p className="text-gray-600">
          Correctly identified {aiCorrect} out of {aiTracks.length} AI tracks
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold">Real Artist Detection</h3>
        </div>
        <p className="text-3xl font-bold mb-2">
          {Math.round((realCorrect / realTracks.length) * 100)}%
        </p>
        <p className="text-gray-600">
          Correctly identified {realCorrect} out of {realTracks.length} real tracks
        </p>
      </motion.div>
    </div>
  );
}