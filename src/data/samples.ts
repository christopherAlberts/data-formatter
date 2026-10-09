export const sampleBookingJSON = `{
  "client_ref": "1030",
  "basket_id": "7422a10dd59ba3224ea6772bb",
  "journeys": [
    {
      "from_destination": 14888,
      "to_destination": 14794,
      "accommodation_name_from": "London Heathrow Airport (LHR)",
      "accommodation_street_from": "London Heathrow Airport",
      "accommodation_name_to": "London City Centre",
      "accommodation_street_to": "London City Centre",
      "travel_date": "2026-11-26",
      "flight_ship_train_time": "",
      "flight_ship_train_number": "",
      "adults": 2,
      "children": 0,
      "hold_luggage": 2,
      "lead_surname": "Smith",
      "lead_firstname": "John",
      "lead_title": "Mr",
      "email": "john.smith@example.com",
      "mobile": "+15550100123",
      "transfer_type": "PRIV",
      "children_age_seat": [],
      "notes": "TH10002130"
    },
    {
      "from_destination": 14794,
      "to_destination": 15001,
      "accommodation_name_from": "London City Centre",
      "accommodation_street_from": "London City Centre",
      "accommodation_name_to": "Manchester Piccadilly Station",
      "accommodation_street_to": "Piccadilly Station",
      "travel_date": "2026-11-28",
      "flight_ship_train_time": "14:30",
      "flight_ship_train_number": "VT2045",
      "adults": 2,
      "children": 1,
      "hold_luggage": 3,
      "lead_surname": "Smith",
      "lead_firstname": "John",
      "lead_title": "Mr",
      "email": "john.smith@example.com",
      "mobile": "+15550100123",
      "transfer_type": "SHARED",
      "children_age_seat": [
        {"age": 8, "seat_type": "booster"}
      ],
      "notes": ""
    },
    {
      "from_destination": 15001,
      "to_destination": 14888,
      "accommodation_name_from": "Manchester Piccadilly Station",
      "accommodation_street_from": "Piccadilly Station",
      "accommodation_name_to": "London Heathrow Airport (LHR)",
      "accommodation_street_to": "London Heathrow Airport",
      "travel_date": "2026-12-01",
      "flight_ship_train_time": "09:15",
      "flight_ship_train_number": "BA2190",
      "adults": 2,
      "children": 1,
      "hold_luggage": 3,
      "lead_surname": "Smith",
      "lead_firstname": "John",
      "lead_title": "Mr",
      "email": "john.smith@example.com",
      "mobile": "+15550100123",
      "transfer_type": "PRIV",
      "children_age_seat": [
        {"age": 8, "seat_type": "booster"}
      ],
      "notes": "Please wait at arrivals"
    }
  ]
}`;

export const sampleBookingXML = `<?xml version="1.0" encoding="UTF-8"?>
<booking>
  <client_ref>1030</client_ref>
  <basket_id>7422a10dd59ba3224ea6772bb</basket_id>
  <journeys>
    <journey>
      <from_destination>14888</from_destination>
      <to_destination>14794</to_destination>
      <accommodation_name_from>London Heathrow Airport (LHR)</accommodation_name_from>
      <accommodation_street_from>London Heathrow Airport</accommodation_street_from>
      <accommodation_name_to>London City Centre</accommodation_name_to>
      <accommodation_street_to>London City Centre</accommodation_street_to>
      <travel_date>2026-11-26</travel_date>
      <flight_ship_train_time></flight_ship_train_time>
      <flight_ship_train_number></flight_ship_train_number>
      <adults>2</adults>
      <children>0</children>
      <hold_luggage>2</hold_luggage>
      <lead_surname>Smith</lead_surname>
      <lead_firstname>John</lead_firstname>
      <lead_title>Mr</lead_title>
      <email>john.smith@example.com</email>
      <mobile>+15550100123</mobile>
      <transfer_type>PRIV</transfer_type>
      <children_age_seat></children_age_seat>
      <notes>TH10002130</notes>
    </journey>
    <journey>
      <from_destination>14794</from_destination>
      <to_destination>15001</to_destination>
      <accommodation_name_from>London City Centre</accommodation_name_from>
      <accommodation_street_from>London City Centre</accommodation_street_from>
      <accommodation_name_to>Manchester Piccadilly Station</accommodation_name_to>
      <accommodation_street_to>Piccadilly Station</accommodation_street_to>
      <travel_date>2026-11-28</travel_date>
      <flight_ship_train_time>14:30</flight_ship_train_time>
      <flight_ship_train_number>VT2045</flight_ship_train_number>
      <adults>2</adults>
      <children>1</children>
      <hold_luggage>3</hold_luggage>
      <lead_surname>Smith</lead_surname>
      <lead_firstname>John</lead_firstname>
      <lead_title>Mr</lead_title>
      <email>john.smith@example.com</email>
      <mobile>+15550100123</mobile>
      <transfer_type>SHARED</transfer_type>
      <children_age_seat>
        <child>
          <age>8</age>
          <seat_type>booster</seat_type>
        </child>
      </children_age_seat>
      <notes></notes>
    </journey>
  </journeys>
</booking>`;

