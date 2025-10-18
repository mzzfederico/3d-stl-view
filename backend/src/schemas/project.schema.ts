import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class Vector3 {
  @Prop({ required: true })
  x: number;

  @Prop({ required: true })
  y: number;

  @Prop({ required: true })
  z: number;
}

const Vector3Schema = SchemaFactory.createForClass(Vector3);

@Schema({ _id: false })
export class ChatMessage {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, default: () => new Date() })
  timestamp: Date;
}

const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

@Schema({ _id: false })
export class Annotation {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: Vector3Schema, required: true })
  vertex: Vector3;

  @Prop({ required: true, default: () => new Date() })
  timestamp: Date;
}

const AnnotationSchema = SchemaFactory.createForClass(Annotation);

@Schema({ _id: false })
export class Camera {
  @Prop({ type: Vector3Schema, required: true })
  position: Vector3;

  @Prop({ type: Vector3Schema, required: true })
  rotation: Vector3;
}

const CameraSchema = SchemaFactory.createForClass(Camera);

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true, unique: true })
  projectId: string;

  @Prop({ required: true })
  projectName: string;

  @Prop({ type: String })
  stlFile: string; // Base64 encoded STL file

  @Prop({ type: [ChatMessageSchema], default: [] })
  chatLog: ChatMessage[];

  @Prop({ type: [AnnotationSchema], default: [] })
  annotations: Annotation[];

  @Prop({ type: CameraSchema })
  camera: Camera;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
