#!/usr/bin/env node
/**
 * 秘密情報配信CLIツール
 * コマンドラインから秘密情報の配信と取得を行う
 * @version 1.0.0
 * @date 2025-09-25
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { SecretDeliveryService } from '../services/SecretDeliveryService';
import dotenv from 'dotenv';

// ==================== CLIセットアップ ====================

const program = new Command();
const secretService = new SecretDeliveryService();

program
  .name('voicedrive-secrets')
  .description('VoiceDrive秘密情報配信CLIツール')
  .version('1.0.0');

// ==================== 配信コマンド ====================

program
  .command('deliver')
  .description('秘密情報を配信する')
  .option('-r, --recipient <recipient>', '受信者')
  .option('-e, --env <envFile>', '.envファイルのパス')
  .option('-t, --expires <hours>', '有効期限（時間）', '24')
  .option('-m, --mfa', 'MFA認証を必須にする', true)
  .option('--email', 'Email通知を送信', true)
  .option('--slack', 'Slack通知を送信', false)
  .option('--teams', 'Teams通知を送信', false)
  .action(async (options) => {
    const spinner = ora();

    try {
      console.log(chalk.blue.bold('\n🔐 秘密情報配信システム\n'));

      // 受信者の入力
      let recipient = options.recipient;
      if (!recipient) {
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'recipient',
            message: '受信者を入力してください:',
            validate: (input) => input.length > 0 || '受信者は必須です'
          }
        ]);
        recipient = answer.recipient;
      }

      // 秘密情報の読み込み
      let secrets: Record<string, string> = {};

      if (options.env) {
        // .envファイルから読み込み
        spinner.start(`${options.env}を読み込み中...`);
        const envPath = path.resolve(options.env);

        if (!fs.existsSync(envPath)) {
          spinner.fail(`ファイルが見つかりません: ${envPath}`);
          process.exit(1);
        }

        const envConfig = dotenv.parse(fs.readFileSync(envPath));

        // 機密情報のみ抽出
        const secretKeys = [
          'CLIENT_SECRET',
          'DB_PASSWORD',
          'AWS_ACCESS_KEY_ID',
          'AWS_SECRET_ACCESS_KEY',
          'SENDGRID_API_KEY',
          'JWT_SECRET',
          'ENCRYPTION_KEY',
          'REFRESH_TOKEN',
          'ACCESS_TOKEN'
        ];

        secretKeys.forEach(key => {
          if (envConfig[key] && !envConfig[key].includes('${')) {
            secrets[key] = envConfig[key];
          }
        });

        spinner.succeed(`${Object.keys(secrets).length}個の秘密情報を読み込みました`);

      } else {
        // 対話式で入力
        console.log(chalk.yellow('秘密情報を入力してください（終了するには空のキーを入力）:\n'));

        let continueAdding = true;
        while (continueAdding) {
          const { key } = await inquirer.prompt([
            {
              type: 'input',
              name: 'key',
              message: 'キー:'
            }
          ]);

          if (!key) {
            continueAdding = false;
            break;
          }

          const { value } = await inquirer.prompt([
            {
              type: 'password',
              name: 'value',
              message: `${key}の値:`,
              mask: '*'
            }
          ]);

          secrets[key] = value;
        }
      }

      if (Object.keys(secrets).length === 0) {
        console.log(chalk.red('秘密情報が入力されていません'));
        process.exit(1);
      }

      // 配信確認
      console.log(chalk.cyan('\n配信内容:'));
      console.log(`  受信者: ${recipient}`);
      console.log(`  秘密情報数: ${Object.keys(secrets).length}`);
      console.log(`  有効期限: ${options.expires}時間`);
      console.log(`  MFA必須: ${options.mfa ? 'はい' : 'いいえ'}`);
      console.log(`  通知: ${[
        options.email && 'Email',
        options.slack && 'Slack',
        options.teams && 'Teams'
      ].filter(Boolean).join(', ') || 'なし'}\n`);

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: '配信を実行しますか？',
          default: true
        }
      ]);

      if (!confirm) {
        console.log(chalk.yellow('配信をキャンセルしました'));
        process.exit(0);
      }

      // 配信実行
      spinner.start('秘密情報を配信中...');

      const result = await secretService.deliverSecrets(
        recipient,
        secrets,
        {
          expiresIn: parseInt(options.expires) * 3600,
          requiresMFA: options.mfa
        },
        {
          email: options.email ? `${recipient}@medical-system.kosei-kai.jp` : undefined,
          slack: options.slack ? '#compliance-integration' : undefined,
          teams: options.teams ? 'コンプライアンス通知' : undefined
        }
      );

      spinner.succeed('配信完了！');

      // 結果表示
      console.log(chalk.green.bold('\n✅ 配信成功\n'));
      console.log(chalk.white.bgBlue(' 配信情報 '));
      console.log(`  配信ID: ${chalk.cyan(result.deliveryId)}`);
      console.log(`  トークン: ${chalk.yellow.bold(result.token)}`);
      console.log(`  有効期限: ${result.expiresAt.toLocaleString('ja-JP')}`);
      console.log(`  URL: ${chalk.underline(result.accessUrl)}\n`);

      console.log(chalk.red.bold('⚠️  重要:'));
      console.log('  ・トークンは一度だけ使用可能です');
      console.log('  ・受信者に安全な方法で共有してください');
      console.log('  ・有効期限を過ぎると自動削除されます\n');

    } catch (error: any) {
      spinner.fail('配信に失敗しました');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// ==================== 取得コマンド ====================

program
  .command('retrieve <deliveryId>')
  .description('配信された秘密情報を取得する')
  .option('-t, --token <token>', 'アクセストークン')
  .option('-o, --output <file>', '出力先.envファイル')
  .option('--mfa <code>', 'MFAコード')
  .action(async (deliveryId, options) => {
    const spinner = ora();

    try {
      console.log(chalk.blue.bold('\n🔓 秘密情報取得システム\n'));

      // トークンの入力
      let token = options.token;
      if (!token) {
        const answer = await inquirer.prompt([
          {
            type: 'password',
            name: 'token',
            message: 'トークンを入力してください:',
            mask: '*',
            validate: (input) => input.length > 0 || 'トークンは必須です'
          }
        ]);
        token = answer.token;
      }

      // MFAコードの入力（必要な場合）
      let mfaCode = options.mfa;
      if (!mfaCode) {
        const { needsMfa } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'needsMfa',
            message: 'MFA認証が必要ですか？',
            default: true
          }
        ]);

        if (needsMfa) {
          const answer = await inquirer.prompt([
            {
              type: 'input',
              name: 'mfaCode',
              message: 'MFAコードを入力してください:',
              validate: (input) => /^\d{6}$/.test(input) || '6桁の数字を入力してください'
            }
          ]);
          mfaCode = answer.mfaCode;
        }
      }

      // 取得実行
      spinner.start('秘密情報を取得中...');

      const secrets = await secretService.retrieveSecrets(
        deliveryId,
        token,
        mfaCode,
        {
          ip: '127.0.0.1',  // CLIからのアクセス
          userAgent: 'VoiceDrive-CLI/1.0',
          fingerprint: 'cli-access'
        }
      );

      spinner.succeed('取得完了！');

      // 結果表示
      console.log(chalk.green.bold('\n✅ 取得成功\n'));
      console.log(`取得した秘密情報: ${Object.keys(secrets).length}個\n`);

      // ファイルへの出力
      if (options.output) {
        const outputPath = path.resolve(options.output);

        // 既存ファイルの読み込み（あれば）
        let existingEnv = '';
        if (fs.existsSync(outputPath)) {
          existingEnv = fs.readFileSync(outputPath, 'utf-8');
        }

        // 秘密情報の更新または追加
        let updatedEnv = existingEnv;
        Object.entries(secrets).forEach(([key, value]) => {
          const regex = new RegExp(`^${key}=.*$`, 'gm');
          const newLine = `${key}="${value}"`;

          if (regex.test(updatedEnv)) {
            // 既存のキーを更新
            updatedEnv = updatedEnv.replace(regex, newLine);
          } else {
            // 新しいキーを追加
            updatedEnv += updatedEnv.endsWith('\n') ? '' : '\n';
            updatedEnv += `${newLine}\n`;
          }
        });

        // ファイルへ書き込み
        fs.writeFileSync(outputPath, updatedEnv, { mode: 0o600 });
        console.log(chalk.green(`✅ ${outputPath}を更新しました`));

      } else {
        // コンソールに表示（マスキング）
        console.log(chalk.cyan('取得した秘密情報:\n'));
        Object.entries(secrets).forEach(([key, value]) => {
          const maskedValue = value.substring(0, 4) + '*'.repeat(Math.min(value.length - 4, 20));
          console.log(`  ${key}=${maskedValue}`);
        });

        console.log(chalk.yellow('\n💡 ヒント: -o オプションで.envファイルに直接保存できます'));
      }

      console.log(chalk.green.bold('\n🎉 秘密情報の取得が完了しました！\n'));

    } catch (error: any) {
      spinner.fail('取得に失敗しました');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// ==================== ステータスコマンド ====================

program
  .command('status <deliveryId>')
  .description('配信のステータスを確認する')
  .action(async (deliveryId) => {
    try {
      console.log(chalk.blue.bold('\n📊 配信ステータス確認\n'));

      const status = secretService.getDeliveryStatus(deliveryId);

      if (!status.exists) {
        console.log(chalk.red('❌ 配信が見つかりません'));
        console.log('  配信が削除されたか、期限切れの可能性があります\n');
      } else {
        console.log(chalk.green('✅ 配信が存在します\n'));
        console.log(`  アクセス状態: ${status.accessed ? chalk.yellow('取得済み') : chalk.green('未取得')}`);
        console.log(`  有効期限: ${status.expiresAt?.toLocaleString('ja-JP')}`);
        console.log(`  アクセス試行: ${status.accessAttempts}回`);

        if (!status.accessed && status.expiresAt) {
          const remaining = status.expiresAt.getTime() - Date.now();
          if (remaining > 0) {
            const hours = Math.floor(remaining / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);
            console.log(`  残り時間: ${hours}時間${minutes}分`);
          }
        }
        console.log();
      }

    } catch (error: any) {
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// ==================== ヘルプの追加情報 ====================

program.on('--help', () => {
  console.log();
  console.log(chalk.cyan('使用例:'));
  console.log();
  console.log('  $ voicedrive-secrets deliver -r voicedrive-team -e .env.production');
  console.log('  $ voicedrive-secrets retrieve SEC-20250925-001 -t <token> -o .env');
  console.log('  $ voicedrive-secrets status SEC-20250925-001');
  console.log();
  console.log(chalk.yellow('セキュリティ注意事項:'));
  console.log();
  console.log('  ・トークンは一度だけ使用可能です');
  console.log('  ・配信は自動的に削除されます');
  console.log('  ・MFA認証を有効にすることを推奨します');
  console.log();
});

// ==================== CLIの実行 ====================

program.parse(process.argv);

// コマンドが指定されていない場合はヘルプを表示
if (!process.argv.slice(2).length) {
  program.outputHelp();
}