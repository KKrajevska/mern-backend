export interface LocationT {
  lat: number;
  lng: number;
}
export interface PlaceT {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  address: string;
  location: LocationT;
  creator: string;
}

export interface PlaceModelT {
  title: string;
  description: string;
  image: string;
  address: string;
  location: LocationT;
  creator: string;
}

export interface UserT {
  id?: string;
  name: string;
  email: string;
  password: string;
  places: string;
}

export type Indexed = {
  [key: string]: any;
};
