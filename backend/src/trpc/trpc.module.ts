import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TRPCModule } from 'nestjs-trpc';
import { UserRouter, ProjectsRouter } from './trpc.router';
import { UserService } from '../services/user.service';
import { ProjectService } from '../services/project.service';
import { EventsService } from '../services/events.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import superjson from 'superjson';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    TRPCModule.forRoot({
      autoSchemaFile: './@generated',
      transformer: superjson,
    }),
  ],
  providers: [
    UserRouter,
    ProjectsRouter,
    UserService,
    ProjectService,
    EventsService,
  ],
  exports: [EventsService, ProjectService, UserService],
})
export class TrpcModule {}
