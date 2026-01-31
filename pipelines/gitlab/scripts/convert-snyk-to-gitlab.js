#!/usr/bin/env node
/**
 * Convert Snyk JSON output to GitLab Dependency Scanning Report format
 * 
 * Usage: node convert-snyk-to-gitlab.js <snyk-output.json> > gl-dependency-scanning-report.json
 * 
 * GitLab Report Format: https://docs.gitlab.com/ee/ci/yaml/artifacts_reports.html#artifactsreportsdependency_scanning
 */

const fs = require('fs');
const path = require('path');

// Severity mapping from Snyk to GitLab
const SEVERITY_MAP = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

// Convert Snyk vulnerability to GitLab format
function convertVulnerability(vuln, packageInfo) {
  const id = vuln.id || vuln.identifiers?.CVE?.[0] || `SNYK-${Date.now()}`;
  
  return {
    id: id,
    category: 'dependency_scanning',
    name: vuln.title || vuln.name || 'Unknown Vulnerability',
    message: vuln.title || vuln.description?.substring(0, 200) || 'Vulnerability detected',
    description: vuln.description || '',
    cve: vuln.identifiers?.CVE?.[0] || '',
    severity: SEVERITY_MAP[vuln.severity?.toLowerCase()] || 'Unknown',
    confidence: 'High',
    scanner: {
      id: 'snyk',
      name: 'Snyk',
    },
    location: {
      file: packageInfo?.manifestFile || 'package.json',
      dependency: {
        package: {
          name: vuln.packageName || vuln.moduleName || 'unknown',
        },
        version: vuln.version || 'unknown',
      },
    },
    identifiers: [
      {
        type: 'snyk',
        name: id,
        value: id,
        url: `https://snyk.io/vuln/${id}`,
      },
      ...(vuln.identifiers?.CVE || []).map(cve => ({
        type: 'cve',
        name: cve,
        value: cve,
        url: `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve}`,
      })),
      ...(vuln.identifiers?.CWE || []).map(cwe => ({
        type: 'cwe',
        name: cwe,
        value: cwe,
        url: `https://cwe.mitre.org/data/definitions/${cwe.replace('CWE-', '')}.html`,
      })),
    ],
    links: [
      {
        name: 'Snyk Vulnerability Database',
        url: `https://snyk.io/vuln/${id}`,
      },
      ...(vuln.references || []).slice(0, 5).map(ref => ({
        name: ref.title || 'Reference',
        url: ref.url,
      })),
    ],
    solution: vuln.fixedIn?.length > 0 
      ? `Upgrade to version ${vuln.fixedIn.join(' or ')}`
      : 'No fix available. Consider using an alternative package.',
    remediations: vuln.fixedIn?.length > 0 ? [{
      fixes: [{ id }],
      summary: `Upgrade ${vuln.packageName || 'package'} to version ${vuln.fixedIn[0]}`,
      diff: '', // Would need to generate actual diff
    }] : [],
  };
}

// Main conversion function
function convertSnykToGitLab(snykReport) {
  const vulnerabilities = [];
  const remediations = [];
  
  // Handle different Snyk output formats
  const vulns = snykReport.vulnerabilities || snykReport.issues || [];
  
  vulns.forEach(vuln => {
    const converted = convertVulnerability(vuln, {
      manifestFile: snykReport.projectName || snykReport.displayTargetFile || 'package.json',
    });
    vulnerabilities.push(converted);
    
    if (converted.remediations?.length > 0) {
      remediations.push(...converted.remediations);
    }
  });
  
  // Build GitLab report
  return {
    version: '15.0.0',
    vulnerabilities,
    remediations,
    scan: {
      analyzer: {
        id: 'snyk',
        name: 'Snyk',
        url: 'https://snyk.io',
        vendor: {
          name: 'Snyk Ltd',
        },
        version: snykReport.snykVersion || '1.0.0',
      },
      scanner: {
        id: 'snyk',
        name: 'Snyk',
        url: 'https://snyk.io',
        vendor: {
          name: 'Snyk Ltd',
        },
        version: snykReport.snykVersion || '1.0.0',
      },
      type: 'dependency_scanning',
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      status: 'success',
    },
    dependency_files: [
      {
        path: snykReport.displayTargetFile || 'package.json',
        package_manager: snykReport.packageManager || 'npm',
        dependencies: (snykReport.dependencyCount || vulnerabilities.length) > 0 
          ? vulnerabilities.map(v => ({
              package: { name: v.location?.dependency?.package?.name || 'unknown' },
              version: v.location?.dependency?.version || 'unknown',
            }))
          : [],
      },
    ],
  };
}

// CLI entry point
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: convert-snyk-to-gitlab.js <snyk-output.json>');
    process.exit(1);
  }
  
  const inputFile = args[0];
  
  try {
    const snykData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const gitlabReport = convertSnykToGitLab(snykData);
    console.log(JSON.stringify(gitlabReport, null, 2));
  } catch (error) {
    console.error(`Error processing file: ${error.message}`);
    process.exit(1);
  }
}

main();
