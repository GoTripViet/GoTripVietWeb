import { cld } from "../utils/cld.js";

// helpers (để data tự có departMin/arriveMin)
export const timeToMinutes = (t) => {
  const [hh, mm] = String(t || "0:0")
    .split(":")
    .map(Number);
  return hh * 60 + mm;
};

// (tuỳ bạn) map code -> logo cloudinary (thay publicId thật của bạn)
export const AIRLINE_LOGO = {
  VJ: cld("airline_ana_e88cvc", { w: 48, h: 48, crop: "fill", g: "auto" }),
  UO: cld("airline_vietnamairline_ztwjvt", {
    w: 48,
    h: 48,
    crop: "fill",
    g: "auto",
  }),
  MU: cld("airline_vietjet_vjjhka", { w: 48, h: 48, crop: "fill", g: "auto" }),
  CM: cld("airline_american_ssbjyv", { w: 48, h: 48, crop: "fill", g: "auto" }),
  NH: cld("airline_hkexpress_myf16j", {
    w: 48,
    h: 48,
    crop: "fill",
    g: "auto",
  }),
  AA: cld("airline_ana_e88cvc", { w: 48, h: 48, crop: "fill", g: "auto" }),
  VN: cld("airline_vietjet_vjjhka", { w: 48, h: 48, crop: "fill", g: "auto" }),
  AK: cld("airline_vietjet_vjjhka", { w: 48, h: 48, crop: "fill", g: "auto" }),
  LA: cld("airline_american_ssbjyv", { w: 48, h: 48, crop: "fill", g: "auto" }),
};

export const airlineLogosFromCodes = (codes = []) =>
  [...new Set(codes)].map((c) => AIRLINE_LOGO[c]).filter(Boolean);

