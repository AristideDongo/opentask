import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import type { Readable } from 'node:stream';
import { Inject, Injectable } from '@nestjs/common';
import { ENV, type Env } from '../../shared/config/env';

const KEY_PATTERN = /^\d{4}\/\d{2}\/[0-9a-f-]{36}$/;

@Injectable()
export class StorageService {
  private readonly root: string;

  constructor(@Inject(ENV) env: Env) {
    this.root = resolve(env.STORAGE_DIR);
  }

  private pathOf(key: string) {
    if (!KEY_PATTERN.test(key)) throw new Error('Clé de stockage invalide.');
    return join(this.root, key);
  }

  async save(content: Buffer): Promise<string> {
    const now = new Date();
    const key = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}`;
    const path = this.pathOf(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, { flag: 'wx' });
    return key;
  }

  read(key: string): Readable {
    return createReadStream(this.pathOf(key));
  }

  async remove(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => rm(this.pathOf(key), { force: true })));
  }
}
