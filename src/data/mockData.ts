import type { DriverApplication, DriverProfile, RideRequest } from '../types';

export const mockDrivers: DriverProfile[] = [
  {
    id: 'd1',
    name: 'Ahsan Khan',
    rating: 4.9,
    vehicle: 'Honda Civic',
    plate: 'ABC-1212',
    available: true,
    phone: '+92 300 1234567'
  },
  {
    id: 'd2',
    name: 'Usman Ali',
    rating: 4.7,
    vehicle: 'Toyota Corolla',
    plate: 'XYZ-3456',
    available: true,
    phone: '+92 311 7654321'
  },
  {
    id: 'd3',
    name: 'Noman Raza',
    rating: 4.8,
    vehicle: 'Suzuki Cultus',
    plate: 'DEF-9845',
    available: false,
    phone: '+92 333 4455667'
  }
];

export const initialRideRequests: RideRequest[] = [
  {
    id: 'r1',
    passengerName: 'Rida',
    pickup: 'G-11 Markaz, Islamabad',
    destination: 'Blue Area, Islamabad',
    fare: 2200,
    createdAt: '2026-10-22T08:15:00Z',
    status: 'offers',
    offers: [
      {
        id: 'o1',
        driverName: 'Ahsan Khan',
        vehicle: 'Honda Civic',
        fare: 2600,
        comment: 'Comfortable ride, ETA 8 minutes.',
        status: 'pending',
        etaMinutes: 8
      },
      {
        id: 'o2',
        driverName: 'Usman Ali',
        vehicle: 'Toyota Corolla',
        fare: 2400,
        comment: 'I can pick you up in 10 minutes.',
        status: 'pending',
        etaMinutes: 10
      }
    ]
  },
  {
    id: 'r2',
    passengerName: 'Hamza',
    pickup: 'Bahria Town, Rawalpindi',
    destination: 'Saddar, Rawalpindi',
    fare: 1800,
    createdAt: '2026-10-22T09:05:00Z',
    status: 'accepted',
    offers: [
      {
        id: 'o3',
        driverName: 'Noman Raza',
        vehicle: 'Suzuki Cultus',
        fare: 1950,
        comment: 'Accepted your counteroffer, I am en route.',
        status: 'accepted',
        etaMinutes: 12
      }
    ],
    acceptedOfferId: 'o3',
    assignedDriver: 'Noman Raza'
  },
  {
    id: 'r3',
    passengerName: 'Sara',
    pickup: 'F-8 Markaz, Islamabad',
    destination: 'Islamabad Airport',
    fare: 3000,
    createdAt: '2026-10-22T10:20:00Z',
    status: 'new',
    offers: []
  }
];

export const initialDriverApplications: DriverApplication[] = [
  {
    id: 'a1',
    applicantName: 'Imran Shah',
    phone: '+92 323 9991122',
    vehicle: 'Suzuki Mehran',
    license: 'PK-889311',
    status: 'pending'
  },
  {
    id: 'a2',
    applicantName: 'Bilal Siddiqui',
    phone: '+92 321 4389100',
    vehicle: 'Honda City',
    license: 'PK-221440',
    status: 'pending'
  },
  {
    id: 'a3',
    applicantName: 'Zeeshan Arif',
    phone: '+92 312 1030405',
    vehicle: 'Toyota Yaris',
    license: 'PK-997622',
    status: 'approved'
  }
];
