// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Getter to access the client
  get client() {
    return this.supabase;
  }

  // Or create specific methods
  async getTracks() {
    const { data, error } = await this.supabase
      .from('tracks')
      .select('*')
      .order('played_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getTracksByArtist(artist: string) {
    const { data, error } = await this.supabase
      .from('tracks')
      .select('*')
      .contains('artists', [artist]);
    
    if (error) throw error;
    return data;
  }
}