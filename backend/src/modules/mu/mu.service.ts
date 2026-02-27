import { Injectable, Logger } from '@nestjs/common';
import { WarEraApiService } from '../warera-api/warera-api.service';

@Injectable()
export class MuService {
  private readonly logger = new Logger(MuService.name);

  constructor(private readonly warEraApi: WarEraApiService) {}

  /** Get the MU a user is a member of */
  async getMemberMu(userId: string) {
    const res = await this.warEraApi.request<any>('mu.getManyPaginated', { memberId: userId });
    const items = res?.[0]?.result?.data?.items ?? [];
    return items[0] ?? null;
  }

  /** Get MUs a user owns */
  async getOwnedMus(userId: string) {
    const res = await this.warEraApi.request<any>('mu.getManyPaginated', { userId });
    return res?.[0]?.result?.data?.items ?? [];
  }

  /** Get summary of MUs for a user (membership + owned) */
  async getUserMusSummary(userId: string) {
    const [memberMu, ownedMus] = await Promise.all([
      this.getMemberMu(userId),
      this.getOwnedMus(userId),
    ]);
    const toSummary = (mu: any) => ({ id: mu._id, name: mu.name, avatarUrl: mu.avatarUrl, memberCount: mu.members?.length ?? 0 });
    return {
      memberOf: memberMu ? toSummary(memberMu) : null,
      owned: ownedMus.map(toSummary),
    };
  }

  /** Get MU by ID with enriched member data */
  async getMuDetail(muId: string) {
    const res = await this.warEraApi.request<any>('mu.getById', { muId });
    const mu = res?.[0]?.result?.data;
    if (!mu) return null;

    // Fetch user details and donation totals in parallel
    const memberIds: string[] = mu.members ?? [];
    const [userDetails, donations] = await Promise.all([
      this.fetchUsersInBatches(memberIds),
      this.fetchDonationTotals(muId),
    ]);

    const enrichedMembers = memberIds.map((id) => {
      const user = userDetails.get(id);
      if (!user) return { userId: id };

      const lastLogin = user.dates?.lastConnectionAt;
      let lastLoginAgo: string | null = null;
      let inactive = false;
      if (lastLogin) {
        const diffMs = Date.now() - new Date(lastLogin).getTime();
        lastLoginAgo = this.formatTimeAgo(diffMs);
        inactive = diffMs > 48 * 60 * 60 * 1000;
      }

      return {
        userId: id,
        username: user.username,
        avatarUrl: user.animatedAvatarUrl ?? user.avatarUrl,
        level: user.leveling?.level,
        militaryRank: user.militaryRank,
        totalDamage: user.stats?.damagesCount,
        attack: user.skills?.attack?.total,
        isOwner: id === mu.user,
        isCommander: (mu.roles?.commanders ?? []).includes(id),
        donation: donations.get(id) ?? 0,
        lastLoginAgo,
        inactive,
      };
    });

    // Sort: owner first, then commanders, then by level desc
    enrichedMembers.sort((a, b) => {
      if (a.isOwner !== b.isOwner) return a.isOwner ? -1 : 1;
      if (a.isCommander !== b.isCommander) return a.isCommander ? -1 : 1;
      return (b.level ?? 0) - (a.level ?? 0);
    });

    return {
      id: mu._id,
      name: mu.name,
      avatarUrl: mu.avatarUrl,
      region: mu.region,
      ownerId: mu.user,
      memberCount: memberIds.length,
      upgrades: {
        headquarters: mu.activeUpgradeLevels?.headquarters ?? 0,
        dormitories: mu.activeUpgradeLevels?.dormitories ?? 0,
      },
      rankings: mu.rankings,
      members: enrichedMembers,
    };
  }

  /** Fetch donation transactions for the last 30 days and sum per user */
  private async fetchDonationTotals(muId: string): Promise<Map<string, number>> {
    const totals = new Map<string, number>();
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let cursor: string | undefined;

    while (true) {
      const params: any = { muId, limit: 100, transactionType: 'donation' };
      if (cursor) params.cursor = cursor;

      try {
        const res = await this.warEraApi.request<any>('transaction.getPaginatedTransactions', params);
        const data = res?.[0]?.result?.data;
        const items = data?.items ?? [];

        let reachedCutoff = false;
        for (const tx of items) {
          if (new Date(tx.createdAt).getTime() < cutoff) {
            reachedCutoff = true;
            break;
          }
          const userId = tx.buyerId;
          totals.set(userId, (totals.get(userId) ?? 0) + (tx.money ?? 0));
        }

        if (reachedCutoff || !data?.nextCursor || items.length === 0) break;
        cursor = data.nextCursor;
      } catch (err) {
        this.logger.error('Failed to fetch donation transactions', err);
        break;
      }
    }

    return totals;
  }

  /** Fetch user profiles in batches to respect rate limits */
  private async fetchUsersInBatches(userIds: string[]): Promise<Map<string, any>> {
    const map = new Map<string, any>();
    // Batch via tRPC batch endpoint
    const batchSize = 25;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const endpoints = batch.map((userId) => ({
        endpoint: 'user.getUserLite',
        params: { userId },
      }));
      try {
        const results = await this.warEraApi.batchRequest<any>(endpoints);
        const resultsArray = Array.isArray(results) ? results : Object.values(results);
        resultsArray.forEach((r: any, idx: number) => {
          const data = r?.result?.data;
          if (data) map.set(batch[idx], data);
        });
      } catch (err) {
        this.logger.error(`Failed to fetch user batch starting at ${i}`, err);
      }
    }
    return map;
  }

  private formatTimeAgo(diffMs: number): string {
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
