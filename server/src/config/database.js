import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { Sequelize } from 'sequelize';

const fallbackDatabasePath = fileURLToPath(new URL('../../data/task_manager.db', import.meta.url));
const databaseUrl = process.env.DATABASE_URL || 'sqlite://' + fallbackDatabasePath;
const isSqlite = databaseUrl.startsWith('sqlite:');

export const sequelize = isSqlite
  ? new Sequelize({
      dialect: 'sqlite',
      storage: fallbackDatabasePath,
      logging: false
    })
  : new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    });
