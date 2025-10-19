import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

export interface ProjectUpdateEvent {
  projectId: string;
  type: 'chat' | 'annotation' | 'camera' | 'stl' | 'modelTransform';
  timestamp: Date;
}

@Injectable()
export class EventsService extends EventEmitter {
  emitProjectUpdate(event: ProjectUpdateEvent) {
    this.emit('projectUpdate', event);
  }

  onProjectUpdate(callback: (event: ProjectUpdateEvent) => void) {
    this.on('projectUpdate', callback);
    return () => this.off('projectUpdate', callback);
  }
}
