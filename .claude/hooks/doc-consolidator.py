#!/usr/bin/env python3
"""
Documentation Consolidator for Sitebango
Detects duplicate/conflicting docs and suggests consolidation
"""

import json
import os
import sys
import re
from pathlib import Path
from datetime import datetime
import hashlib

class DocConsolidator:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.doc_patterns = {
            'setup': re.compile(r'(setup|install|getting.?started|quickstart)', re.I),
            'api': re.compile(r'(api|endpoint|route)', re.I),
            'config': re.compile(r'(config|environment|env|settings)', re.I),
            'architecture': re.compile(r'(architect|structure|design|overview)', re.I),
            'testing': re.compile(r'(test|spec|e2e|unit)', re.I),
            'deployment': re.compile(r'(deploy|production|docker|vps)', re.I),
        }
        
    def find_similar_docs(self):
        """Find documentation files with similar topics"""
        docs = {}
        conflicts = []
        
        # Scan for all markdown files
        for md_file in self.project_root.rglob('*.md'):
            if '.next' in str(md_file) or 'node_modules' in str(md_file):
                continue
                
            content = md_file.read_text(errors='ignore')
            file_path = str(md_file.relative_to(self.project_root))
            
            # Categorize by topic
            topics = []
            for topic, pattern in self.doc_patterns.items():
                if pattern.search(md_file.name) or pattern.search(content[:500]):
                    topics.append(topic)
            
            # Store doc info
            doc_info = {
                'path': file_path,
                'topics': topics,
                'size': len(content),
                'content_hash': hashlib.md5(content.encode()).hexdigest()[:8],
                'headings': re.findall(r'^#{1,3}\s+(.+)$', content, re.M)[:5]
            }
            
            for topic in topics:
                if topic not in docs:
                    docs[topic] = []
                docs[topic].append(doc_info)
        
        # Find potential conflicts
        for topic, doc_list in docs.items():
            if len(doc_list) > 1:
                conflicts.append({
                    'topic': topic,
                    'documents': doc_list,
                    'recommendation': self._get_consolidation_recommendation(doc_list)
                })
        
        return conflicts
    
    def _get_consolidation_recommendation(self, docs):
        """Generate consolidation recommendations"""
        if len(docs) == 2:
            # Check if one is significantly smaller (might be a stub)
            sizes = [d['size'] for d in docs]
            if min(sizes) < max(sizes) * 0.3:
                smaller = docs[0] if sizes[0] < sizes[1] else docs[1]
                larger = docs[1] if sizes[0] < sizes[1] else docs[0]
                return f"Consider merging {smaller['path']} into {larger['path']}"
        
        # Multiple docs on same topic
        paths = [d['path'] for d in docs]
        if any('onboarding' in p for p in paths) and any('docs' in p for p in paths):
            return "Move onboarding-specific docs to main /docs folder"
        
        return f"Review these {len(docs)} files for consolidation opportunity"
    
    def check_outdated_content(self):
        """Check for outdated information patterns"""
        outdated_patterns = [
            # Old versions mentioned in CLAUDE.md
            (r'Next\.js\s+15\.1\.6', 'Next.js 15.3.2'),
            (r'Prisma\s+6\.1\.0', 'Prisma 6.10.1'),
            (r'TypeScript\s+5(?!\.8)', 'TypeScript 5.8.3'),
            (r'React\s+19(?!\.1)', 'React 19.1.0'),
            (r'NextAuth(?:\.js)?\s+4\.24', 'NextAuth 5.0.0-beta.28'),
            
            # Deprecated patterns
            (r'console\.(log|error|warn)', 'logger.{level}'),
            (r'import.*axios', 'native fetch API'),
        ]
        
        findings = []
        for md_file in self.project_root.rglob('*.md'):
            if '.next' in str(md_file) or 'node_modules' in str(md_file):
                continue
                
            content = md_file.read_text(errors='ignore')
            file_path = str(md_file.relative_to(self.project_root))
            
            for old_pattern, new_value in outdated_patterns:
                matches = re.findall(old_pattern, content)
                if matches:
                    findings.append({
                        'file': file_path,
                        'pattern': old_pattern,
                        'found': matches[0] if matches else '',
                        'suggestion': f'Update to {new_value}'
                    })
        
        return findings

def main():
    # Read input from stdin
    try:
        input_data = json.load(sys.stdin)
    except:
        # If not valid JSON, just pass through
        print(json.dumps({"continue": True}))
        return
    
    # Only run on Stop events to avoid too frequent checks
    if 'stop_hook_active' in input_data and not input_data.get('stop_hook_active', False):
        consolidator = DocConsolidator(os.getcwd())
        
        # Check for similar docs
        conflicts = consolidator.find_similar_docs()
        if conflicts:
            print("\n📚 Documentation Consolidation Opportunities:", file=sys.stderr)
            for conflict in conflicts:
                print(f"\n Topic: {conflict['topic']}", file=sys.stderr)
                for doc in conflict['documents']:
                    print(f"  - {doc['path']} ({doc['size']} bytes)", file=sys.stderr)
                print(f"  💡 {conflict['recommendation']}", file=sys.stderr)
        
        # Check for outdated content
        outdated = consolidator.check_outdated_content()
        if outdated:
            print("\n⚠️  Outdated Documentation Content:", file=sys.stderr)
            for item in outdated[:5]:  # Show first 5
                print(f"  {item['file']}: {item['suggestion']}", file=sys.stderr)
    
    # Continue processing
    print(json.dumps({"continue": True}))

if __name__ == "__main__":
    main()