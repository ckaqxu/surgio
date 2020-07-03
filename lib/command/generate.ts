import Command from 'common-bin';
import path from 'path';

import { loadConfig } from '../utils/config';
import generate from '../generate';
import { errorHandler } from '../utils/error-helper';
import { checkAndFix } from '../utils/linter';

class GenerateCommand extends Command {
  private options: object;

  constructor(rawArgv) {
    super(rawArgv);
    this.usage = '使用方法: surgio generate';
    this.options = {
      o: {
        type: 'string',
        alias: 'output',
        description: '生成规则的目录',
      },
      c: {
        alias: 'config',
        default: './surgio.conf.js',
      },
      'skip-fail': {
        type: 'boolean',
        default: false,
        description: '跳过生成失败的 Artifact',
      },
      'skip-lint': {
        type: 'boolean',
        default: false,
        description: '跳过代码检查',
      },
    };
  }

  public async run(ctx): Promise<void> {
    if (!ctx.argv.skipLint) {
      checkAndFix(ctx.cwd);
    }

    const config = loadConfig(ctx.cwd, ctx.argv.config, {
      // istanbul ignore next
      ...(ctx.argv.output ? {
        output: path.resolve(ctx.cwd, ctx.argv.output),
      } : null)
    });
    await generate(config, ctx.argv.skipFail);
  }

  // istanbul ignore next
  public get description(): string {
    return '生成规则';
  }

  // istanbul ignore next
  public errorHandler(err): void {
    errorHandler.call(this, err);
  }
}

export = GenerateCommand;
