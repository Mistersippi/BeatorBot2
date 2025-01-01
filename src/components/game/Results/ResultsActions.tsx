import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Share2, RotateCcw } from 'lucide-react';
import { ShareModal } from './ShareModal';

interface ResultsActionsProps {
  score: number;
  total: number;
  genre: string;
}

export function ResultsActions({ score, total, genre }: ResultsActionsProps) {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);

  const handlePlayAgain = () => {
    navigate('/');
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-center items-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAgain}
          className="w-full sm:w-auto px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 flex items-center justify-center"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Play Again
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowShareModal(true)}
          className="w-full sm:w-auto px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 border-2 border-purple-600 flex items-center justify-center"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Results
        </motion.button>
      </motion.div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        score={score}
        total={total}
        genre={genre}
      />
    </div>
  );
}