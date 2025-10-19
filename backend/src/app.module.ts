import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrpcModule } from './trpc/trpc.module';
import { User, UserSchema } from './schemas/user.schema';
import { Project, ProjectSchema } from './schemas/project.schema';
import { ProjectGateway } from './gateways/project.gateway';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://admin:password@localhost:27017/3d-model-view?authSource=admin',
    ),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    TrpcModule,
  ],
  controllers: [],
  providers: [ProjectGateway],
})
export class AppModule {}
