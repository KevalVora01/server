import { Booking } from "../entities/Booking";
import { Amenity } from "../entities/Amenity";

export interface IBookingNotifier {
  notifyRequested(booking: Booking, amenity: Amenity): Promise<void>;        // -> Security/Admin approvers
  notifyConfirmed(booking: Booking, amenity: Amenity): Promise<void>;        // -> resident
  notifyRejected(booking: Booking, amenity: Amenity): Promise<void>;         // -> resident
  notifyCancelled(booking: Booking, amenity: Amenity): Promise<void>;        // -> Security/Admin
  notifyReminder(booking: Booking, amenity: Amenity): Promise<void>;         // -> resident, before start time
  notifyPaymentSucceeded(booking: Booking, amenity: Amenity): Promise<void>; // -> resident + Admin
}