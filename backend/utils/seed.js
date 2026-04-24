const bcrypt = require('bcryptjs');
const { Roles } = require('./constants');
const { User, Department, Area } = require('../models');

async function seedBasics() {
  // Create a default SUPER_ADMIN for first login
  const superEmail = 'superadmin@example.com';
  const existing = await User.findOne({ where: { email: superEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash('SuperAdmin@123', 10);
    await User.create({
      name: 'Super Admin',
      address: 'HQ',
      pincode: '000000',
      contact: '0000000000',
      email: superEmail,
      password: passwordHash,
      role: Roles.SUPER_ADMIN,
    });
  }

  const departments = [
    { name: 'Roads & Infrastructure', category: 'Infrastructure', description: 'Road maintenance, potholes, etc.' },
    { name: 'Water Supply', category: 'Infrastructure', description: 'Water shortage, pipeline leaks' },
    { name: 'Electricity', category: 'Infrastructure', description: 'Power cuts, streetlights' },
    { name: 'Garbage & Sanitation', category: 'Sanitation & Health', description: 'Waste collection, public cleanliness' },
    { name: 'Sewage & Drainage', category: 'Sanitation & Health', description: 'Blocked drains, sewage overflow' },
    { name: 'Street Lighting', category: 'Infrastructure', description: 'Defective streetlights' },
    { name: 'Public Transport', category: 'Transport', description: 'Buses, trains, transit issues' },
    { name: 'Traffic & Parking', category: 'Transport', description: 'Traffic jams, illegal parking' },
    { name: 'Police & Safety', category: 'Public Safety', description: 'Law enforcement, safety concerns' },
    { name: 'Fire Department', category: 'Public Safety', description: 'Fire hazards, emergency response' },
    { name: 'Health Services', category: 'Sanitation & Health', description: 'Public health, epidemics' },
    { name: 'Government Hospitals', category: 'Sanitation & Health', description: 'Hospital facilities, negligence' },
    { name: 'Education & Schools', category: 'Civic Services', description: 'Public schools, education quality' },
    { name: 'Parks & Recreation', category: 'Civic Services', description: 'Park maintenance, public spaces' },
    { name: 'Environment & Pollution', category: 'Environment', description: 'Air/water pollution, tree cutting' },
    { name: 'Noise Pollution', category: 'Environment', description: 'Loudspeakers, industrial noise' },
    { name: 'Building & Construction', category: 'Urban Planning', description: 'Illegal construction, building safety' },
    { name: 'Illegal Encroachment', category: 'Urban Planning', description: 'Squatters, footpath encroachment' },
    { name: 'Property Tax', category: 'Administration', description: 'Tax discrepancies, billing' },
    { name: 'Public Toilets', category: 'Sanitation & Health', description: 'Maintenance, hygiene' },
    { name: 'Animal Control', category: 'Animal Services', description: 'Dangerous animals' },
    { name: 'Stray Animals', category: 'Animal Services', description: 'Stray dogs, cattle' },
    { name: 'Disaster Management', category: 'Public Safety', description: 'Floods, earthquakes, preparedness' },
    { name: 'Internet & Telecom', category: 'Infrastructure', description: 'Public Wi-Fi, telecom cables' },
    { name: 'Smart City Services', category: 'Administration', description: 'Digital initiatives, smart tech' },
    { name: 'Urban Development', category: 'Urban Planning', description: 'City planning, zoning' },
    { name: 'Rural Development', category: 'Administration', description: 'Village infrastructure' },
    { name: 'Food Safety', category: 'Sanitation & Health', description: 'Adulteration, hygiene in restaurants' },
    { name: 'Consumer Complaints', category: 'Administration', description: 'Unfair trade, cheating' },
    { name: 'Other', category: 'Other', description: 'Miscellaneous issues' },
  ];

  await Department.bulkCreate(departments, { ignoreDuplicates: true });

  // Minimal example areas (edit as needed)
  const areas = [
    { name: 'Central', pincode: '110001' },
    { name: 'North', pincode: '110002' },
  ];
  
  for (const a of areas) {
    // eslint-disable-next-line no-await-in-loop
    await Area.findOrCreate({ where: { name: a.name, pincode: a.pincode }, defaults: a });
  }
}

module.exports = { seedBasics };