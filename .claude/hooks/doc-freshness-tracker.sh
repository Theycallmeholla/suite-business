#!/bin/bash
# Documentation Freshness Tracker for Sitebango
# Monitors doc age and flags outdated content

DOC_LOG="$HOME/.claude/sitebango-doc-freshness.json"
STALE_DAYS=30  # Documents older than 30 days are flagged

# Initialize log if it doesn't exist
if [ ! -f "$DOC_LOG" ]; then
    echo '{"documents": {}, "last_check": null}' > "$DOC_LOG"
fi

# Read input
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

# Track documentation files
if [[ "$FILE_PATH" =~ \.(md|mdx)$ ]]; then
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    if [[ "$TOOL_NAME" =~ ^(Write|Edit|MultiEdit)$ ]]; then
        # Extract dates from content
        CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // ""')
        CREATED_DATE=$(echo "$CONTENT" | grep -oE '\*\*Created\*\*: [^*]+' | sed 's/\*\*Created\*\*: //')
        UPDATED_DATE=$(echo "$CONTENT" | grep -oE '\*\*Last Updated\*\*: [^*]+' | sed 's/\*\*Last Updated\*\*: //')
        
        # Update tracking
        jq --arg file "$FILE_PATH" \
           --arg time "$TIMESTAMP" \
           --arg created "$CREATED_DATE" \
           --arg updated "$UPDATED_DATE" \
           '.documents[$file] = {
               last_modified: $time,
               created_date: $created,
               updated_date: $updated,
               checked: $time
           } | .last_check = $time' "$DOC_LOG" > "$DOC_LOG.tmp" && mv "$DOC_LOG.tmp" "$DOC_LOG"
    fi
    
    # Check for stale references
    if [[ "$TOOL_NAME" == "Read" ]]; then
        # Check for outdated version numbers
        if grep -E "(Next\.js|React|TypeScript|Prisma|Tailwind)\s+[0-9]+" "$FILE_PATH" 2>/dev/null; then
            echo "📋 Version references found - verify they match package.json:" >&2
            grep -E "(Next\.js|React|TypeScript|Prisma|Tailwind)\s+[0-9]+" "$FILE_PATH" >&2
        fi
        
        # Check for broken internal links
        INTERNAL_LINKS=$(grep -oE '\[([^]]+)\]\((/[^)]+|#[^)]+)\)' "$FILE_PATH" 2>/dev/null | grep -oE '\(([^)]+)\)' | tr -d '()')
        if [ -n "$INTERNAL_LINKS" ]; then
            echo "🔗 Internal links to verify:" >&2
            echo "$INTERNAL_LINKS" | while read -r link; do
                if [[ "$link" =~ ^/ ]]; then
                    # File path link
                    if [ ! -f ".$link" ] && [ ! -d ".$link" ]; then
                        echo "  ❌ Broken link: $link" >&2
                    fi
                fi
            done
        fi
    fi
fi

# Check all docs for staleness periodically
if [[ "$TOOL_NAME" == "Read" ]] && [[ "$FILE_PATH" =~ \.md$ ]]; then
    CURRENT_DATE=$(date +%s)
    jq -r '.documents | to_entries[] | select(.value.updated_date != null) | "\(.key)|\(.value.updated_date)"' "$DOC_LOG" | while IFS='|' read -r doc date_str; do
        if [ -n "$date_str" ]; then
            # Parse the date (assuming format like "July 2025, 1:42 AM CST")
            DOC_DATE=$(date -d "$date_str" +%s 2>/dev/null || echo "0")
            if [ "$DOC_DATE" -gt 0 ]; then
                DAYS_OLD=$(( (CURRENT_DATE - DOC_DATE) / 86400 ))
                if [ "$DAYS_OLD" -gt "$STALE_DAYS" ]; then
                    echo "📅 Stale documentation ($DAYS_OLD days old): $doc" >&2
                fi
            fi
        fi
    done
fi

echo "$INPUT"