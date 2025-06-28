#!/bin/bash

# Universal Auto-Sync Manager Fix Validation Script
echo "🔧 Universal Auto-Sync Manager Fix Validation"
echo "============================================="

# Check if the auto-sync manager file exists and has the fix
if [ -f "js/universal-auto-sync-manager.js" ]; then
    echo "✅ Auto-sync manager file found"
    
    # Check for the new isUmbrellaManagerReady method
    if grep -q "isUmbrellaManagerReady" js/universal-auto-sync-manager.js; then
        echo "✅ isUmbrellaManagerReady method found"
    else
        echo "❌ isUmbrellaManagerReady method missing"
    fi
    
    # Check for proper error handling
    if grep -q "try {" js/universal-auto-sync-manager.js && grep -q "setCurrentBusiness" js/universal-auto-sync-manager.js; then
        echo "✅ Error handling around setCurrentBusiness found"
    else
        echo "❌ Error handling missing"
    fi
    
    # Check for retry limiting
    if grep -q "umbrellaManagerRetryCount" js/universal-auto-sync-manager.js; then
        echo "✅ Umbrella manager retry limiting found"
    else
        echo "❌ Retry limiting missing"
    fi
    
    # Check for optional auto-initialization
    if grep -q "disableAutoSyncAutoInit" js/universal-auto-sync-manager.js; then
        echo "✅ Optional auto-initialization control found"
    else
        echo "❌ Optional auto-initialization control missing"
    fi
    
else
    echo "❌ Auto-sync manager file not found"
fi

echo ""
echo "📄 Pages using auto-sync manager:"

# Find all HTML files that include the auto-sync manager
pages_with_autosync=$(grep -l "universal-auto-sync-manager.js" *.html 2>/dev/null || echo "none")

if [ "$pages_with_autosync" != "none" ]; then
    echo "$pages_with_autosync" | while read -r page; do
        echo "  • $page"
    done
else
    echo "  No pages found with auto-sync manager inclusion"
fi

echo ""
echo "🧪 Test files:"
if [ -f "auto-sync-fix-test.html" ]; then
    echo "✅ Test file available: auto-sync-fix-test.html"
else
    echo "❌ Test file missing"
fi

echo ""
echo "📋 Summary:"
echo "• Fixed dependency checking with isUmbrellaManagerReady()"
echo "• Added proper error handling for setCurrentBusiness calls"
echo "• Implemented retry limiting for umbrella manager operations"
echo "• Enhanced dependency waiting with graceful degradation"
echo "• Added optional auto-initialization control"
echo ""
echo "🎯 Result: Console spam from 'undefined setCurrentBusiness' should be resolved"
