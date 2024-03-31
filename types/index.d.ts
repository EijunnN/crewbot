// types/index.d.ts
import {
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  ClientEvents,
  Events,
  InteractionResponse,
  Message,
  ModalSubmitInteraction,
  PermissionResolvable,
  StringSelectMenuInteraction,
} from "discord.js";
import Client from "../src/core/classes/Client";


declare interface UserProfile {
  id: string;
  mvpPoints: number;
  puntos: number;
  partidasJugadas: number;
  partidasGanadas: {
    cantidadTripulante: number;
    cantidadImpostor: number;
  };
  partidasPerdidas: {
    cantidadTripulante: number;
    cantidadImpostor: number;
  };

  elogiosDados: Record<string, Set<string>>; // userID: Set<categoriaElogio>
  elogiosRecibidos: Record<string, Record<string, number>>; // { categoria: cantidad }
}

declare interface Match {
  matchId: string;
  crewmates: string[];
  impostors: string[];
  numberOfImpostors: number;
  date: Date;
  winMethod: string;
  winner: string;
  mvpId: string;
  duration: string;
  createdAt : number;
  channelId : string;
  done : boolean
}

type eventFunction<E extends keyof ClientEvents> = (
  client: Client,
  ...args: ClientEvents[E]
) => Promise<void>;

declare interface ClientEvent<E extends keyof ClientEvents> {
  name: E;
  once: boolean;
  execute: eventFunction<E>;
}

type chatInputCommandFunction = (
  client: Client,
  interaction: ChatInputCommandInteraction<"cached">
) => Promise<InteractionResponse<true>>;
declare interface ChatInputCommand extends ChatInputApplicationCommandData {
  permissions?: PermissionResolvable[];
  roles?: string[]
  execute: chatInputCommandFunction;
  autocomplete?: autocomplete
}

type autocomplete = (
  client: Client,
  interaction: AutocompleteInteraction<"cached">
) => Promise<InteractionResponse<true>>


type buttonFunction = (
  client: Client,
  interaction: ButtonInteraction<"cached">,
  fetchedReply: Message<boolean>
) => Promise<InteractionResponse<boolean> | void | Message<boolean>>;

declare interface Button {
  customId: string;
  description?: string;
  execute: buttonFunction;
}

type stringSelectMenuFunction = (
  client: Client,
  interaction: StringSelectMenuInteraction<"cached">,
  fetchedReply: Message<boolean>
) => Promise<InteractionResponse<boolean> | void | Message<boolean>>;

declare interface StringSelectMenu {
  customId: string;
  description?: string;
  execute: stringSelectMenuFunction;
}

type modalFunction = (
  client: Client,
  interaction: ModalSubmitInteraction<"cached">,
  fetchedReply: Message<boolean>
) => Promise<InteractionResponse<boolean> | void | Message<boolean>>;

declare interface Modal {
  customId: string;
  description?: string;
  execute: modalFunction;
}

declare interface ResolveProfileOptions {
  createIfNotExist?: boolean;
}

