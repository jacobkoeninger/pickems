import React, { useState } from 'react';
import { useAction } from 'wasp/client/operations';
import { bulkCreatePickems } from 'wasp/client/operations';
import { Button } from '../common';

interface BulkUploadFormProps {
  onClose: () => void;
  contestId: string;
}

interface PickemPrediction {
  text: string;
  owner: string | null;
}

interface BulkPickem {
  category: string;
  prediction1: PickemPrediction;
  prediction2: PickemPrediction;
}

interface BulkUploadPayload {
  contestId: number | string;
  pickems: BulkPickem[];
}

const BulkUploadForm: React.FC<BulkUploadFormProps> = ({ onClose, contestId }) => {
  const [bulkUploadText, setBulkUploadText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const bulkCreatePickemsFn = useAction(bulkCreatePickems);

  const validatePickems = (data: any): data is BulkUploadPayload => {
    if (!data || !Array.isArray(data.pickems)) return false;
    
    return data.pickems.every((pickem: BulkPickem) => {
      return (
        typeof pickem === 'object' &&
        typeof pickem.category === 'string' &&
        pickem.prediction1?.text &&
        pickem.prediction2?.text &&
        ('owner' in pickem.prediction1) &&
        ('owner' in pickem.prediction2)
      );
    });
  };

  const handleBulkUpload = async () => {
    try {
      setError('');
      if (!contestId) {
        throw new Error('No contest selected');
      }

      let data;
      try {
        data = JSON.parse(bulkUploadText);
      } catch (e) {
        throw new Error('Invalid JSON format');
      }

      // Add contestId to the data if not present
      data = {
        ...data,
        contestId: data.contestId || contestId
      };

      if (!validatePickems(data)) {
        throw new Error('Invalid format. Each pickem must have a category and two predictions with text and owner fields.');
      }

      await bulkCreatePickemsFn(data);
      onClose();
      setBulkUploadText('');
    } catch (error) {
      console.error('Failed to bulk upload pickems:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload pickems');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border-2 border-green-500 p-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] max-w-2xl w-full">
        <h3 className="text-xl font-mono mb-4 text-green-400">&gt; BULK_UPLOAD_PICKEMS</h3>
        
        {error && (
          <div className="mb-4 text-red-500 font-mono bg-red-500/10 border border-red-500/30 rounded p-3">
            [ERROR]: {error}
          </div>
        )}

        <div className="mb-4 text-sm text-green-500/70 font-mono">
          Format example:
          <pre className="mt-2 p-3 bg-black/50 border border-green-500/30 rounded overflow-x-auto">
{JSON.stringify({
  contestId: 1,
  pickems: [
    {
      category: "Category Name",
      prediction1: { text: "Choice 1", owner: "JK" },
      prediction2: { text: "Choice 2", owner: null }
    }
  ]
}, null, 2)}
          </pre>
        </div>

        <textarea 
          className="w-full h-96 p-4 bg-black text-green-500 border border-green-500 rounded font-mono focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          placeholder="Paste JSON here..."
          value={bulkUploadText}
          onChange={(e) => setBulkUploadText(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleBulkUpload();
            }
          }}
        />
        <div className="flex justify-end space-x-4 mt-4">
          <Button
            onClick={onClose}
            variant="danger"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleBulkUpload}
            variant="primary"
          >
            UPLOAD
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadForm; 