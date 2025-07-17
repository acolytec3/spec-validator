export interface LineInfo {
  line: number;
  column: number;
  path: string;
}

export function findLineForPath(jsonString: string, targetPath: string): number | undefined {
  if (!jsonString.trim() || targetPath === 'root' || targetPath === '') {
    return 1;
  }

  try {
    const lines = jsonString.split('\n');
    const pathParts = targetPath.split('/').filter(part => part !== '');

    // If no path parts, return line 1
    if (pathParts.length === 0) {
      return 1;
    }

    let currentLine = 1;
    let inString = false;
    let escapeNext = false;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      currentLine = lineIndex + 1;

      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        const char = line[charIndex];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === '\\' && inString) {
          escapeNext = true;
          continue;
        }

        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }

        if (inString) continue;

        // Look for property names in objects
        if (char === '"' && !inString) {
          const restOfLine = line.substring(charIndex);
          const propertyMatch = restOfLine.match(/^"([^"\\]*(\\.[^"\\]*)*)"(\s*):/);

          if (propertyMatch) {
            const propertyName = propertyMatch[1];
            // Check if this matches our target path
            if (targetPath === propertyName || targetPath.endsWith('/' + propertyName)) {
              return currentLine;
            }
          }
        }
      }
    }

    // If we couldn't find the exact path, try a simpler approach
    return findLineBySimpleSearch(jsonString, pathParts);
  } catch {
    return undefined;
  }
}

function findLineBySimpleSearch(jsonString: string, pathParts: string[]): number | undefined {
  const lines = jsonString.split('\n');

  // Look for the last path part as a property name
  const lastPart = pathParts[pathParts.length - 1];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Look for the property name in quotes followed by a colon
    if (line.includes(`"${lastPart}"`) && line.includes(':')) {
      return i + 1;
    }
  }

  return undefined;
}