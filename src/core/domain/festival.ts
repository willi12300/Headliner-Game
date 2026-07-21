export interface FestivalEditionRecord {
  id: string;
  saveId: string;
  festivalId: string;
  editionYear: number;
  startWeek: number;
  endWeek: number;
  venueId: string | null;
  capacity: number;
  attendance: number;
  ticketRevenueMinor: number;
  sponsorRevenueMinor: number;
  otherRevenueMinor: number;
  totalCostMinor: number;
  profitMinor: number;
  status: "planned" | "active" | "completed" | "cancelled";
}

export interface TicketProductRecord {
  id: string;
  festivalEditionId: string;
  name: string;
  ticketType: "day" | "weekend" | "camping" | "vip" | "payment_plan";
  priceMinor: number;
  quantityAvailable: number;
  quantitySold: number;
  saleStartWeek: number;
  saleEndWeek: number;
  status: "planned" | "on_sale" | "sold_out" | "closed";
}
