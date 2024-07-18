import { join } from 'path';

export default () => ({
  server: { port: parseInt(process.env.SERVER_PORT, 10) },
  database: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [join(__dirname, '/../**/*.entity.{js,ts}')],
    synchronize: Boolean(process.env.POSTGRES_SYNCHRONIZE) || true,
    logging: true,
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
    exp: process.env.JWT_EXP || '7d',
  },
});
