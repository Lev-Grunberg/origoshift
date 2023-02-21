import { VirtualSpace } from 'database';
import { ClientTransforms, ConnectionId, VrSpaceId } from 'schemas';
import Venue from './Venue';
import {hasIn, throttle} from 'lodash';
import Client from './Client';

import { Log } from 'debug-level';

const log = new Log('VR:Space');

process.env.DEBUG = 'VR:Space*, ' + process.env.DEBUG;
log.enable(process.env.DEBUG);

export class VrSpace {
  private _isOpen = false;
  private venue: Venue;
  private prismaData: VirtualSpace;
  private clients: Venue['clients'];

  get vrSpaceId() {
    return this.prismaData.vrId as VrSpaceId;
  }

  // TODO:
  // * Save/load scene model & navmesh model
  // * Save/load avatar pieces. Should vr spaces allow to use different sets of avatar pieces?

  sendPendingTransforms = throttle(() => {
    this.emitToAllClients('clientTransforms', this.pendingTransforms);
    this.pendingTransforms = {};
  }, 10, {
    trailing: true
  });

  pendingTransforms: ClientTransforms = {};
  constructor(venue: Venue, vrSpace: VirtualSpace, clients?: Venue['clients']){
    this.venue = venue;
    this.prismaData = vrSpace;
    this.clients = new Map(clients);
  }

  get isOpen(){
    return this._isOpen;
  }

  open () {
    this._isOpen = true;
  }

  close () {
    this._isOpen = false;
  }

  addClient (client: Client){
    if(!this.isOpen){
      log.warn(`You tried to add client ${client.username} to the vr space in ${this.venue.name} that isnt open. No bueno!`);
      return;
    }
    this.clients.set(client.connectionId, client);
  }

  removeClient (connectionId: ConnectionId){
    return this.clients.delete(connectionId);
  }


  emitToAllClients: Client['vrEvents']['emit'] = (event, ...args) => {
    let allEmittersHadListeners = true;
    this.clients.forEach(c => {
      const hadEmitter = c.vrEvents.emit(event, ...args);
      allEmittersHadListeners &&= hadEmitter;
      log.debug(`emitted ${event} to ${c.username} (${c.connectionId}), had listener(s): ${hadEmitter}`);
    });
    if(!allEmittersHadListeners){
      log.warn('not all emitters had attached listeners');
    }
    return allEmittersHadListeners;
  };

  // make this instance eligible for GC. Make sure we cut all the references to the instance in here!
  unload() {
    //clean up listeners and such in here!
  }
}
