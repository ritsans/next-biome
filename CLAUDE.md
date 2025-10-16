# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15.5アプリケーション（App Router使用）で、Biomeをリンターおよびフォーマッターとして使用しています。

## Key Technologies

- **Next.js 15.5** with Turbopack enabled
- **React 19.1**
- **TypeScript**
- **Tailwind CSS v4**
- **Biome** (ESLintとPrettierの代替として使用)

## Essential Commands

### Development
```bash
npm run dev          # 開発サーバーを起動 (Turbopack使用、http://localhost:3000)
npm run build        # 本番用ビルドを実行 (Turbopack使用)
npm start            # 本番サーバーを起動
```

### Code Quality
```bash
npm run lint         # Biomeでコードをチェック
npm run format       # Biomeでコードを自動フォーマット
```

## Architecture

### Directory Structure
- `src/app/` - Next.js App Routerのルートディレクトリ
  - `layout.tsx` - ルートレイアウトコンポーネント
  - `page.tsx` - ホームページコンポーネント

### Path Aliases
- `@/*` は `./src/*` にマップされています（例: `import Component from '@/components/Button'`）

### Biome Configuration
- **Formatter**: 2スペースインデント
- **Linter**: 推奨ルール有効、Next.jsとReactドメイン最適化
- **Auto-organize imports**: 保存時にimport文を自動整理
- Git連携が有効（.gitignoreを尊重）

## Important Notes

- このプロジェクトはESLintやPrettierの代わりにBiomeを使用しています
- TurbopackがdevとbuildコマンドでデフォルトON
- TypeScriptのstrictモードが有効
