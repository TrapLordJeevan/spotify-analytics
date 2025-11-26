// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill for File.text() method in Node.js test environment
// The File API in jsdom doesn't have .text() method, so we add it
if (typeof File !== 'undefined') {
  const originalFile = File;
  File.prototype.text = function() {
    // If file has array buffer parts, concatenate them as text
    if (this._parts && Array.isArray(this._parts)) {
      const text = this._parts.map(part => {
        if (typeof part === 'string') return part;
        if (part instanceof Buffer) return part.toString('utf8');
        if (part instanceof ArrayBuffer) return Buffer.from(part).toString('utf8');
        if (typeof part === 'object' && part.toString) return part.toString();
        return String(part);
      }).join('');
      return Promise.resolve(text);
    }
    // Fallback: try to read as string
    if (this instanceof Buffer) {
      return Promise.resolve(this.toString('utf8'));
    }
    // Last resort: return empty string
    return Promise.resolve('');
  };
}

