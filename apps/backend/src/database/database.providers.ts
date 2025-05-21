import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost', // ou le nom du service Docker si tu utilises Docker Compose
        port: 5432,
        username: 'postgres', // adapte selon ta config
        password: 'postgres', // adapte selon ta config
        database: 'snowledge', // adapte selon ta config
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true, // à désactiver en prod !
      });
      return dataSource.initialize();
    },
  },
];
