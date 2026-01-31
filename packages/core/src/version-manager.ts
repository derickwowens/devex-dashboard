/**
 * Version management for the SDK ecosystem.
 * Implements cascading version updates when child SDKs change.
 */

export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
}

export class VersionManager {
  private parentVersion: SemanticVersion;
  private childVersions: Map<string, SemanticVersion> = new Map();
  private versionHistory: Array<{
    timestamp: Date;
    parentVersion: string;
    childVersions: Record<string, string>;
    reason: string;
  }> = [];

  constructor(initialVersion: string = '1.0.0') {
    this.parentVersion = this.parse(initialVersion);
  }

  /**
   * Parse a semantic version string into components.
   */
  parse(version: string): SemanticVersion {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    if (!match) {
      throw new Error(`Invalid semantic version: ${version}`);
    }
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4],
    };
  }

  /**
   * Convert a semantic version to string.
   */
  stringify(version: SemanticVersion): string {
    const base = `${version.major}.${version.minor}.${version.patch}`;
    return version.prerelease ? `${base}-${version.prerelease}` : base;
  }

  /**
   * Register a child SDK version.
   */
  registerChild(name: string, version: string): void {
    this.childVersions.set(name, this.parse(version));
  }

  /**
   * Update a child SDK version and cascade to parent if needed.
   * Returns the new parent version if it changed.
   */
  updateChild(
    name: string, 
    newVersion: string, 
    changeType: 'major' | 'minor' | 'patch'
  ): string {
    const oldVersion = this.childVersions.get(name);
    const newParsed = this.parse(newVersion);
    
    this.childVersions.set(name, newParsed);
    
    // Cascade version bump to parent
    const previousParent = this.stringify(this.parentVersion);
    
    switch (changeType) {
      case 'major':
        // Child major bump → Parent minor bump (breaking change in ecosystem)
        this.parentVersion.minor += 1;
        this.parentVersion.patch = 0;
        break;
      case 'minor':
        // Child minor bump → Parent patch bump
        this.parentVersion.patch += 1;
        break;
      case 'patch':
        // Child patch bump → Parent patch bump
        this.parentVersion.patch += 1;
        break;
    }
    
    const newParent = this.stringify(this.parentVersion);
    
    // Record history
    this.versionHistory.push({
      timestamp: new Date(),
      parentVersion: newParent,
      childVersions: this.getChildVersionsSnapshot(),
      reason: `Child SDK '${name}' updated from ${oldVersion ? this.stringify(oldVersion) : 'new'} to ${newVersion} (${changeType})`,
    });
    
    return newParent;
  }

  /**
   * Get current parent SDK version.
   */
  getParentVersion(): string {
    return this.stringify(this.parentVersion);
  }

  /**
   * Get all child SDK versions.
   */
  getChildVersions(): Record<string, string> {
    return this.getChildVersionsSnapshot();
  }

  /**
   * Get version history for auditing.
   */
  getHistory(): typeof this.versionHistory {
    return [...this.versionHistory];
  }

  /**
   * Check if a version satisfies a version range.
   */
  satisfies(version: string, range: string): boolean {
    const v = this.parse(version);
    
    // Simple range parsing: ^1.0.0, ~1.0.0, >=1.0.0, etc.
    if (range.startsWith('^')) {
      const min = this.parse(range.slice(1));
      return v.major === min.major && 
             (v.minor > min.minor || (v.minor === min.minor && v.patch >= min.patch));
    }
    
    if (range.startsWith('~')) {
      const min = this.parse(range.slice(1));
      return v.major === min.major && 
             v.minor === min.minor && 
             v.patch >= min.patch;
    }
    
    if (range.startsWith('>=')) {
      const min = this.parse(range.slice(2));
      return this.compare(v, min) >= 0;
    }
    
    // Exact match
    return version === range;
  }

  /**
   * Compare two versions. Returns -1, 0, or 1.
   */
  compare(a: SemanticVersion, b: SemanticVersion): number {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
  }

  private getChildVersionsSnapshot(): Record<string, string> {
    const snapshot: Record<string, string> = {};
    this.childVersions.forEach((version, name) => {
      snapshot[name] = this.stringify(version);
    });
    return snapshot;
  }
}
