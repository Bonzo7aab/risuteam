# Development Troubleshooting Guide

## Common Issue: App Crashes After Changes

If you encounter the error:
```
Error: ENOENT: no such file or directory, open '/Users/michal/projects/risuteam/.next/server/vendor-chunks/lucide-react.js'
```

This is a common Next.js development issue caused by webpack chunking conflicts.

## Quick Solutions

### 1. Use the Clean Development Script (Recommended)
```bash
npm run dev:clean
```

This script will:
- Stop all running processes
- Clean build artifacts
- Clear npm cache
- Reinstall dependencies
- Start development server

### 2. Manual Clean (Alternative)
```bash
# Stop the development server (Ctrl+C)
# Then run:
rm -rf .next
rm -rf node_modules/.cache
npm install
npm run dev
```

### 3. Force Kill and Restart
```bash
# Kill all Node.js processes
pkill -f "next dev"
pkill -f "npm run dev"

# Clean and restart
rm -rf .next
npm run dev
```

## Prevention Tips

1. **Avoid frequent import changes** - Make all icon import changes at once
2. **Use consistent imports** - Don't mix different import styles for the same package
3. **Restart after major changes** - After changing imports, restart the dev server
4. **Keep dependencies updated** - Run `npm update` regularly

## When to Use Each Solution

- **`npm run dev:clean`** - When you get the lucide-react chunk error
- **Manual clean** - When you have other webpack issues
- **Force kill** - When the dev server becomes unresponsive

## File Locations

- **Clean script**: `./dev-clean.sh`
- **Package script**: `npm run dev:clean`
- **Build cache**: `.next/` directory
- **Node cache**: `node_modules/.cache/`
