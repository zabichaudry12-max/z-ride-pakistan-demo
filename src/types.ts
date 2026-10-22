export type RideStatus =
  | 'new'
  | 'offers'
  | 'accepted'
  | 'driver_arrived'
  | 'trip_started'
  | 'completed'
  | 'cancelled';

export type DriverApplicationStatus = 'pending' | 'approved' | 'rejected';
export type OfferStatus = 'pending' | 'accepted' | 'rejected';
export type UserRole = 'passenger' | 'driver' | 'admin';

export interface DriverOffer {
  id: string;
  driverName: string;
  vehicle: string;
  fare: number;
  comment: string;
  status: OfferStatus;
  etaMinutes: number;
}

export interface RideRequest {
  id: string;
  passengerName: string;
  pickup: string;
  destination: string;
  fare: number;
  createdAt: string;
  status: RideStatus;
  offers: DriverOffer[];
  acceptedOfferId?: string;
  assignedDriver?: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  rating: number;
  vehicle: string;
  plate: string;
  available: boolean;
  phone: string;
}

export interface DriverApplication {
  id: string;
  applicantName: string;
  phone: string;
  vehicle: string;
  license: string;
  status: DriverApplicationStatus;
}
