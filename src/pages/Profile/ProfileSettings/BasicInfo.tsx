import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { FormField } from '../../../components/submit/FormField';

export function BasicInfo() {
  const [info, setInfo] = useState({
    username: 'MusicMaster',
    email: 'user@example.com',
    bio: 'Music enthusiast and AI detective',
    website: 'https://example.com'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save functionality
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Username"
        type="text"
        value={info.username}
        onChange={(e) => setInfo({ ...info, username: e.target.value })}
        required
      />

      <FormField
        label="Email"
        type="email"
        value={info.email}
        onChange={(e) => setInfo({ ...info, email: e.target.value })}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          value={info.bio}
          onChange={(e) => setInfo({ ...info, bio: e.target.value })}
          rows={4}
          className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent p-3"
          placeholder="Tell us about yourself..."
        />
      </div>

      <FormField
        label="Website"
        type="url"
        value={info.website}
        onChange={(e) => setInfo({ ...info, website: e.target.value })}
        placeholder="https://"
      />

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Changes
      </motion.button>
    </form>
  );
}