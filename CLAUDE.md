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

### Authentication System
- **Supabase Auth**を使用した認証システムを実装
- **Server Actions** (`src/actions/auth.ts`) でサーバーサイド認証処理
  - `signUp()` - 新規登録
  - `signIn()` - ログイン
  - `signOut()` - ログアウト
- **Middleware** (`src/middleware.ts`) で認証保護とセッション管理
  - `/mypage`と`/logout`は認証必須
  - 未認証時は自動的に`/login`へリダイレクト
  - セッションの自動更新（トークンリフレッシュ）

### Supabase Client Configuration
- **Client-side**: `src/utils/supabase/client.ts` - ブラウザ用クライアント
- **Server-side**: `src/utils/supabase/server.ts` - Server Components/Actions用クライアント
- 環境変数必須: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Database Schema
- **`profiles` テーブル** (`auth.users` に外部キー)
  - `id uuid` (PK, FK to auth.users)
  - `display_name text` - 表示名
  - `avatar_url text` - アバター画像URL
  - `bio text` - 自己紹介
  - `username citext` - 一意なユーザー名（形式: `^[a-z0-9_]{3,30}$`）
  - `is_public boolean default false` - プロフィール公開設定
  - `created_at timestamptz`, `updated_at timestamptz` (自動更新トリガー付き)
- **RLS (Row Level Security)**
  - 認証ユーザーは自分のプロフィールのみ select/insert/update 可能
  - `is_public = true` のプロフィールは匿名ユーザーも参照可能
- **新規ユーザー自動作成**: `auth.users` への insert 時に `profiles` レコードを自動生成

### Directory Structure
- `src/app/` - Next.js App Routerのルートディレクトリ
  - `layout.tsx` - ルートレイアウト（Header/Footer含む）
  - `page.tsx` - ホームページ
  - `login/` - ログインページ
  - `signup/` - 新規登録ページ
  - `mypage/` - 認証保護されたマイページ
  - `logout/` - ログアウトページ
- `src/actions/` - Server Actions
- `src/components/` - 再利用可能なコンポーネント
  - `Header.tsx` - 認証状態に応じてナビゲーション切り替え
- `src/utils/` - ユーティリティ関数
- `src/middleware.ts` - Next.js Middleware（認証チェック）

### Path Aliases
- `@/*` は `./src/*` にマップされています（例: `import Component from '@/components/Button'`）

### Biome Configuration
- **Formatter**: 2スペースインデント
- **Linter**: 推奨ルール有効、Next.jsとReactドメイン最適化
- **Auto-organize imports**: 保存時にimport文を自動整理
- Git連携が有効（.gitignoreを尊重）
- **重要**: non-null assertion (`!`) は禁止。環境変数は必ずnullチェックを行う
- **重要**: `forEach`内でreturnしない（`for...of`を使用）

## Important Notes

- このプロジェクトはESLintやPrettierの代わりにBiomeを使用しています
- TurbopackがdevとbuildコマンドでデフォルトON
- TypeScriptのstrictモードが有効
- 認証システムはSupabase Authを使用（セッションベース）
- Server ComponentsとClient Componentsを適切に使い分ける
  - 認証チェック: Server Componentsで`createClient()`を使用
  - フォーム送信: Client Componentsで`"use client"`ディレクティブ
