#!/bin/bash
# Technical Debt Scanner for Sitebango
# Tracks TODOs, FIXMEs, duplicated code, and other debt indicators

DEBT_LOG="$HOME/.claude/sitebango-tech-debt.json"
PROJECT_ROOT="$(pwd)"

# Initialize debt log if it doesn't exist
if [ ! -f "$DEBT_LOG" ]; then
    echo '{"debts": [], "last_scan": null}' > "$DEBT_LOG"
fi

# Read input
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

# Only process file operations
if [[ "$TOOL_NAME" =~ ^(Write|Edit|MultiEdit)$ ]] && [ -n "$FILE_PATH" ]; then
    # Scan for debt indicators
    DEBT_FOUND=false
    DEBT_ITEMS=()
    
    # Check for TODOs and FIXMEs
    if grep -n "TODO\|FIXME\|HACK\|XXX" "$FILE_PATH" 2>/dev/null; then
        DEBT_FOUND=true
        while IFS= read -r line; do
            DEBT_ITEMS+=("$(echo "$line" | jq -R -s '.')")
        done < <(grep -n "TODO\|FIXME\|HACK\|XXX" "$FILE_PATH" 2>/dev/null)
    fi
    
    # Check for console.log statements
    if grep -n "console\." "$FILE_PATH" 2>/dev/null | grep -v "logger"; then
        DEBT_FOUND=true
        echo "⚠️  Found console statements - should use logger.ts" >&2
    fi
    
    # Check for any/unknown types in TypeScript files
    if [[ "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
        if grep -n ": any\|: unknown" "$FILE_PATH" 2>/dev/null; then
            DEBT_FOUND=true
            echo "⚠️  Found untyped code (any/unknown)" >&2
        fi
    fi
    
    # Check for duplicated strings/magic numbers
    if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
        # Find strings that appear more than 3 times
        DUPLICATES=$(grep -o '"[^"]\{10,\}"' "$FILE_PATH" 2>/dev/null | sort | uniq -c | awk '$1 > 3 {print $2}')
        if [ -n "$DUPLICATES" ]; then
            DEBT_FOUND=true
            echo "⚠️  Found duplicated strings that should be constants:" >&2
            echo "$DUPLICATES" >&2
        fi
    fi
    
    # Update debt log
    if [ "$DEBT_FOUND" = true ]; then
        TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        jq --arg file "$FILE_PATH" \
           --arg time "$TIMESTAMP" \
           --argjson items "$(printf '%s\n' "${DEBT_ITEMS[@]}" | jq -s '.')" \
           '.debts += [{
               file: $file,
               timestamp: $time,
               items: $items
           }] | .last_scan = $time' "$DEBT_LOG" > "$DEBT_LOG.tmp" && mv "$DEBT_LOG.tmp" "$DEBT_LOG"
        
        echo "📊 Technical debt logged to $DEBT_LOG"
    fi
fi

# Pass through the input
echo "$INPUT"