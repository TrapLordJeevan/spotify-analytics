import JSZip from 'jszip';

/**
 * Extract Streaming_History JSON files from a ZIP archive
 */
export async function extractHistoryFromZip(zipFile: File): Promise<{ filename: string; content: unknown[] }[]> {
  const zip = await JSZip.loadAsync(zipFile);
  const results: { filename: string; content: unknown[] }[] = [];

  // Find all files matching Streaming_History pattern
  const historyFiles = Object.keys(zip.files).filter(filename => 
    /Streaming_History.*\.json$/i.test(filename)
  );

  for (const filename of historyFiles) {
    const file = zip.files[filename];
    if (!file || file.dir) continue;

    try {
      const text = await file.async('string');
      const json = JSON.parse(text);
      
      // Handle both array and object formats
      const records = Array.isArray(json) ? json : (json.items || []);
      
      if (records.length > 0) {
        results.push({ filename, content: records });
      }
    } catch (error) {
      console.error(`Error parsing ${filename}:`, error);
    }
  }

  return results;
}

/**
 * Parse a JSON file directly
 */
export async function parseJsonFile(file: File): Promise<unknown[]> {
  const text = await file.text();
  const json = JSON.parse(text);
  
  // Handle both array and object formats
  return Array.isArray(json) ? json : (json.items || []);
}




