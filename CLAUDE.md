# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Development server**: `npm run dev` - Runs Next.js with Turbopack
- **Build production**: `npm run build` - Creates optimized production build
- **Start production**: `npm run start` - Serves production build
- **Lint**: `npm run lint` - Runs ESLint with auto-fix enabled

## Architecture

This is a Next.js 14 application using the **Pages Router** architecture (not App Router) with HeroUI component library.

### Key Structure

- `/pages` - Next.js Pages Router structure. Each file/folder becomes a route
- `/layouts` - Layout components wrapping pages (default.tsx, head.tsx)
- `/components` - Reusable UI components using HeroUI theming system
- `/config` - Site configuration (site.ts for nav/links, fonts.ts for typography)
- `/styles/globals.css` - Tailwind CSS imports and global styles

### Component System

- Uses HeroUI v2 components (@heroui/\* packages) with custom theming
- All components use Tailwind CSS v4 with HeroUI's plugin
- Theme switching via next-themes with dark/light mode support
- Components use tailwind-variants for variant styling patterns

### Path Aliases

The `@/*` alias maps to the project root, configured in tsconfig.json
