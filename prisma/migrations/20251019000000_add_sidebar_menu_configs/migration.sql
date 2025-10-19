-- CreateTable: sidebar_menu_configs
-- サイドバーメニュー設定テーブル (SQLite)

CREATE TABLE "sidebar_menu_configs" (
  "id" TEXT NOT NULL PRIMARY KEY,

  -- メニュー識別
  "menu_item_id" TEXT NOT NULL,
  "menu_category" TEXT NOT NULL,
  "menu_subcategory" TEXT,

  -- 基本情報
  "icon" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "description" TEXT,

  -- 表示設定
  "is_visible" INTEGER NOT NULL DEFAULT 1,
  "display_order" INTEGER NOT NULL DEFAULT 0,

  -- デバイス別表示
  "show_on_desktop" INTEGER NOT NULL DEFAULT 1,
  "show_on_mobile" INTEGER NOT NULL DEFAULT 1,
  "show_on_tablet" INTEGER NOT NULL DEFAULT 1,

  -- 権限レベル別表示 (JSON形式)
  "visible_for_levels" TEXT,

  -- 新機能マーク
  "show_new_badge" INTEGER NOT NULL DEFAULT 0,
  "new_badge_until" TEXT,

  -- バッジ設定
  "show_badge" INTEGER NOT NULL DEFAULT 0,
  "badge_type" TEXT,

  -- 管理者メモ
  "admin_notes" TEXT,

  -- その他
  "is_custom" INTEGER NOT NULL DEFAULT 0,
  "is_system" INTEGER NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ユニークインデックス
CREATE UNIQUE INDEX "unique_menu_config" ON "sidebar_menu_configs"("menu_item_id", "menu_category");

-- パフォーマンスインデックス
CREATE INDEX "idx_category" ON "sidebar_menu_configs"("menu_category");
CREATE INDEX "idx_visible" ON "sidebar_menu_configs"("is_visible");
CREATE INDEX "idx_order" ON "sidebar_menu_configs"("display_order");
