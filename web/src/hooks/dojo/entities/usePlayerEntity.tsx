import {
  Player,
  Drug as DrugType,
  Name,
  usePlayerEntityQuery,
  EntityEdge,
} from "@/generated/graphql";
import { useCallback, useEffect, useState } from "react";
import { shortString } from "starknet";
import { REFETCH_INTERVAL, SCALING_FACTOR } from "..";

type Drug = {
  name: string;
  quantity: number;
};

export class PlayerEntity {
  cash: number;
  health: number;
  turnsRemaining: number;
  locationId: string;
  drugs: Drug[];

  constructor(player: Player, drugs: Drug[]) {
    this.cash = Number(player.cash) / SCALING_FACTOR;
    this.health = player.health;
    this.turnsRemaining = player.turns_remaining;
    this.locationId = player.location_id;
    this.drugs = drugs;
  }

  static create(edges: EntityEdge[]): PlayerEntity | undefined {
    if (!edges || edges.length === 0) return undefined;

    // player related entities
    const playerEdges = edges.find((edge) => {
      edge.node?.components?.find(
        (component) => component?.__typename === "Player",
      );
    });

    const playerComponent = playerEdges?.node?.components?.find(
      (component) => component?.__typename === "Player",
    ) as Player;

    // drug entities
    const drugEdges = edges.filter((edge) =>
      edge.node?.components?.find(
        (component) => component?.__typename === "Drug",
      ),
    );

    const drugs: Drug[] = drugEdges.map((edge) => {
      const drugComponent = edge.node?.components?.find(
        (component) => component?.__typename === "Drug",
      ) as DrugType;

      const nameComponent = edge.node?.components?.find(
        (component) => component?.__typename === "Name",
      ) as Name;

      return {
        name: shortString.decodeShortString(nameComponent.short_string),
        quantity: drugComponent.quantity,
      };
    });

    if (!playerEdges) return undefined;

    return new PlayerEntity(playerComponent, drugs);
  }
}

export interface PlayerInterface {
  player?: PlayerEntity;
  isFetched: boolean;
}

export const usePlayerEntity = ({
  gameId,
  address,
}: {
  gameId?: string;
  address?: string;
}): PlayerInterface => {
  const [player, setPlayer] = useState<PlayerEntity>();

  // TODO: remove leading zeros in address, maybe implemented in torii
  const { data, isFetched, refetch } = usePlayerEntityQuery(
    { gameId: gameId || "", playerId: address || "" },
    {
      enabled: !!gameId && !!address,
      refetchInterval: REFETCH_INTERVAL, // TODO: long polling,
    },
  );
  useEffect(() => {
    const player_ = PlayerEntity.create(data?.entities?.edges as EntityEdge[]);
    if (player_) setPlayer(player_);
  }, [data]);

  return {
    player,
    isFetched,
  };
};
