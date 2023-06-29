import { Album } from "./album.model";
import { Artist } from "./artist.model";
import { Category } from "./category.model";
import { Genre } from "./genre.model";

export interface ITrack {
  name: string;
  artist: string[];
  artist_id: number[];
  album?: string;
  album_id?: number;
  duration?: number;
  track_no?: number;
  category?: string;
  year?: number;
  genre?: Genre[] | string[];
  id?: number;
  other_names?: string[];
  playcount?: number;
}

export class Track implements ITrack {
  constructor(
    public name: string,
    public artist: string[],
    public artist_id: number[],
    public album?: string,
    public album_id?: number,
    public duration?: number,
    public track_no?: number,
    public category?: string,
    public year?: number,
    public genre?: Genre[] | string[],
    public id?: number,
    public other_names?: string[],
    public playcount?: number
  ) {}
}