export const DUMMY_FLIGHTS = [
  {
    id: "f1",
    tags: ["Rẻ nhất", "Có thể nâng lên thành vé linh hoạt"],
    flexible: true,
    best: false,
    price: 29199642,

    // dùng cho icon hành lý + tooltip
    baggage: { personal: true, carryOn: true, checked: true },

    // ✅ FilterBar thống kê theo danh sách này
    airlines: ["AirAsia", "LATAM"],

    totalDurationHours: 54,
    stopsMax: 1,

    // ✅ lọc theo giờ bay
    departMin: timeToMinutes("14:50"),
    arriveMin: timeToMinutes("22:45"),

    // ✅ FlightCard + DetailFlightCard
    lines: [
      // OUTBOUND
      {
        depTime: "14:50",
        depAirport: "SGN",
        depDate: "17 tháng 1",
        arrTime: "22:45",
        arrAirport: "HND",
        arrDate: "18 tháng 1",
        durationText: "29 giờ 55 phút",
        processTag: { type: "stops", label: "1 điểm dừng" },

        // ✅ từng lần bay (segment)
        segments: [
          {
            airlineName: "AirAsia",
            airlineLogo: airlineLogosFromCodes(["AK"])[0],
            cabinClass: "Hạng phổ thông",

            fromIata: "SGN",
            fromName: "Sân bay Quốc tế Tân Sơn Nhất",
            departTime: "14:50",
            departDate: "T7, 17 tháng 1",

            toIata: "HKG",
            toName: "Sân bay Quốc tế Hồng Kông",
            arriveTime: "20:30",
            arriveDate: "T7, 17 tháng 1",

            durationText: "5 giờ 40 phút",
          },
          {
            airlineName: "LATAM",
            airlineLogo: airlineLogosFromCodes(["LA"])[0],
            cabinClass: "Hạng phổ thông",

            fromIata: "HKG",
            fromName: "Sân bay Quốc tế Hồng Kông",
            departTime: "22:10",
            departDate: "T7, 17 tháng 1",

            toIata: "HND",
            toName: "Tokyo Haneda Airport",
            arriveTime: "22:45",
            arriveDate: "CN, 18 tháng 1",

            durationText: "24 giờ 15 phút",
          },
        ],

        // ✅ quá cảnh dạng A
        layover: {
          type: "self_transfer",
          durationText: "2 giờ 05 phút",
        },
      },

      // RETURN
      {
        depTime: "08:40",
        depAirport: "HND",
        depDate: "22 tháng 1",
        arrTime: "06:30",
        arrAirport: "SGN",
        arrDate: "23 tháng 1",
        durationText: "33 giờ 50 phút",
        processTag: { type: "direct", label: "Bay thẳng" },

        segments: [
          {
            airlineName: "AirAsia",
            airlineLogo: airlineLogosFromCodes(["AK"])[0],
            cabinClass: "Hạng phổ thông",

            fromIata: "HND",
            fromName: "Tokyo Haneda Airport",
            departTime: "08:40",
            departDate: "T7, 22 tháng 1",

            toIata: "SGN",
            toName: "Sân bay Quốc tế Tân Sơn Nhất",
            arriveTime: "06:30",
            arriveDate: "CN, 23 tháng 1",

            durationText: "33 giờ 50 phút",
          },
        ],
      },
    ],

    operatedBy: "AirAsia, LATAM",

    // ✅ phần detail: hành lý / điều kiện / dịch vụ
    baggageDetails: {
      personal: {
        title: "1 túi xách nhỏ",
        desc: "Phải vừa với gầm ghế phía trước chỗ ngồi của bạn",
      },
      carryOn: {
        title: "1 hành lý cabin",
        desc: "23 x 36 x 56 cm · Trọng lượng tối đa 5 kg",
      },
      checked: { title: "1 hành lý ký gửi", desc: "Trọng lượng tối đa 23 kg" },
    },
    ticketRules: [
      {
        icon: "bi-arrow-repeat",
        text: "Bạn được phép đổi chuyến bay này, có trả phí",
      },
      {
        icon: "bi-x-circle",
        text: "Bạn được phép huỷ chuyến bay này, có trả phí",
      },
    ],
    extras: [
      {
        icon: "bi-luggage",
        title: "Hành lý ký gửi",
        sub: "Từ VND 560.489,98",
        note: "Có ở các bước tiếp theo",
      },
      {
        icon: "bi-calendar2-check",
        title: "Vé linh động",
        sub: "Có thể đổi ngày + VND 310.868,87 cho tất cả hành khách",
        note: "Có ở các bước tiếp theo",
      },
    ],
  },

  {
    id: "f2",
    tags: ["Nhanh nhất", "Bay thẳng rẻ nhất"],
    flexible: false,
    best: true,
    price: 48097414,

    baggage: { personal: true, carryOn: true, checked: false },

    airlines: ["AirAsia", "LATAM"],
    totalDurationHours: 35,
    stopsMax: 1,

    departMin: timeToMinutes("10:35"),
    arriveMin: timeToMinutes("22:40"),

    lines: [
      {
        depTime: "10:35",
        depAirport: "SGN",
        depDate: "17 tháng 1",
        arrTime: "22:40",
        arrAirport: "HND",
        arrDate: "17 tháng 1",
        durationText: "10 giờ 05 phút",
        processTag: { type: "stops", label: "1 điểm dừng" },

        segments: [
          {
            airlineName: "AirAsia",
            airlineLogo: airlineLogosFromCodes(["AK"])[0],
            cabinClass: "Hạng phổ thông",

            fromIata: "SGN",
            fromName: "Sân bay Quốc tế Tân Sơn Nhất",
            departTime: "10:35",
            departDate: "T7, 17 tháng 1",

            toIata: "HND",
            toName: "Tokyo Haneda Airport",
            arriveTime: "22:40",
            arriveDate: "T7, 17 tháng 1",

            durationText: "10 giờ 05 phút",
          },
          {
            airlineName: "LATAM",
            airlineLogo: airlineLogosFromCodes(["LA"])[0],
            cabinClass: "Hạng phổ thông",

            fromIata: "HND",
            fromName: "Tokyo Haneda Airport",
            departTime: "17:05",
            departDate: "T4, 24 tháng 1",

            toIata: "GRU",
            toName: "Sân bay Quốc tế Guarulhos",
            arriveTime: "05:40",
            arriveDate: "T5, 25 tháng 1",

            durationText: "24 giờ 35 phút",
          },
        ],

        // ✅ quá cảnh dạng B (chỉ 1 dòng)
        layover: {
          type: "normal",
          durationText: "1 giờ 20 phút",
        },
      },
    ],

    operatedBy:
      "Air Asia, AirasiaX SDN BHD, LATAM, điều hành bởi Japan Airlines For Latam Airlines Group",

    baggageDetails: {
      personal: {
        title: "1 túi xách nhỏ",
        desc: "Phải vừa với gầm ghế phía trước chỗ ngồi của bạn",
      },
      carryOn: {
        title: "1 hành lý cabin",
        desc: "23 x 36 x 56 cm · Trọng lượng tối đa 5 kg",
      },
    },
    ticketRules: [
      {
        icon: "bi-arrow-repeat",
        text: "Bạn được phép đổi chuyến bay này, có trả phí",
      },
      {
        icon: "bi-x-circle",
        text: "Bạn được phép huỷ chuyến bay này, có trả phí",
      },
    ],
    extras: [
      {
        icon: "bi-luggage",
        title: "Hành lý ký gửi",
        sub: "Từ VND 560.489,98",
        note: "Có ở các bước tiếp theo",
      },
      {
        icon: "bi-calendar2-check",
        title: "Vé linh động",
        sub: "Có thể đổi ngày + VND 310.868,87 cho tất cả hành khách",
        note: "Có ở các bước tiếp theo",
      },
    ],
  },
];

// default filter (mình tách thành function để Set luôn đúng)
export const createDefaultFlightFilters = (airlineNames = []) => ({
  stops: "any",
  durationMax: 54,
  timeTab: "outbound",
  departBins: new Set(),
  arriveBins: new Set(),
  airlines: new Set(airlineNames), // tick hết
});
