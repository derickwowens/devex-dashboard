"""
MkDocs Macros for auto-updating documentation.

This module provides template variables that are automatically
populated from the project's package.json files and build metadata.
"""

import json
import os
from datetime import datetime
from pathlib import Path


def define_env(env):
    """
    Define environment variables and macros for MkDocs.
    This function is called by the mkdocs-macros plugin.
    """
    
    # Get the project root (parent of docs-site)
    docs_site_dir = Path(env.conf['docs_dir']).parent
    project_root = docs_site_dir.parent
    
    # Package versions
    versions = get_package_versions(project_root)
    env.variables['versions'] = versions
    
    # Build metadata
    build_info = get_build_info()
    env.variables['build'] = build_info
    
    # Documentation metadata
    docs_meta = get_docs_metadata(project_root)
    env.variables['docs'] = docs_meta
    
    # Define helper macros
    @env.macro
    def package_version(package_name):
        """Get version for a specific package."""
        return versions.get(package_name, 'unknown')
    
    @env.macro
    def last_updated():
        """Get the last updated timestamp."""
        return build_info['timestamp']
    
    @env.macro
    def doc_link(doc_id):
        """Get a documentation link by ID from the database."""
        return docs_meta.get('links', {}).get(doc_id, '#')


def get_package_versions(project_root):
    """
    Read version numbers from all package.json files.
    """
    versions = {}
    packages_dir = project_root / 'packages'
    
    package_mapping = {
        'core': 'core',
        'auth': 'auth',
        'error-handling': 'error_handling',
        'ui-config': 'ui_config',
        'telemetry': 'telemetry',
        'facade': 'facade',
    }
    
    for pkg_name, var_name in package_mapping.items():
        pkg_json = packages_dir / pkg_name / 'package.json'
        if pkg_json.exists():
            try:
                with open(pkg_json) as f:
                    data = json.load(f)
                    versions[var_name] = data.get('version', '0.0.0')
            except (json.JSONDecodeError, IOError):
                versions[var_name] = '0.0.0'
        else:
            versions[var_name] = '0.0.0'
    
    return versions


def get_build_info():
    """
    Get build metadata.
    In CI, this would come from environment variables.
    """
    return {
        'id': os.environ.get('BUILD_ID', f'local-{datetime.now().strftime("%Y%m%d%H%M%S")}'),
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC'),
        'branch': os.environ.get('GIT_BRANCH', 'main'),
        'commit': os.environ.get('GIT_COMMIT', 'local'),
    }


def get_docs_metadata(project_root):
    """
    Get documentation metadata from the docs database.
    This would typically query a real database in production.
    """
    # In production, this would query the documentation database
    # For now, return static metadata
    return {
        'total_pages': 15,
        'last_sync': datetime.now().isoformat(),
        'links': {
            'api-reference': '/api/facade',
            'getting-started': '/getting-started/installation',
            'architecture': '/architecture/patterns',
        }
    }
