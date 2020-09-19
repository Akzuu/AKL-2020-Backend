const user1 = {
  username: 'Chroma',
  firstname: 'Niggel',
  surname: 'leissön',
  age: '22',
  guild: 'Skilta',
  university: 'Tuni',
  email: 'niggel.leisson@tuni.fi',
  password: 'morjenttes',
  roles: ['moderator', 'player'],
  registrationComplete: true,
  emailConfirmed: true,
};

const user2 = {
  username: 'Ghibli',
  firstname: 'Hayo',
  surname: 'Miyazaki',
  age: '75',
  guild: 'MIK',
  university: 'Tuni',
  email: 'Hayo.Miyazaki@tuni.fi',
  password: 'moromoro',
  roles: ['player', 'unConfirmedEmail'],
  registrationComplete: true,
  emailConfirmed: false,
};

const user3 = {
  username: 'Disguised Owl',
  firstname: 'Mika',
  surname: 'Häkkinen',
  age: '46',
  guild: 'TiTe',
  university: 'Tuni',
  email: 'mika.hakkinen@tuni.fi',
  password: 'halojata',
  roles: ['player'],
  registrationComplete: true,
  emailConfirmed: true,
};

const user4 = {
  username: 'Yaroslawa',
  firstname: 'Igor',
  surname: '',
  age: '36',
  guild: '',
  university: 'TAMK',
  email: 'igor@tamk.fi',
  password: 'yugoslavia',
  roles: ['player', 'unConfirmedEmail'],
  registrationComplete: true,
  emailConfirmed: false,
};

const season1 = {
  seasonName: '[ALL] Season',
  seasonNumber: '1',
  division: 'pro',
  informationText: 'Teretulloo liigan ensimmäiseen kauteen',
  year: 2020,
  game: 'lol',
};

const season2 = {
  seasonName: '[AKL] Season',
  seasonNumber: '4',
  division: 'pro',
  informationText: 'Teretulloo liigan neljänteen kauteen',
  year: 2020,
  game: 'csgo',
};

const season3 = {
  seasonName: '[AKL] Season',
  seasonNumber: '4',
  division: 'just for fun',
  informationText: 'Teretulloo liigan neljänteen kauteen',
  year: 2020,
  game: 'csgo',
};

const team1 = {
  teamName: 'Käyrikset',
  abbreviation: 'KÄYR',
  introductionText: 'Me ollaa käyrikset!',
  hidden: false,
  game: 'lol',
  rank: 'Silver 1',
  members: [],
};

const testUserDataArray = [user1, user2, user3, user4];

const testSeasonDataArray = [season1, season2, season3];

const testTeamDataArray = [team1];

module.exports = {
  testUserDataArray,
  testSeasonDataArray,
  testTeamDataArray,
};
