import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Track } from '../Challenge/types';

interface ResultsBreakdownProps {
  tracks: Track[];
  answers: boolean[];
}

export function ResultsBreakdown({ tracks, answers }: ResultsBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold">Track Breakdown</h2>
      </div>
      
      <div className="divide-y divide-gray-100">
        {tracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center p-4 hover:bg-gray-50"
          >
            <img
              src={track.imageUrl}
              alt={track.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            
            <div className="ml-4 flex-1">
              <h3 className="font-medium">{track.title}</h3>
              <p className="text-sm text-gray-600">{track.artist}</p>
            </div>
            
            <div className="text-sm font-medium text-gray-600 mx-4">
              {track.isAI ? 'AI Generated' : 'Real Artist'}
            </div>
            
            {answers[index] ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}