/**
 * UploadZone handles ZIP/JSON uploads client-side, parses them, and pushes
 * structured play data into the Zustand store.
 */
'use client';

import { ChangeEvent, DragEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parsePlayRecords } from '@/lib/dataParser';
import { extractHistoryFromZip, parseJsonFile } from '@/lib/zipParser';
import { useDataStore } from '@/store/useDataStore';

interface UploadZoneProps {
  onUploadComplete?: (options: { hadExistingData: boolean }) => void;
}

type SupportedFileKind = 'zip' | 'json';

const ACCEPTED_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/json',
  'text/json',
];

// No file count limit - users can upload as many files as needed

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const router = useRouter();
  const addSource = useDataStore((state) => state.addSource);
  const addPlays = useDataStore((state) => state.addPlays);
  const hasData = useDataStore((state) => state.hasData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectFileKind = (file: File): SupportedFileKind | null => {
    if (file.name.toLowerCase().endsWith('.zip')) return 'zip';
    if (file.name.toLowerCase().endsWith('.json')) return 'json';
    if (ACCEPTED_MIME_TYPES.includes(file.type)) {
      if (file.type.includes('zip')) return 'zip';
      if (file.type.includes('json')) return 'json';
    }
    return null;
  };

  const detectUsername = (records: any[]): string | null => {
    for (const record of records) {
      if (typeof record.username === 'string') return record.username;
      if (typeof record.user_name === 'string') return record.user_name;
      if (typeof record.platformUserName === 'string') return record.platformUserName;
      if (typeof record.accountName === 'string') return record.accountName;
    }
    return null;
  };

  const buildSourceName = (file: File, username?: string | null) => {
    if (username) {
      return `${username}`;
    }
    return file.name.replace(/\.(zip|json)$/i, '');
  };

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setIsProcessing(true);
      setStatus(null);
      setError(null);

      const previouslyHadData = hasData();
      let totalPlaysAdded = 0;
      let totalSourcesAdded = 0;

      try {
        for (const file of files) {
          const kind = detectFileKind(file);
          if (!kind) {
            setError(`Unsupported file: ${file.name}`);
            continue;
          }

          const records =
            kind === 'zip'
              ? await (async () => {
                  const extracted = await extractHistoryFromZip(file);
                  return extracted.flatMap((entry) => entry.content ?? []);
                })()
              : await parseJsonFile(file);

          if (!records || records.length === 0) {
            continue;
          }

          const sourceId =
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `source-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const username = detectUsername(records);
          const name = buildSourceName(file, username);
          const plays = parsePlayRecords(records, sourceId);

          if (plays.length === 0) {
            continue;
          }

          addSource({
            id: sourceId,
            name,
            detectedUsername: username,
            enabled: true,
          });
          addPlays(plays);

          totalSourcesAdded += 1;
          totalPlaysAdded += plays.length;
        }

        if (totalPlaysAdded > 0) {
          const sourceLabel = totalSourcesAdded === 1 ? 'source' : 'sources';
          setStatus(
            `Imported ${totalPlaysAdded.toLocaleString()} plays from ${totalSourcesAdded} ${sourceLabel}.`
          );

          onUploadComplete?.({ hadExistingData: previouslyHadData });
          if (!previouslyHadData) {
            router.push('/overview');
          }
        } else {
          setStatus('No new plays found in the uploaded files.');
        }
      } catch (err) {
        console.error(err);
        setError('Something went wrong while processing your files.');
      } finally {
        setIsProcessing(false);
      }
    },
    [addPlays, addSource, hasData, onUploadComplete, router]
  );

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;
    handleFiles(Array.from(fileList));
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const fileList = event.dataTransfer.files;
    if (!fileList) return;
    handleFiles(Array.from(fileList));
  };

  const preventDefaults = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="space-y-4">
      <div
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-6 py-10 text-center transition hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
        onDrop={handleDrop}
        onDragEnter={preventDefaults}
        onDragOver={preventDefaults}
      >
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Drop your Spotify ZIP or JSON files here
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          We process everything locally in your browser. Nothing ever leaves your device.
        </p>
        <label className="mt-6 inline-flex cursor-pointer items-center rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
          {isProcessing ? 'Processing…' : 'Select files'}
          <input
            type="file"
            className="hidden"
            accept=".zip,.json,application/zip,application/json"
            multiple
            disabled={isProcessing}
            onChange={handleInput}
          />
        </label>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          Supports Spotify{"'"}s Streaming History ZIPs or raw Streaming_History*.json files.
        </p>
      </div>

      {status && (
        <div className="rounded-md border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-200">
          {status}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-rose-100 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 px-4 py-3 text-sm text-rose-900 dark:text-rose-200">
          {error}
        </div>
      )}
    </div>
  );
}