export const sampleBookingYAML = `client_ref: "1030"
basket_id: "7422a10dd59ba3224ea6772bb"
journeys:
  - from_destination: 14888
    to_destination: 14794
    accommodation_name_from: "London Heathrow Airport (LHR)"
    accommodation_street_from: "London Heathrow Airport"
    accommodation_name_to: "London City Centre"
    accommodation_street_to: "London City Centre"
    travel_date: "2026-11-26"
    flight_ship_train_time: ""
    flight_ship_train_number: ""
    adults: 2
    children: 0
    hold_luggage: 2
    lead_surname: Smith
    lead_firstname: John
    lead_title: Mr
    email: john.smith@example.com
    mobile: "+15550100123"
    transfer_type: PRIV
    children_age_seat: []
    notes: TH10002130
  - from_destination: 14794
    to_destination: 15001
    accommodation_name_from: "London City Centre"
    accommodation_street_from: "London City Centre"
    accommodation_name_to: "Manchester Piccadilly Station"
    accommodation_street_to: "Piccadilly Station"
    travel_date: "2026-11-28"
    flight_ship_train_time: "14:30"
    flight_ship_train_number: VT2045
    adults: 2
    children: 1
    hold_luggage: 3
    lead_surname: Smith
    lead_firstname: John
    lead_title: Mr
    email: john.smith@example.com
    mobile: "+15550100123"
    transfer_type: SHARED
    children_age_seat:
      - age: 8
        seat_type: booster
    notes: ""`;

export const sampleBookingCSV = `from_destination,to_destination,accommodation_name_from,accommodation_name_to,travel_date,flight_time,adults,children,lead_surname,lead_firstname,email,transfer_type,notes
14888,14794,"London Heathrow Airport (LHR)","London City Centre",2026-11-26,,2,0,Smith,John,john.smith@example.com,PRIV,TH10002130
14794,15001,"London City Centre","Manchester Piccadilly Station",2026-11-28,14:30,2,1,Smith,John,john.smith@example.com,SHARED,
15001,14888,"Manchester Piccadilly Station","London Heathrow Airport (LHR)",2026-12-01,09:15,2,1,Smith,John,john.smith@example.com,PRIV,Please wait at arrivals`;

export const sampleBookingPython = `{
    'client_ref': '1030',
    'basket_id': '7422a10dd59ba3224ea6772bb',
    'journeys': [
        {
            'from_destination': 14888,
            'to_destination': 14794,
            'accommodation_name_from': 'London Heathrow Airport (LHR)',
            'accommodation_street_from': 'London Heathrow Airport',
            'accommodation_name_to': 'London City Centre',
            'accommodation_street_to': 'London City Centre',
            'travel_date': '2026-11-26',
            'flight_ship_train_time': '',
            'flight_ship_train_number': '',
            'adults': 2,
            'children': 0,
            'hold_luggage': 2,
            'lead_surname': 'Smith',
            'lead_firstname': 'John',
            'lead_title': 'Mr',
            'email': 'john.smith@example.com',
            'mobile': '+15550100123',
            'transfer_type': 'PRIV',
            'children_age_seat': [],
            'notes': 'TH10002130',
            'is_active': True,
            'cancellation': None,
        },
        {
            'from_destination': 14794,
            'to_destination': 15001,
            'accommodation_name_from': 'London City Centre',
            'accommodation_name_to': 'Manchester Piccadilly Station',
            'travel_date': '2026-11-28',
            'flight_ship_train_time': '14:30',
            'adults': 2,
            'children': 1,
            'lead_surname': 'Smith',
            'lead_firstname': 'John',
            'email': 'john.smith@example.com',
            'transfer_type': 'SHARED',
            'children_age_seat': [
                {'age': 8, 'seat_type': 'booster'},
            ],
            'notes': '',
            'is_active': True,
            'cancellation': False,
        },
    ],
}`;

export const samples = {
  json: { name: 'Booking (JSON)', data: sampleBookingJSON },
  xml: { name: 'Booking (XML)', data: sampleBookingXML },
  yaml: { name: 'Booking (YAML)', data: sampleBookingYAML },
  csv: { name: 'Booking (CSV)', data: sampleBookingCSV },
  python: { name: 'Booking (Python)', data: sampleBookingPython },
};
