/* eslint-disable class-methods-use-this */
import { MessengerClient } from 'messaging-api-messenger';

import MessengerContext from '../session/MessengerContext';

import Connecter from './Connector';

export default class MessengerConnector extends Connecter {
  constructor(accessToken) {
    super();
    this._graphAPIClient = MessengerClient.factory(accessToken);
  }

  _getRawEventFromRequest(request) {
    return request.body.entry[0].messaging[0];
  }

  get platform(): string {
    return 'messenger';
  }

  getSenderIdFromRequest(request) {
    const rawEvent = this._getRawEventFromRequest(request);
    if (rawEvent.message && rawEvent.message.is_echo) {
      return rawEvent.recipient.id;
    }
    return rawEvent.sender.id;
  }

  async getUserProfile(senderId) {
    const { data } = await this._graphAPIClient.getUserProfile(senderId);
    return data;
  }

  async handleRequest({ request, sessionData }) {
    const rawEvent = this._getRawEventFromRequest(request);

    const context = new MessengerContext({
      graphAPIClient: this._graphAPIClient,
      rawEvent,
      data: sessionData,
    });

    await this._handler(context);
  }
}