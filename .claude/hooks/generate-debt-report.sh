#!/bin/bash
# Generate weekly technical debt and documentation health report

DEBT_LOG="$HOME/.claude/sitebango-tech-debt.json"
DOC_LOG="$HOME/.claude/sitebango-doc-freshness.json"
REPORT_DIR="$HOME/.claude/sitebango-reports"
TODAY=$(date +%Y-%m-%d)

mkdir -p "$REPORT_DIR"

cat > "$REPORT_DIR/report-$TODAY.md" << EOF
# Sitebango Technical Debt & Documentation Report
**Generated**: $(date)

## 📊 Technical Debt Summary

EOF

# Analyze tech debt
if [ -f "$DEBT_LOG" ]; then
    echo "### Recent Debt Items" >> "$REPORT_DIR/report-$TODAY.md"
    jq -r '.debts[-10:] | reverse | .[] | "- \(.file): \(.items | length) issues"' "$DEBT_LOG" >> "$REPORT_DIR/report-$TODAY.md"
    
    # Count by type
    echo -e "\n### Debt by Type" >> "$REPORT_DIR/report-$TODAY.md"
    jq -r '.debts | map(.items[]) | group_by(.) | map({type: .[0], count: length}) | .[] | "- \(.type): \(.count) occurrences"' "$DEBT_LOG" 2>/dev/null >> "$REPORT_DIR/report-$TODAY.md"
fi

# Documentation health
echo -e "\n## 📚 Documentation Health\n" >> "$REPORT_DIR/report-$TODAY.md"

if [ -f "$DOC_LOG" ]; then
    # Find stale docs
    echo "### Stale Documents (>30 days)" >> "$REPORT_DIR/report-$TODAY.md"
    CURRENT_DATE=$(date +%s)
    
    jq -r '.documents | to_entries[] | select(.value.updated_date != null) | "\(.key)|\(.value.updated_date)"' "$DOC_LOG" | while IFS='|' read -r doc date_str; do
        if [ -n "$date_str" ]; then
            DOC_DATE=$(date -d "$date_str" +%s 2>/dev/null || echo "0")
            if [ "$DOC_DATE" -gt 0 ]; then
                DAYS_OLD=$(( (CURRENT_DATE - DOC_DATE) / 86400 ))
                if [ "$DAYS_OLD" -gt 30 ]; then
                    echo "- $doc ($DAYS_OLD days old)" >> "$REPORT_DIR/report-$TODAY.md"
                fi
            fi
        fi
    done
fi

# Action items
cat >> "$REPORT_DIR/report-$TODAY.md" << EOF

## 🎯 Recommended Actions

1. **Address TODOs**: Review and resolve TODO comments in code
2. **Update Stale Docs**: Refresh documentation older than 30 days
3. **Consolidate Duplicates**: Merge similar documentation files
4. **Type Safety**: Replace any/unknown types with proper TypeScript types
5. **Use Logger**: Replace remaining console statements with logger.ts

## 📈 Progress Tracking

Track your progress by running:
\`\`\`bash
# View technical debt trends
jq '.debts | length' ~/.claude/sitebango-tech-debt.json

# Check documentation freshness
jq '.documents | length' ~/.claude/sitebango-doc-freshness.json
\`\`\`
EOF

echo "📊 Report generated: $REPORT_DIR/report-$TODAY.md"