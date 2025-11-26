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

type YearRange = { start: number; end: number } | null;

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

  const getYearRange = (records: any[]): YearRange => {
    let min = Infinity;
    let max = -Infinity;

    for (const record of records) {
      const ts = record.ts || record.endTime;
      if (!ts) continue;
      const date = new Date(ts);
      if (isNaN(date.getTime())) continue;
      const year = date.getFullYear();
      if (year < min) min = year;
      if (year > max) max = year;
    }

    if (min === Infinity || max === -Infinity) return null;
    return { start: min, end: max };
  };

  const parseHistoryName = (name: string) => {
    const clean = name.replace(/\.[^/.]+$/, '');
    const m = clean.match(
      /^Streaming_History_(Audio|Video|Podcast)?_?(\d{4})(?:-(\d{4}))?(?:[_-](\d+))?$/i
    );
    if (!m) return null;
    return {
      media: m[1] ? m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase() : 'Audio',
      start: Number(m[2]),
      end: m[3] ? Number(m[3]) : Number(m[2]),
      part: m[4] ? Number(m[4]) : undefined,
    };
  };

  const buildSourceName = (
    file: File,
    username?: string | null,
    yearRange?: YearRange,
    fileHints?: string[]
  ) => {
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const hintParses = (fileHints || []).map((h) => parseHistoryName(h)).filter(Boolean) as Array<{
      media: string;
      start: number;
      end: number;
      part?: number;
    }>;
    const selfParse = parseHistoryName(baseName);

    const media =
      selfParse?.media ||
      hintParses.find((p) => p.media)?.media ||
      'Audio';

    const years = [
      ...(hintParses.map((p) => [p.start, p.end]).flat()),
      ...(selfParse ? [selfParse.start, selfParse.end] : []),
      ...(yearRange ? [yearRange.start, yearRange.end] : []),
    ].filter((n): n is number => typeof n === 'number' && !Number.isNaN(n));

    const startYear = years.length ? Math.min(...years) : undefined;
    const endYear = years.length ? Math.max(...years) : undefined;

    const partsFound = [
      ...(hintParses.map((p) => (typeof p.part === 'number' ? p.part : undefined)).filter(
        (n): n is number => typeof n === 'number'
      )),
      ...(selfParse && typeof selfParse.part === 'number' ? [selfParse.part] : []),
    ];

    const minPart = partsFound.length ? Math.min(...partsFound) + 1 : undefined;
    const maxPart = partsFound.length ? Math.max(...partsFound) + 1 : undefined;

    let label = media;
    if (startYear) {
      label += ` ${startYear}${endYear && endYear !== startYear ? `-${endYear}` : ''}`;
    }
    if (minPart && maxPart) {
      label += minPart === maxPart ? ` (part ${minPart})` : ` (parts ${minPart}-${maxPart})`;
    } else if (fileHints && fileHints.length > 1) {
      label += ` (${fileHints.length} files)`;
    }

    if (username) {
      return `${username} • ${label}`;
    }
    return label;
  };

  const mergeYearRanges = (ranges: Array<YearRange | undefined>): YearRange => {
    let min = Infinity;
    let max = -Infinity;
    for (const range of ranges) {
      if (!range) continue;
      if (range.start < min) min = range.start;
      if (range.end > max) max = range.end;
    }
    if (min === Infinity || max === -Infinity) return null;
    return { start: min, end: max };
  };

  const yearRangeFromHints = (hints?: string[]): YearRange => {
    if (!hints || hints.length === 0) return null;
    const years: number[] = [];
    for (const hint of hints) {
      const clean = hint.replace(/\.[^/.]+$/, '');
      const match = clean.match(/(\d{4})(?:-(\d{4}))?/);
      if (match) {
        years.push(Number(match[1]));
        if (match[2]) years.push(Number(match[2]));
      }
    }
    if (years.length === 0) return null;
    return { start: Math.min(...years), end: Math.max(...years) };
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

          let fileHints: string[] | undefined;
          const records =
            kind === 'zip'
              ? await (async () => {
                  const extracted = await extractHistoryFromZip(file);
                  fileHints = extracted.map((entry) => entry.filename);
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
          const yearRange = mergeYearRanges([getYearRange(records), yearRangeFromHints(fileHints)]);
          const name = buildSourceName(file, username, yearRange, fileHints);
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
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Something went wrong while processing your files: ${message}`);
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
