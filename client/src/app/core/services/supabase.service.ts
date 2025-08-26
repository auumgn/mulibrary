// src/app/services/supabase.service.ts
import { Injectable } from "@angular/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Getter to access the client
  get client() {
    return this.supabase;
  }

  // Or create specific methods
  async getTopArtists(start_ts: number, end_ts: number) {
    return await this.supabase.rpc("top_artists", {
      start_ts,
      end_ts,
    });
  }

  async getRecentReviews() {
    return await this.supabase.rpc("get_latest_reviews");
  }

  async getListeningBacklog(start_ts: any, end_ts: any) {
    return await this.supabase.rpc("get_listening_backlog", { start_ts, end_ts });
  }

  async getCategoryScrobbles(normalized: boolean, start_ts: any, end_ts: any) {
    if (normalized) {
      return await this.supabase.rpc("get_category_scrobbles_normalized_ts", {
        start_ts,
        end_ts,
      });
    }
    return await this.supabase.rpc("get_category_scrobbles_raw_ts", {
      start_ts,
      end_ts,
    });
  }

  async getTimelineSliderScrobbles() {
    return await this.supabase.rpc("get_quarterly_listens");
  }

  async getRecentScrobbles(page: number, pageSize: number) {
    return await this.supabase.rpc("get_scrobbles_paginated", {
      page_size: pageSize,
      page_offset: page,
    });
  }

  async getTracksByArtist(artist: string) {
    const { data, error } = await this.supabase.from("tracks").select("*").contains("artists", [artist]);

    if (error) throw error;
    return data;
  }
}
